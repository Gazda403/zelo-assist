import { NextResponse } from 'next/server';
import { syncBotsForUser } from '@/lib/bots/engine/sync';
import { getUsersWithEnabledBots } from '@/lib/db/user-storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret') || (authHeader?.split(' ')[1]);

        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userIds = await getUsersWithEnabledBots();
        if (userIds.length === 0) {
            return NextResponse.json({ success: true, message: 'No users to sync' });
        }

        const results = await Promise.allSettled(userIds.map(userId => syncBotsForUser(userId)));

        const summary = results.map((result, index) => ({
            userId: userIds[index],
            status: result.status,
            value: result.status === 'fulfilled' ? result.value : result.reason
        }));

        const successCount = summary.filter(s => s.status === 'fulfilled' && (s.value as any).success).length;

        return NextResponse.json({
            success: true,
            processed: userIds.length,
            successCount,
            details: summary
        });

    } catch (error: any) {
        console.error('[Cron] Bot Sync Job Failed:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
