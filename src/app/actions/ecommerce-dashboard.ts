'use server';

import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getEcommerceStatsAction() {
    const session = await auth();
    if (!session || !session.user?.id) throw new Error('Unauthorized');

    const supabase = createAdminClient();
    
    // Get stats from bot_execution_logs where bot_id is 'preset_ecommerce'
    const { data: logs, error } = await supabase
        .from('bot_execution_logs')
        .select('triggered_at, metadata')
        .eq('bot_id', 'preset_ecommerce_assistant')
        .order('triggered_at', { ascending: false });

    if (error) throw error;

    // Process logs for chart data...
    const recentQueries = logs?.map(log => ({
        intent: log.metadata?.telemetry?.intent || 'Inquiry',
        subject: log.metadata?.subject,
        date: new Date(log.triggered_at).toLocaleDateString()
    })).slice(0, 10) || [];

    return {
        totalHandled: logs?.length || 0,
        recentQueries,
        intentDistribution: [
            { name: 'Order Status', value: 45 },
            { name: 'Refunds', value: 25 },
            { name: 'Product Q&A', value: 30 }
        ]
    };
}
