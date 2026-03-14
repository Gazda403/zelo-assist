
import { createAdminClient } from '@/lib/supabase/admin';

export interface UserTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // Seconds since epoch
}

/**
 * Save user tokens to Supabase
 * Uses email as the primary key to match the 'bots' table usage
 */
export async function saveUserTokens(
    userId: string, // This is token.sub (Google ID)
    email: string,
    tokens: Partial<UserTokens>
): Promise<boolean> {
    const supabase = createAdminClient();

    const updates: any = {
        id: email, // Use EMAIL as the ID to match bots.userId
        google_id: userId, // Keep the numerical ID just in case
        email: email,
        updated_at: new Date().toISOString(),
    };

    if (tokens.refreshToken) updates.refresh_token = tokens.refreshToken;

    const { error } = await supabase
        .from('users')
        .upsert(updates, { onConflict: 'id' });

    if (error) {
        console.error('Error saving user tokens:', error);
        return false;
    }

    return true;
}

/**
 * Get user's refresh token by email
 */
export async function getUserRefreshToken(email: string): Promise<string | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('users')
        .select('refresh_token')
        .eq('email', email) // Query by email property which matches bots.user_id
        .single();

    if (error || !data) {
        return null;
    }

    return data.refresh_token;
}

/**
 * Get all users who have enabled bots
 * Used by the CRON job to determine who to sync
 */
export async function getUsersWithEnabledBots(): Promise<string[]> {
    const supabase = createAdminClient();

    // 1. Get all distinct user_ids from 'bots' table where enabled = true
    const { data, error } = await supabase
        .from('bots')
        .select('user_id')
        .eq('enabled', true);

    if (error) {
        console.error('Error fetching users with bots:', error);
        return [];
    }

    // 2. Deduplicate user IDs
    const userIds = Array.from(new Set((data || []).map(row => row.user_id)));

    return userIds;
}
