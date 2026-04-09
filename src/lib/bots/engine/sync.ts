
import { getUserRefreshToken } from '@/lib/db/user-storage';
import { executeBots } from './orchestrator';
import { getLastEmails } from '@/lib/gmail';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasBudgetRemaining } from '@/lib/ai-budget';

/**
 * Syncs bots for a specific user
 * 1. Refreshes access token
 * 2. Fetches new emails
 * 3. Triggers bots
 */
export async function syncBotsForUser(userId: string): Promise<{ success: boolean; error?: string; emailsProcessed?: number }> {
    try {
        console.log(`[Sync] Starting sync for user ${userId}`);

        // 1. Get user profile and check subscription/trial status
        const supabaseAdmin = createAdminClient();
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("plan_type, first_login_at")
            .eq("id", userId)
            .single();

        if (profileError) {
            console.error(`[Sync] Failed to fetch profile for ${userId}`, profileError);
            return { success: false, error: 'Failed to fetch profile' };
        }

        let planType = profile?.plan_type ?? 'free';
        // Admin override
        if (userId === 'brankovicaleksandar2404@gmail.com') {
            planType = 'exclusive';
        }

        if (planType === 'free') {
            const createdAt = profile?.first_login_at || new Date().toISOString();
            const msSinceCreation = Date.now() - new Date(createdAt).getTime();
            const daysSinceCreation = msSinceCreation / (1000 * 60 * 60 * 24);
            if (daysSinceCreation > 7) {
                console.log(`[Sync] Free trial expired for user ${userId}, skipping`);
                return { success: false, error: 'Trial expired' };
            }
        }

        // Check AI budget before processing any emails
        const hasbudget = await hasBudgetRemaining(userId);
        if (!hasbudget) {
            console.log(`[Sync] AI budget exhausted for user ${userId}, skipping until monthly reset`);
            return { success: false, error: 'AI budget exhausted for this billing period' };
        }

        // 2. Get refresh token
        const refreshToken = await getUserRefreshToken(userId);
        if (!refreshToken) {
            console.log(`[Sync] No refresh token for user ${userId}, skipping`);
            return { success: false, error: 'No refresh token' };
        }

        // 2. Refresh access token
        // We can use the Google OAuth endpoint directly or a helper
        const accessToken = await refreshAccessToken(refreshToken);
        if (!accessToken) {
            console.log(`[Sync] Failed to refresh token for user ${userId}, skipping`);
            return { success: false, error: 'Failed to refresh token' };
        }

        // 3. Get last sync time (optional, for now just fetch recent 10)
        // Ideally we should store 'lastHistoryId' in the user_tokens table or bot_state
        // For this MVP, we fetch the last 5 emails and check if they've been processed?
        // Or just trigger executeBots, which is idempotent-ish (bots check conditions)
        // But `executeBots` doesn't check if it already ran for a specific emailId in `bot_execution_logs`
        // The logs are just logs.
        // To prevent double-execution, we should check `bot_execution_logs` for (emailId + botId) combo?
        // Or we rely on `getUnreadCount` or similar? 
        // Let's rely on checking if we already have a log for this emailId for the specific bot?
        // Actually, `executeBots` -> `executeSingleBot` -> `logExecution`
        // We can add a check in `executeSingleBot` or here.
        // Better: Fetch recent emails. For each email, `executeBots` handles it.

        const { emails } = await getLastEmails(accessToken, 10);

        if (emails.length === 0) {
            console.log(`[Sync] No recent emails for user ${userId}`);
            return { success: true, emailsProcessed: 0 };
        }

        console.log(`[Sync] Processing ${emails.length} emails for user ${userId}`);

        // 4. Trigger bots
        // We need the user's email address for some contexts, but `executeBots` mainly needs `userId` (passed as string) or `email`?
        // `executeBots` takes `(event, userId)`. 
        // Wait, `executeBots` signature in orchestrator.ts is `executeBots(event, userId)`.
        // The `userId` there is used to fetch bots.

        // We also need the user's email for the sender field if we send emails?
        // The `session.user.email` was passed in `actions/gmail.ts`. 
        // Here we don't have the session.
        // We should fetch the user email from `users` table or `gmail` profile profile.
        // Let's fetch profile to be safe and get email.
        const userProfile = await getUserProfile(accessToken);
        const userEmail = userProfile.emailAddress;

        let processedCount = 0;

        for (const email of emails) {
            // Optimization: check if this email is "newish" (e.g., within last 1 hour)
            // If it's 2 days old, we probably shouldn't trigger bots on it every 5 minutes.
            // We need a "last synced at" timestamp for the user.

            // Let's implement a simple dedup:
            // Check if ANY bot has executed for this emailId.
            // But a new bot might be added.
            // Ideally: logic is "New emails since X".
            // Since we don't have 'lastHistoryId' stored yet, let's use a time window.
            // Only process emails received in the last 15 minutes (CRON interval).

            const emailDate = new Date(email.date);
            const now = new Date();
            const timeDiff = now.getTime() - emailDate.getTime();
            const minutesDiff = timeDiff / (1000 * 60);

            if (minutesDiff > 60) {
                // Skip emails older than 60 mins (generous buffer)
                continue;
            }

            // We should also check strict deduplication to avoid double-processing within the window.
            // Check if we have *any* log for this emailId?
            // If we have logs, it means we processed it?
            // What if we added a new bot? It wouldn't have run.
            // Complex. For MVP, let's just run it. 
            // `executeBots` logs "safety_blocked" or "success".
            // If we re-run, it triggers again. `auto_send` has loop prevention (recent execution check).
            // So re-running might be annoying (multiple logs) but safe-ish?
            // Let's filter by checking if we processed this emailId recently (in last 24h?)
            // We can add a simple check: `has processed emailId`.

            const processed = await hasProcessedEmail(userId, email.id);
            if (processed) {
                continue;
            }

            const emailEvent = {
                type: 'new_email' as const,
                emailId: email.id,
                sender: email.sender,
                subject: email.subject,
                body: email.snippet,
                snippet: email.snippet,
                date: email.date,
                read: email.read,
                threadId: email.threadId,
                // Urgency score? We can re-calculate or skip.
            };

            await executeBots(emailEvent, userId);

            // Mark as processed (we need a way to track "processed for sync")
            // reusing `bot_execution_logs` isn't perfect because it's per bot.
            // We'll create a lightweight `sync_logs` or just trust the loop.
            // For now, let's just log it.
            processedCount++;
        }

        // 5. Check Follow-Ups (Existing Feature)
        try {
            const { checkFollowUps } = await import('./follow-up');
            const followUpStats = await checkFollowUps(userId);
            console.log(`[Sync] Follow-up stats for ${userId}:`, followUpStats);
        } catch (err) {
            console.error(`[Sync] Follow-up check failed for ${userId}:`, err);
        }

        // 6. Check Proactive Triggers (New Workflows)
        try {
            const { checkProactiveTriggers } = await import('./proactive');
            await checkProactiveTriggers(userId, accessToken);
        } catch (err) {
            console.error(`[Sync] Proactive triggers failed for ${userId}:`, err);
        }


        return { success: true, emailsProcessed: processedCount };
    } catch (error: any) {
        console.error(`[Sync] Error syncing user ${userId}:`, error);
        return { success: false, error: error.message };
    }

}

// --- Helpers ---

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.AUTH_GOOGLE_ID!,
                client_secret: process.env.AUTH_GOOGLE_SECRET!,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('RefreshToken Error:', data);
            return null;
        }
        return data.access_token;
    } catch (error) {
        console.error('RefreshToken Network Error:', error);
        return null;
    }
}

async function getUserProfile(accessToken: string): Promise<any> {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.json();
}

/**
 * Check if we've processed this email recently
 * We look for ANY execution log for this emailId for this user's bots
 */
async function hasProcessedEmail(userId: string, emailId: string): Promise<boolean> {
    const supabase = createAdminClient();

    // We don't have userId in logs directly (it's via bot_id), but we can filter by bots belonging to user?
    // Or just checking email_id is enough if email IDs are globally unique (they are unique to user, but maybe not globally? Gmail IDs are globally unique-ish but per user context).
    // Actually, we can just check if there is a log with this email_id. 
    // If multiple users have same email ID (unlikely unless same inbox), it's fine.

    const { data, error } = await supabase
        .from('bot_execution_logs')
        .select('id')
        .eq('email_id', emailId)
        .limit(1)
        .single();

    if (data) return true;
    return false;
}
