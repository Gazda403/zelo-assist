'use server';

import { auth } from '@/auth';
import { getExecutionLogs, getBotById } from '@/lib/bots/storage';

/**
 * Get aggregated data for the Follow-Up Bot Dashboard
 */
export async function getFollowUpDashboardDataAction(botId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Verify access (with preset bypass)
    if (!botId.startsWith('preset_')) {
        const bot = await getBotById(botId, userId);
        if (!bot) throw new Error('Bot not found');
    }

    // Fetch logs (last 500 for stats)
    const logs = await getExecutionLogs(botId, 500);

    // 1. Hero Stats
    const followUpsSent = logs.filter(l => l.status === 'success').length;
    const totalAttempts = logs.length;
    const successRate = totalAttempts > 0
        ? Math.round((followUpsSent / totalAttempts) * 100 * 10) / 10
        : 0;

    // Monitored threads (would need separate table in real implementation)
    const monitoredThreads = Math.floor(followUpsSent * 0.4); // Mock ratio

    // Calculate avg response time in days (mock for now)
    const avgResponseTime = 2.3;

    // Escalations (threads that exceeded max attempts)
    const escalations = logs.filter(l =>
        l.metadata?.followUpAttempts && l.metadata.followUpAttempts >= 2
    ).length;

    // 4. Recent Activity
    const recentActivity = logs.slice(0, 5).map(l => {
        const daysWaited = l.metadata?.daysWaited || Math.floor(Math.random() * 7) + 1;
        const status = l.status === 'success'
            ? (Math.random() > 0.5 ? 'replied' : 'sent')
            : 'escalated';

        return {
            id: l.id,
            subject: l.metadata?.subject || 'Follow-up reminder',
            recipient: l.metadata?.recipientEmail || 'Unknown',
            status,
            time: getTimeAgo(l.triggeredAt),
            daysWaited
        };
    });

    // 5. Performance History (Last 7 days)
    const performanceHistory = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStr = date.toISOString().split('T')[0];

        // Filter logs for this day
        const dayLogs = logs.filter(l => l.triggeredAt.toISOString().split('T')[0] === dayStr);
        const sent = dayLogs.filter(l => l.status === 'success').length;
        const failed = dayLogs.filter(l => l.status === 'failure').length;
        const replied = Math.floor(sent * (0.3 + Math.random() * 0.4)); // Mock replied data

        performanceHistory.push({
            date: dayStr,
            sent,
            replied,
            failed
        });
    }

    return {
        monitoredThreads,
        followUpsSent,
        successRate,
        avgResponseTime,
        escalations,
        recentActivity,
        performanceHistory
    };
}

function getTimeAgo(date: Date): string {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (minutes === 0) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
