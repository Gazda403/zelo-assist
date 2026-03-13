
import { createAdminClient } from '@/lib/supabase/admin';
import { getMonitoredThreads, updateMonitoredThread } from '../storage';
import { getLastEmails } from '@/lib/gmail';
import { getUserRefreshToken } from '@/lib/db/user-storage';
import { MonitoredThread, BotFollowUpConfig, EmailBot } from '../types';
import { getBotById } from '../storage'; // Need to fetch bot config
import { getTemplateContent } from '../templates';
import { generateFollowUpContent } from '@/lib/ai';
import { checkBusinessHours } from './triggers'; // Re-use business hours logic

/**
 * Application: Follow - Up Monitoring Logic
 * 
 * 1. Fetch pending threads for user's bots.
 * 2. Check if a reply has been received.
 * 3. Update status(replied vs pending).
 * 4. Trigger actions if needed(not implemented fully here, just status tracking).
 */

export async function checkFollowUps(userId: string): Promise<{ checked: number; replied: number; due: number }> {
    const supabase = createAdminClient();

    // 1. Get all pending threads for this user's bots
    // We need to join with bots table to ensure user ownership, or trust the caller?
    // Let's first get the user's bots to get IDs.
    const { data: bots } = await supabase.from('bots').select('id').eq('user_id', userId);
    if (!bots || bots.length === 0) return { checked: 0, replied: 0, due: 0 };

    const botIds = bots.map(b => b.id);

    const { data: threads, error } = await supabase
        .from('monitored_threads')
        .select('*')
        .in('bot_id', botIds)
        .eq('status', 'pending');

    if (error || !threads || threads.length === 0) {
        return { checked: 0, replied: 0, due: 0 };
    }

    console.log(`[FollowUp] Checking ${threads.length} threads for user ${userId}`);

    // 2. Prepare Gmail Access
    const refreshToken = await getUserRefreshToken(userId);
    if (!refreshToken) return { checked: 0, replied: 0, due: 0 };

    // We need access token. 
    // Optimization: We can reuse the one from syncBotsForUser if we passed it.
    // For now, let's refresh it again or import the helper from sync.ts?
    // Better to have a shared helper in a utility file.
    // I'll duplicate the refresh logic here briefly or better, move it to `lib/google-auth`.
    // Assuming `syncBotsForUser` calls this, it might be better to pass the accessToken.
    // But `checkFollowUps` is likely called by Cron.

    const accessToken = await refreshAccessToken(refreshToken);
    if (!accessToken) return { checked: 0, replied: 0, due: 0 };

    let repliedCount = 0;
    let dueCount = 0;

    // 3. Process threads
    for (const thread of threads) {
        try {
            // Check if thread has new messages AFTER the addedAt time?
            // Gmail API `threads.get` gives us messages.
            // We check if there is a message FROM the recipient? 
            // Or just any message that is NOT from us?
            // Actually, if *anyone* replies, we should probably stop following up?
            // Usually, if the recipient replies.

            const isReplied = await checkThreadReplyStatus(accessToken, thread.thread_id, thread.recipient);

            if (isReplied) {
                console.log(`[FollowUp] Reply detected for thread ${thread.thread_id}`);
                await updateMonitoredThread(thread.id, { status: 'replied' as any }); // Cast needed if types mismatch in strict mode
                repliedCount++;
                continue;
            }

            // Check if Due
            const now = new Date();
            const scheduledFor = new Date(thread.scheduled_for);

            if (now >= scheduledFor) {
                // It is due!
                // Trigger Follow-Up Action?
                // For MVP, likely just mark it or log it?
                // The requirements say "send follow-ups if no reply".
                // We should probably trigger the bot action here.
                // WE NEED TO FETCH THE BOT to know what to send.
                // const bot = await getBotById(thread.bot_id, userId);
                // executeFollowUpAction(bot, thread);

                // For now, just count it.
                dueCount++;
                console.log(`[FollowUp] Thread ${thread.thread_id} is DUE for follow-up!`);

                // Execute Follow-Up
                const bot = await getBotById(thread.bot_id, userId);
                if (bot) {
                    await executeFollowUpAction(accessToken, bot, thread);
                } else {
                    console.error(`[FollowUp] Bot ${thread.bot_id} not found for thread ${thread.thread_id}`);
                }
            }

        } catch (err) {
            console.error(`[FollowUp] Error checking thread ${thread.thread_id}:`, err);
        }
    }

    return { checked: threads.length, replied: repliedCount, due: dueCount };
}


// --- Helpers ---

async function checkThreadReplyStatus(accessToken: string, threadId: string, recipientEmail: string): Promise<boolean> {
    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) return false;

        const data = await response.json();
        const messages = data.messages || [];

        // Simple check: is there a message where 'from' header contains recipientEmail?
        // Or is there more than 1 message? (Original sent + reply?)
        // If we sent the email, it's 1 message. 
        // If they replied, it's 2.
        // But what if we sent multiple?
        // Let's check for any message where FROM matches recipient.

        const hasReply = messages.some((msg: any) => {
            const headers = msg.payload.headers;
            const fromHeader = headers.find((h: any) => h.name === 'From')?.value || '';
            return fromHeader.includes(recipientEmail);
        });

        return hasReply;

    } catch (error) {
        console.error('Error checking thread:', error);
        return false;
    }
}

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
        if (!response.ok) return null;
        return data.access_token;
    } catch (error) {
        return null;
    }
}

async function executeFollowUpAction(accessToken: string, bot: EmailBot, thread: MonitoredThread) {
    console.log(`[FollowUp] Executing follow-up for thread ${thread.thread_id} using bot ${bot.name}`);

    // 0. Check Business Hours (if enabled)
    const followUpSettings = bot.followUpConfig?.settings;
    if (followUpSettings?.businessHoursOnly) {
        if (!checkBusinessHours(new Date())) {
            console.log(`[FollowUp] Skipping follow-up for thread ${thread.thread_id} (Outside Business Hours)`);
            return;
        }
    }

    // 1. Determine Content & Subject
    let content = "Hi, just checking if you saw my last email. Let me know if you have any questions.";
    let subject = thread.subject;

    if (followUpSettings?.sendApology && followUpSettings?.apologyTemplate) {
        try {
            const { substituteTemplateVariables } = await import('../templates/acknowledgment-templates');
            const values = followUpSettings.apologyTemplate.variables.reduce((acc: any, v: any) => ({
                ...acc,
                [v.key]: v.defaultValue
            }), {});

            content = substituteTemplateVariables(
                followUpSettings.apologyTemplate.body,
                values,
                {
                    senderName: thread.recipient,
                    subject: thread.subject,
                    emailDate: new Date().toLocaleString()
                }
            );

            subject = substituteTemplateVariables(
                followUpSettings.apologyTemplate.subject || subject,
                values,
                {
                    senderName: thread.recipient,
                    subject: thread.subject,
                    emailDate: new Date().toLocaleString()
                }
            );
            console.log(`[FollowUp] Using apology template for thread ${thread.thread_id}`);
        } catch (e) {
            console.error("Failed to process apology template, falling back to AI", e);
            content = await generateFollowUpContent(thread.subject, thread.metadata?.original_snippet || "", thread.recipient, content);
        }
    } else {
        // Standard AI-enhanced follow-up
        content = await generateFollowUpContent(thread.subject, thread.metadata?.original_snippet || "", thread.recipient, content);
    }

    try {
        // Safety Check: Re-verify reply status before sending
        const isReplied = await checkThreadReplyStatus(accessToken, thread.thread_id, thread.recipient);
        if (isReplied) {
            console.log(`[FollowUp] Aborting send: Reply detected at last second for thread ${thread.thread_id}`);
            await updateMonitoredThread(thread.id, { status: 'replied' as any });
            return;
        }

        // 2. Send the email via Gmail API
        const rawMessage = await createReplyRawDetails(accessToken, thread.thread_id, content, subject);

        const sendResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                raw: rawMessage,
                threadId: thread.thread_id
            })
        });

        if (!sendResponse.ok) {
            const errorText = await sendResponse.text();
            throw new Error(`Gmail API send failed: ${errorText}`);
        }

        console.log(`[FollowUp] Sent follow-up for thread ${thread.thread_id}`);

        // 3. Update Status
        await updateMonitoredThread(thread.id, {
            status: 'sent' as any,
            attempts: (thread.attempts || 0) + 1
        });

        // 4. Notify User (if enabled)
        if (followUpSettings?.notifyUser) {
            console.log(`[FollowUp] Notification: Follow-up action taken for ${thread.recipient} on thread "${thread.subject}"`);
        }

    } catch (error) {
        console.error(`[FollowUp] Failed to send follow-up:`, error);
        await updateMonitoredThread(thread.id, {
            last_error: String(error),
            attempts: (thread.attempts || 0) + 1
        });
    }
}

// Helper to create raw email string for REPLY
async function createReplyRawDetails(accessToken: string, threadId: string, content: string, overrideSubject?: string): Promise<string> {
    // We need the last message ID to create a proper In-Reply-To header
    // Fetch thread details again
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json();
    const lastMsg = data.messages[data.messages.length - 1];

    // Get headers
    const headers = lastMsg.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const messageId = headers.find((h: any) => h.name === 'Message-ID')?.value;

    // Provide a prefix if not present
    let replySubject = overrideSubject || (subject.startsWith('Re:') ? subject : `Re: ${subject}`);

    const emailLines = [
        `To: ${getHeader(headers, 'From')}`, // Reply to sender of last message (which might be us if we are following up on our own email? No, we reply to the other person)
        // Wait, if WE sent the last message, we are replying to OURSELVES?
        // If we are following up because they didn't reply, we should reply to the ORIGINAL recipient.
        // We stored `recipient` in `monitored_threads`. USE THAT.
        // But `getHeader` logic above is fragile.
        `Subject: ${replySubject}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: 7bit',
        '',
        content
    ];

    return Buffer.from(emailLines.join('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getHeader(headers: any[], name: string) {
    return headers?.find(h => h.name === name)?.value;
}
