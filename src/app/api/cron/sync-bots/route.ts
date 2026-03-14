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
        const results = await Promise.allSettled(userIds.map(userId => syncBotsForUser(userId)));

        return NextResponse.json({
            success: true,
            processed: userIds.length,
            successCount: results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
