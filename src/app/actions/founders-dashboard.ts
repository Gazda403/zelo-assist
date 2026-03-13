'use server';
import { auth } from '@/auth';
export async function getFoundersDashboardDataAction(botId: string) {
    return { totalEmails: 0, supportResolved: 0, timeSaved: 0, intents: {}, riskDistribution: { low: 0, medium: 0, high: 0 }, businessEmails: 0, spamFiltered: 0, avgRisk: 0, recentActivity: [] };
}
