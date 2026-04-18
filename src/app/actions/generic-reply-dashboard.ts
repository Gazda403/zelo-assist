'use server';

import { auth } from '@/auth';
import { getExecutionLogs, getBotById } from '@/lib/bots/storage';

/**
 * Get aggregated data for the Generic Reply Bot Dashboard
 */
export async function getGenericReplyDashboardDataAction(botId: string) {
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
    const totalReplies = logs.filter(l => l.status === 'success').length;
    const totalAttempts = logs.length;
    const successRate = totalAttempts > 0
        ? Math.round((totalReplies / totalAttempts) * 100 * 10) / 10
        : 0;

    // Calculate avg response time (mock for now - would need timestamp data)
    const avgResponseTime = 2.8;

    // 2. Template Usage (extract from metadata)
    const templatesUsed: Record<string, number> = {};
    logs.forEach(l => {
        const template = l.metadata?.template || 'General Inquiry';
        templatesUsed[template] = (templatesUsed[template] || 0) + 1;
    });

    // 3. Escalations (failed executions)
    const escalations = logs.filter(l => l.status === 'failure').length;

    // 4. Recent Activity
    const recentActivity = logs.slice(0, 5).map(l => ({
        id: l.id,
        template: l.metadata?.template || 'General Inquiry',
        recipient: l.metadata?.recipientEmail || 'Unknown',
        subject: l.metadata?.subject || 'Unknown Subject',
        time: getTimeAgo(l.triggeredAt),
        status: l.status === 'success' ? 'sent' : 'failure'
    }));

    // 5. History Data for Graph (last 7 days)
    const historyData: Record<string, { total: number; success: number; failed: number }> = {};
    const now = new Date();

    // We want the last 7 days including today
    // Use a consistent method to get YYYY-MM-DD
    const getUTCDateString = (date: Date) => date.toISOString().split('T')[0];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setUTCDate(now.getUTCDate() - i);
        const dateStr = getUTCDateString(d);
        historyData[dateStr] = { total: 0, success: 0, failed: 0 };
    }

    // Capture logs into the prepared buckets
    logs.forEach(l => {
        const dateStr = getUTCDateString(new Date(l.triggeredAt));
        if (historyData[dateStr]) {
            historyData[dateStr].total++;
            if (l.status === 'success') historyData[dateStr].success++;
            else historyData[dateStr].failed++;
        }
    });

    const performanceHistory = Object.entries(historyData).map(([date, data]) => ({
        date,
        ...data
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
        totalReplies,
        successRate,
        avgResponseTime,
        templatesUsed,
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
