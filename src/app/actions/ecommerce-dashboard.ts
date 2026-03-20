'use server';

import { auth } from '@/auth';
import { getExecutionLogs, getBotById } from '@/lib/bots/storage';
import { getTemplate } from '@/lib/bots/templates';
import { differenceInMinutes } from 'date-fns';

/**
 * Get aggregated data for the E-Commerce Bot Dashboard
 */
export async function getEcommerceDashboardDataAction(botId: string) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.email;

    // Guard against missing botId
    if (!botId) throw new Error('Bot ID is required');

    // Verify access and get bot configuration
    let bot;
    if (botId.startsWith('preset_')) {
        bot = getTemplate(botId);
    } else {
        bot = await getBotById(botId, userId);
    }

    if (!bot) throw new Error('Bot not found');

    // Fetch logs (last 500 for stats)
    const logs = await getExecutionLogs(botId, 500);

    // 1. Hero Stats
    const totalTickets = logs.length;
    const ordersResolved = logs.filter(l => l.status === 'success').length;

    // Calculate avg response time (in minutes)
    const responseTimes = logs
        .filter(l => l.metadata?.responseTime)
        .map(l => l.metadata?.responseTime as number);
    const avgResponseTime = responseTimes.length > 0
        ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10) / 10
        : 4.2; // Default fallback

    const returnsProcessed = logs.filter(l =>
        l.metadata?.telemetry?.intent === 'Return_Request' && l.status === 'success'
    ).length;

    // 2. Inquiry Type Distribution
    const inquiryTypes: Record<string, number> = {
        Order_Status: 0,
        Return_Request: 0,
        Product_Inquiry: 0,
        Complaint: 0,
        Shipping_Question: 0,
        Other: 0
    };

    logs.forEach(l => {
        const intent = l.metadata?.telemetry?.intent || 'Other';
        if (inquiryTypes[intent] !== undefined) {
            inquiryTypes[intent]++;
        } else {
            inquiryTypes.Other++;
        }
    });

    // 3. Sentiment Distribution (based on risk scores)
    const sentimentDistribution = {
        positive: logs.filter(l => (l.metadata?.telemetry?.riskScore || 0) < 30).length,
        neutral: logs.filter(l => {
            const risk = l.metadata?.telemetry?.riskScore || 0;
            return risk >= 30 && risk < 70;
        }).length,
        negative: logs.filter(l => (l.metadata?.telemetry?.riskScore || 0) >= 70).length,
    };

    // 4. Escalations (high risk tickets)
    const escalations = logs.filter(l => (l.metadata?.telemetry?.riskScore || 0) >= 70).length;

    // 5. Recent Activity
    const recentActivity = logs.slice(0, 5).map(l => {
        const intent = l.metadata?.telemetry?.intent || 'Other';
        const riskScore = l.metadata?.telemetry?.riskScore || 0;

        return {
            id: l.id,
            type: intent,
            subject: l.metadata?.subject || 'Unknown Subject',
            customer: l.metadata?.senderEmail || 'Unknown Customer',
            action: l.status === 'success' ? (l.actionsExecuted[0] || 'Processed') : 'Failed',
            sentiment: riskScore >= 70 ? 'negative' : riskScore >= 30 ? 'neutral' : 'positive',
            time: getTimeAgo(l.triggeredAt)
        };
    });

    return {
        totalTickets,
        ordersResolved,
        avgResponseTime,
        inquiryTypes,
        sentimentDistribution,
        returnsProcessed,
        escalations,
        recentActivity,
        autoSendEnabled: bot.safety?.autoSendEnabled || false,
        autoSendRules: bot.safety?.autoSendRules || []
    };
}

function getTimeAgo(date: Date): string {
    const minutes = differenceInMinutes(new Date(), date);
    if (minutes === 0) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
