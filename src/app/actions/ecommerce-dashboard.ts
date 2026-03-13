'use server';
import { auth } from '@/auth';
export async function getEcommerceDashboardDataAction(botId: string) {
    return { totalTickets: 0, ordersResolved: 0, avgResponseTime: 4.2, inquiryTypes: {}, sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }, escalations: 0, recentActivity: [] };
}
