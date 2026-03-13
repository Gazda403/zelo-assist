import { createAdminClient } from '../supabase/admin';
export async function saveEmailRating(emailId: string, userId: string, rating: any) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('email_ratings').upsert({ email_id: emailId, user_id: userId, urgency_score: rating.urgencyScore, reasoning: rating.reasoning, confidence: rating.confidence });
    return !error;
}
export async function getEmailRatings(emailIds: string[]) { return {}; }
export async function saveGeneratedDraft(emailId: string, userId: string, draft: any) { return true; }
export async function getGeneratedDraft(emailId: string) { return null; }
