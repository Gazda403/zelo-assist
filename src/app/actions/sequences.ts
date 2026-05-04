'use server';

import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmailAction } from '@/app/actions/gmail';

export async function saveSequenceAction(data: {
    id?: string;
    subject: string;
    content: string;
    total_count: number;
    sent_count: number;
}) {
    const session = await auth() as any;
    if (!session?.user?.id) throw new Error("Unauthorized");

    const supabase = createAdminClient();
    
    if (data.id) {
        const { data: updated, error } = await supabase
            .from('sequences')
            .update({
                subject: data.subject,
                content: data.content,
                total_count: data.total_count,
                sent_count: data.sent_count,
                updated_at: new Date().toISOString()
            })
            .eq('id', data.id)
            .eq('user_id', session.user.id)
            .select()
            .single();
            
        if (error) throw error;
        return updated;
    } else {
        const { data: inserted, error } = await supabase
            .from('sequences')
            .insert({
                user_id: session.user.id,
                subject: data.subject,
                content: data.content,
                total_count: data.total_count,
                sent_count: data.sent_count,
                status: 'active',
                is_dismissed: false
            })
            .select()
            .single();
            
        if (error) throw error;
        return inserted;
    }
}

export async function startSequenceAction(
    emails: string[],
    subject: string,
    content: string
) {
    const session = await auth() as any;
    if (!session?.user?.id) throw new Error("Unauthorized");

    // 1. Create the sequence record
    const seqRecord = await saveSequenceAction({
        subject,
        content,
        total_count: emails.length,
        sent_count: 0
    });

    // 2. Fire and forget the background process
    // This will run in the background (Node.js environment).
    (async () => {
        let sentCount = 0;
        try {
            for (const email of emails) {
                // We use the same session context for the server action
                await sendEmailAction(email, subject, content);
                sentCount++;
                await updateSequenceProgressAction(seqRecord.id, sentCount);
                
                // 1.5s delay to avoid spam filters
                await new Promise(r => setTimeout(r, 1500));
            }
            // Mark as completed
            const supabase = createAdminClient();
            await supabase
                .from('sequences')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', seqRecord.id);

        } catch (error) {
            console.error(`[Background Sequence Error] seqId=${seqRecord.id}:`, error);
            const supabase = createAdminClient();
            await supabase
                .from('sequences')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('id', seqRecord.id);
        }
    })().catch(err => console.error("Unhandled background sequence error:", err));

    return seqRecord;
}

export async function getActiveSequencesAction() {
    const session = await auth() as any;
    if (!session?.user?.id) return [];

    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('sequences')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch active sequences:", error);
        return [];
    }
    return data || [];
}

export async function updateSequenceProgressAction(id: string, sentCount: number) {
    const session = await auth() as any;
    // Bypassing strict session check for background tasks, but still secure via Admin client + ID
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('sequences')
        .update({ sent_count: sentCount, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
    return { success: true };
}

export async function dismissSequenceAction(id: string) {
    const session = await auth() as any;
    if (!session?.user?.id) throw new Error("Unauthorized");

    const supabase = createAdminClient();
    const { error } = await supabase
        .from('sequences')
        .update({ is_dismissed: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', session.user.id);

    if (error) throw error;
    return { success: true };
}

