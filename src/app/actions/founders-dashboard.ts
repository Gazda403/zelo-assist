'use server';

import { auth } from '@/auth';
import { getExecutionLogs, getBotById, getBotStats } from '@/lib/bots/storage';
import { differenceInHours } from 'date-fns';

/**
 * Get aggregated data for the Founders Bot Dashboard
 */
export async function getFoundersDashboardDataAction(botId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Fetch bot for safety config and verification
    const bot = await getBotById(botId, userId);
    if (!bot && !botId.startsWith('preset_')) {
        throw new Error('Bot not found');
    }

    // Fetch logs (last 500 for stats)
    const logs = await getExecutionLogs(botId, 500);
    const stats = await getBotStats(botId);

    // 1. Hero Stats
    const totalEmails = logs.length;
    const supportResolved = logs.filter(l => l.metadata?.telemetry?.intent === 'User_Support').length;

    // Estimate time saved: 5 mins per email handled, 10 mins per complex one
    const timeSavedMinutes = logs.reduce((acc, l) => {
        const intent = l.metadata?.telemetry?.intent;
        if (intent === 'User_Support' || intent === 'Investor_Outreach') return acc + 10;
        return acc + 5;
    }, 0);
    const timeSaved = Math.round((timeSavedMinutes / 60) * 10) / 10;

    // 2. Intent Distribution
    const intents: Record<string, number> = {
        User_Support: 0,
        Cold_Sales: 0,
        Investor_Outreach: 0,
        Hiring: 0,
        Meeting_Request: 0,
        Legal_Finance: 0,
        Other: 0
    };

    logs.forEach(l => {
        const intent = l.metadata?.telemetry?.intent || 'Other';
        if (intents[intent] !== undefined) {
            intents[intent]++;
        } else {
            intents.Other++;
        }
    });

    // 3. Risk Profile
    const riskScores = logs.map(l => l.metadata?.telemetry?.riskScore || 0);
    const avgRisk = riskScores.length > 0
        ? Math.round((riskScores.reduce((a, b) => a + b, 0) / riskScores.length) * 10) / 10
        : 0;

    const riskDistribution = {
        low: riskScores.filter(s => s < 30).length,
        medium: riskScores.filter(s => s >= 30 && s < 70).length,
        high: riskScores.filter(s => s >= 70).length,
    };

    // 4. Business Filter Efficiency
    const spamFiltered = logs.filter(l => l.metadata?.telemetry?.isSpam).length;
    const businessEmails = totalEmails - spamFiltered;

    // 5. Recent Activity
    const recentActivity = logs.slice(0, 5).map(l => ({
        id: l.id,
        type: l.metadata?.telemetry?.intent || 'Other',
        subject: l.metadata?.subject || 'Unknown Subject',
        sender: l.metadata?.senderEmail || 'Unknown Sender',
        action: l.status === 'success' ? (l.actionsExecuted[0] || 'Processed') : 'Failed',
        priority: l.metadata?.telemetry?.riskScore > 70 ? 'High' : l.metadata?.telemetry?.riskScore > 30 ? 'Medium' : 'Low',
        time: getTimeAgo(l.triggeredAt)
    }));

    return {
        totalEmails,
        supportResolved,
        timeSaved,
        intents,
        riskDistribution,
        businessEmails,
        spamFiltered,
        avgRisk,
        recentActivity,
        // Config state
        autoSendEnabled: bot?.safety?.autoSendEnabled ?? false,
        autoSendRules: bot?.safety?.autoSendRules ?? []
    };
}

function getTimeAgo(date: Date): string {
    const hours = differenceInHours(new Date(), date);
    if (hours === 0) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
