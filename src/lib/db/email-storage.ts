import { createAdminClient } from '@/lib/supabase/admin';

export interface EmailRating {
    urgencyScore: number;
    reasoning: string;
    confidence: 'low' | 'medium' | 'high';
}

export interface GeneratedDraft {
    draft: string;
    tone: string;
}

/**
 * Saves or updates an email rating in the persistent store.
 * Uses Service Role to bypass RLS, ensuring reliability.
 */
export async function saveEmailRating(
    emailId: string,
    userId: string,
    rating: EmailRating
): Promise<boolean> {
    try {
        const supabase = createAdminClient();

        const { error } = await supabase.from('email_ratings').upsert({
            email_id: emailId,
            user_id: userId,
            urgency_score: rating.urgencyScore,
            reasoning: rating.reasoning,
            confidence: rating.confidence,
            // created_at is default now(), but for updates we might want updated_at? 
            // Table doesn't have updated_at, upsert handles row replacement.
        });

        if (error) {
            console.error('[DB] Failed to save rating:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[DB] Exception saving rating:', error);
        return false;
    }
}

/**
 * Retrieves a batch of ratings for specific email IDs.
 * Used to populate the UI with previously calculated AI values.
 */
export async function getEmailRatings(emailIds: string[]): Promise<Record<string, EmailRating>> {
    if (emailIds.length === 0) return {};

    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('email_ratings')
            .select('email_id, urgency_score, reasoning, confidence')
            .in('email_id', emailIds);

        if (error) {
            console.error('[DB] Failed to fetch ratings:', error);
            return {};
        }

        const ratings: Record<string, EmailRating> = {};

        data?.forEach((row: any) => {
            ratings[row.email_id] = {
                urgencyScore: row.urgency_score,
                reasoning: row.reasoning,
                confidence: row.confidence as 'low' | 'medium' | 'high'
            };
        });

        return ratings;
    } catch (error) {
        console.error('[DB] Exception fetching ratings:', error);
        return {};
    }
}

/**
 * Saves a generated draft to the persistence store.
 */
export async function saveGeneratedDraft(
    emailId: string,
    userId: string,
    result: GeneratedDraft
): Promise<boolean> {
    try {
        const supabase = createAdminClient();

        const { error } = await supabase.from('generated_drafts').upsert({
            email_id: emailId,
            user_id: userId,
            draft_content: result.draft,
            tone: result.tone,
        });

        if (error) {
            console.error('[DB] Failed to save generated draft:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[DB] Exception saving generated draft:', error);
        return false;
    }
}

/**
 * Retrieves a previously generated draft for an email.
 */
export async function getGeneratedDraft(emailId: string): Promise<GeneratedDraft | null> {
    try {
        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('generated_drafts')
            .select('draft_content, tone')
            .eq('email_id', emailId)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // PGRST116 is "No rows found"
                console.error('[DB] Failed to fetch generated draft:', error);
            }
            return null;
        }

        if (!data) return null;

        return {
            draft: data.draft_content,
            tone: data.tone
        };
    } catch (error) {
        console.error('[DB] Exception fetching generated draft:', error);
        return null;
    }
}
