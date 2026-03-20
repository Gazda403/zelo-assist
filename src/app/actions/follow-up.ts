'use server';

import { getMonitoredThreads, addMonitoredThread, deleteMonitoredThread } from '@/lib/bots/storage';
import { getBotById } from '@/lib/bots/storage'; // Added for auth check
import { MonitoredThread } from '@/lib/bots/types';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getMonitoredThreadsAction(botId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    // Verify ownership
    const bot = await getBotById(botId, session.user.email);
    if (!bot) throw new Error('Bot not found');

    return await getMonitoredThreads(botId);
}

export async function addMonitoredThreadAction(botId: string, thread: { threadId: string; subject: string; recipient: string }) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    // Verify ownership
    const bot = await getBotById(botId, session.user.email);
    if (!bot) throw new Error('Bot not found');

    // Map to storage format (snake_case)
    await addMonitoredThread({
        bot_id: botId,
        thread_id: thread.threadId,
        subject: thread.subject,
        recipient: thread.recipient,
        // Defaults handled in storage
        status: 'pending',
        attempts: 0
    });

    revalidatePath(`/bots/${botId}`);
    revalidatePath(`/bots`);
}

export async function deleteMonitoredThreadAction(threadId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    // Security Verification: Ensure the thread belongs to a bot owned by the user
    // First, fetch the thread to find its bot ID
    const { getMonitoredThreadById } = await import('@/lib/bots/storage');
    const thread = await getMonitoredThreadById(threadId);

    if (!thread) {
        throw new Error('Thread not found');
    }

    // Next, verify the user owns the bot associated with this thread
    const bot = await getBotById(thread.bot_id, session.user.email);
    if (!bot) {
        throw new Error('Unauthorized or Bot not found');
    }

    await deleteMonitoredThread(threadId);
    revalidatePath(`/bots/${bot.id}`);
}
