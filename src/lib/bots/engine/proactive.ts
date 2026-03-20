
import { createAdminClient } from '@/lib/supabase/admin';
import { executeBots } from './orchestrator';
import { google } from 'googleapis';
import { EmailEvent, EmailThreadInactiveForConfig } from '../types';

/**
 * Checks for proactive triggers (events not caused by incoming email)
 * Currently supports: email_thread_inactive_for
 */
export async function checkProactiveTriggers(userId: string, accessToken: string) {
    const supabase = createAdminClient();

    // 1. Fetch bots with 'email_thread_inactive_for' trigger
    const { data: bots } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true)
        .eq('trigger->>type', 'email_thread_inactive_for');

    if (!bots || bots.length === 0) return;

    console.log(`[Proactive] Found ${bots.length} bots with inactivity triggers`);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    // 2. We need to find candidate threads.
    // Strategy: Look for threads where the LAST message was sent by ME, and is older than X.
    // Searching "from:me -in:chats" to get recent sent messages.

    // We can't search simply for "inactive for X hours" via API easily without loop.
    // We can search "from:me newer_than:30d" and process.

    const { data: { messages } } = await gmail.users.messages.list({
        userId: 'me',
        q: 'from:me -in:chats newer_than:7d', // Limit to recent 7 days to avoid huge processing
        maxResults: 20
    });

    if (!messages) return;

    // Deduplicate threads
    const threadIds = Array.from(new Set(messages.map(m => m.threadId!)));

    for (const threadId of threadIds) {
        // Fetch thread details
        const { data: thread } = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
        });

        if (!thread.messages || thread.messages.length === 0) continue;

        const lastMessage = thread.messages[thread.messages.length - 1];

        // Check if last message is from ME (sent)
        // If the last message is from someone else, it's not "inactive waiting for response", it's "waiting for me".
        // The user requirement "inactive... useful for follow-ups" implies we are waiting for THEM.
        // So last message should be from US.

        // Wait, "from:me" search above guarantees the messages we found are from me, 
        // but the THREAD might have a newer message from someone else.

        // We need to check if the *actual* last message in thread is from me.
        // Or if the last message is from them, maybe we want to remind OURSELVES to reply?
        // Let's assume "Follow-up" use case -> Last message was from ME.

        // Resolve "Me" logic: check label SENT or check payload headers?
        // Simplify: Check if `labelIds` includes 'SENT' for the last message? 
        // Incoming messages don't have SENT usually.
        const isLastFromMe = lastMessage.labelIds?.includes('SENT');

        if (!isLastFromMe) continue; // They replied, or it's not a thread we are waiting on.

        const lastMsgDate = new Date(parseInt(lastMessage.internalDate!));
        const now = new Date();
        const diffHours = (now.getTime() - lastMsgDate.getTime()) / (1000 * 60 * 60);

        // Evaluate against bots
        for (const bot of bots) {
            const config = bot.trigger.config as EmailThreadInactiveForConfig;
            let thresholdHours = config.hours || 0;
            if (config.days) thresholdHours += config.days * 24;

            if (diffHours >= thresholdHours) {
                // Trigger!

                // Check simple deduplication: Has this bot processed this thread recently?
                // We don't want to spam follow-ups every sync cycle.
                // We should check `bot_execution_logs` for `threadId` + `botId` in the last X interval?
                // Or maybe just once per "inactivity period"?
                // Let's rely on `bot_execution_logs` check.

                // Deduplication: Check if we already ran for this specific inactive state (defined by lastMessage.id)
                const hasRun = await hasBotRunForInactivity(supabase, bot.id, lastMessage.id!);
                if (hasRun) continue;

                console.log(`[Proactive] Triggering bot ${bot.name} for inactive thread ${threadId}`);

                // Construct a synthetic event
                const event: EmailEvent = {
                    type: 'thread_check',
                    emailId: lastMessage.id!, // Reference last message
                    threadId: threadId,
                    date: lastMsgDate.toISOString(),
                    sender: { name: 'Me', email: 'me' }, // Synthetic
                    subject: getHeader(lastMessage.payload?.headers || [], 'Subject') || '',
                    body: lastMessage.snippet || '',
                    snippet: lastMessage.snippet || '',
                    read: true,
                    // Pass inactive duration in metadata or custom field if needed
                };

                // Execute
                await executeBots(event, userId, [bot]);
            }
        }
    }

    // Check for "Outgoing Email Sent" triggers (Mode A: Auto Follow-Up)
    await checkOutgoingEmailTriggers(userId, accessToken, supabase);
}

/**
 * Checks for "Outgoing Email Sent" triggers
 * Scans recent sent emails and adds them to monitoring if they match bot criteria.
 */
async function checkOutgoingEmailTriggers(userId: string, accessToken: string, supabase: any) {
    // 1. Fetch bots with 'outgoing_email_sent' trigger
    const { data: bots } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true)
        .eq('trigger->>type', 'outgoing_email_sent');

    if (!bots || bots.length === 0) return;

    console.log(`[Proactive] Found ${bots.length} bots with outgoing email triggers`);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    // 2. Scan recent SENT messages (last 24h to be safe, but we only process new ones)
    // We can use historyId if we stored it, but for now, simple time-based.
    const { data: { messages } } = await gmail.users.messages.list({
        userId: 'me',
        q: 'from:me -in:chats newer_than:1d',
        maxResults: 50
    });

    if (!messages) return;

    // Deduplicate threads? No, we process MESSAGES, but we monitor THREADS.
    // If I send 2 emails in a thread, do I monitor twice?
    // Usually we monitor the THREAD. If I send a 2nd email, maybe reset the timer?
    // Let's stick to: Ensure thread is monitored.

    for (const msg of messages) {
        // Fast check: Have we already monitored this thread for this bot?
        // We need to check for EACH bot.

        // Fetch message details to check domains/content
        const { data: message } = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
        });

        const headers = message.payload?.headers || [];
        const to = getHeader(headers, 'To') || '';
        const subject = getHeader(headers, 'Subject') || '';
        const threadId = message.threadId!;

        for (const bot of bots) {
            // 3. Check if we are already monitoring this thread
            const { data: existing } = await supabase
                .from('monitored_threads')
                .select('id')
                .eq('bot_id', bot.id)
                .eq('thread_id', threadId)
                .neq('status', 'cancelled') // If cancelled, maybe we re-enable? For now, ignore if exists.
                .limit(1)
                .single();

            if (existing) continue;

            // 4. Check Bot Config (Filters)
            const config = bot.trigger.config as any; // OutgoingEmailSentConfig

            // Check Exclusions
            if (config.excludeDomains && config.excludeDomains.length > 0) {
                // Check if 'to' contains any excluded domain
                const hasExcludedDomain = config.excludeDomains.some((d: string) => to.includes(d));
                if (hasExcludedDomain) continue;
            }

            if (config.excludeKeywords && config.excludeKeywords.length > 0) {
                const hasExcludedKeyword = config.excludeKeywords.some((k: string) => subject.toLowerCase().includes(k.toLowerCase()));
                if (hasExcludedKeyword) continue;
            }

            // 5. Calculate Schedule Time
            // Get delay from Bot FollowUpConfig
            const followUpConfig = bot.followUpConfig?.settings || {};
            const scheduledFor = new Date();

            if (followUpConfig.smartDelay) {
                // Try to find the promised response time from acknowledgment template
                const mainTemplate = bot.actions.find((a: any) => a.type === 'auto_send_email')?.config.acknowledgmentTemplate;
                const responseTimeVar = mainTemplate?.variables.find((v: any) => v.key === 'response_time');
                const promisedValue = responseTimeVar?.defaultValue || "2 days";

                // Simple parsing: "3-5 business days" -> 5, "24 hours" -> 24
                const numbers = promisedValue.match(/\d+/g);
                const maxVal = numbers ? Math.max(...(numbers.map((n: string) => Number(n)))) : 2;
                const isHours = promisedValue.toLowerCase().includes('hour');

                if (isHours) {
                    scheduledFor.setHours(scheduledFor.getHours() + maxVal + 24); // +24h buffer
                } else {
                    scheduledFor.setDate(scheduledFor.getDate() + maxVal + 1); // +1 day buffer
                }
            } else {
                const delayValue = followUpConfig.delayValue || 2;
                const delayUnit = followUpConfig.delayUnit || 'days';

                if (delayUnit === 'days') {
                    scheduledFor.setDate(scheduledFor.getDate() + delayValue);
                } else {
                    scheduledFor.setHours(scheduledFor.getHours() + delayValue);
                }
            }

            // 6. Add to Monitor
            console.log(`[Proactive] Auto-monitoring thread ${threadId} for bot ${bot.name}`);

            await supabase.from('monitored_threads').insert({
                bot_id: bot.id,
                thread_id: threadId,
                subject: subject,
                recipient: to, // Might contain name <email>, simple string for now
                added_at: new Date().toISOString(),
                scheduled_for: scheduledFor.toISOString(),
                status: 'pending',
                attempts: 0,
                metadata: {
                    original_message_id: msg.id,
                    original_snippet: message.snippet
                }
            });
        }
    }
}

function getHeader(headers: any[], name: string) {
    return headers?.find(h => h.name === name)?.value;
}

// Check if bot ran for this specific "inactivity state" (last message ID)
async function hasBotRunForInactivity(supabase: any, botId: string, lastMessageId: string) {
    const { data } = await supabase
        .from('bot_execution_logs')
        .select('id')
        .eq('bot_id', botId)
        .eq('email_id', lastMessageId)
        .limit(1)
        .single();

    return !!data;
}


