'use server';
import { auth } from '@/auth';
export async function getFollowUpDashboardDataAction(botId: string) {
    return { monitoredThreads: 0, followUpsSent: 0, successRate: 0, avgResponseTime: 2.3, escalations: 0, recentActivity: [], performanceHistory: [] };
}
