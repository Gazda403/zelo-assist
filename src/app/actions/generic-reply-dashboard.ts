'use server';
import { auth } from '@/auth';
export async function getGenericReplyDashboardDataAction(botId: string) {
    return { totalReplies: 0, successRate: 0, avgResponseTime: 2.8, templatesUsed: {}, escalations: 0, recentActivity: [], performanceHistory: [] };
}
