import { createAdminClient } from '../supabase/admin';

export async function saveEmailRating(emailId: string, rating: number, rationale: string) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('email_ratings')
        .upsert({
            email_id: emailId,
            rating,
            rationale,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error saving email rating:', error);
        throw error;
    }
}

export async function getEmailRating(emailId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('email_ratings')
        .select('*')
        .eq('email_id', emailId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email rating:', error);
    }
    return data;
}

export async function saveDraft(emailId: string, draft: string, tone: string) {
    const supabase = createAdminClient();
    const { error } = await supabase
        .from('email_drafts')
        .upsert({
            email_id: emailId,
            content: draft,
            tone,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error saving draft:', error);
        throw error;
    }
}
