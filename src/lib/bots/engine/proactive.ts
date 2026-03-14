
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

    const { data: { messages } } = await gmail.users.messages.list({
        userId: 'me',
        q: 'from:me -in:chats newer_than:7d', 
        maxResults: 20
    });

    if (!messages) return;

    const threadIds = Array.from(new Set(messages.map(m => m.threadId!)));

    for (const threadId of threadIds) {
        const { data: thread } = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
        });

        if (!thread.messages || thread.messages.length === 0) continue;

        const lastMessage = thread.messages[thread.messages.length - 1];
        const isLastFromMe = lastMessage.labelIds?.includes('SENT');

        if (!isLastFromMe) continue; 

        const lastMsgDate = new Date(parseInt(lastMessage.internalDate!));
        const now = new Date();
        const diffHours = (now.getTime() - lastMsgDate.getTime()) / (1000 * 60 * 60);

        for (const bot of bots) {
            const config = bot.trigger.config as EmailThreadInactiveForConfig;
            let thresholdHours = config.hours || 0;
            if (config.days) thresholdHours += config.days * 24;

            if (diffHours >= thresholdHours) {
                const hasRun = await hasBotRunForInactivity(supabase, bot.id, lastMessage.id!);
                if (hasRun) continue;

                console.log(`[Proactive] Triggering bot ${bot.name} for inactive thread ${threadId}`);

                const event: EmailEvent = {
                    type: 'thread_check',
                    emailId: lastMessage.id!, 
                    threadId: threadId,
                    date: lastMsgDate.toISOString(),
                    sender: { name: 'Me', email: 'me' }, 
                    subject: getHeader(lastMessage.payload?.headers || [], 'Subject') || '',
                    body: lastMessage.snippet || '',
                    snippet: lastMessage.snippet || '',
                    read: true,
                };

                await executeBots(event, userId, [bot]);
            }
        }
    }

    await checkOutgoingEmailTriggers(userId, accessToken, supabase);
}

async function checkOutgoingEmailTriggers(userId: string, accessToken: string, supabase: any) {
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

    const { data: { messages } } = await gmail.users.messages.list({
        userId: 'me',
        q: 'from:me -in:chats newer_than:1d',
        maxResults: 50
    });

    if (!messages) return;

    for (const msg of messages) {
        const { data: message } = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
        });

        const headers = message.payload?.headers || [];
        const to = getHeader(headers, 'To') || '';
        const subject = getHeader(headers, 'Subject') || '';
        const threadId = message.threadId!;

        for (const bot of bots) {
            const { data: existing } = await supabase
                .from('monitored_threads')
                .select('id')
                .eq('bot_id', bot.id)
                .eq('thread_id', threadId)
                .neq('status', 'cancelled') 
                .limit(1)
                .single();

            if (existing) continue;

            const config = bot.trigger.config as any; 
            const followUpConfig = bot.followUpConfig?.settings || {};
            const scheduledFor = new Date();

            if (followUpConfig.smartDelay) {
                const mainTemplate = bot.actions.find((a: any) => a.type === 'auto_send_email')?.config.acknowledgmentTemplate;
                const responseTimeVar = mainTemplate?.variables.find((v: any) => v.key === 'response_time');
                const promisedValue = responseTimeVar?.defaultValue || "2 days";

                const numbers = promisedValue.match(/\d+/g);
                const maxVal = numbers ? Math.max(...(numbers.map((n: string) => Number(n)))) : 2;
                const isHours = promisedValue.toLowerCase().includes('hour');

                if (isHours) {
                    scheduledFor.setHours(scheduledFor.getHours() + maxVal + 24); 
                } else {
                    scheduledFor.setDate(scheduledFor.getDate() + maxVal + 1); 
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

            console.log(`[Proactive] Auto-monitoring thread ${threadId} for bot ${bot.name}`);

            await supabase.from('monitored_threads').insert({
                bot_id: bot.id,
                thread_id: threadId,
                subject: subject,
                recipient: to, 
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
