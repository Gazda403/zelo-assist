import { createAdminClient } from '../supabase/admin';

export async function getUserTokens(userId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user tokens:', error);
    }
    return data;
}

export async function getUserRefreshToken(userId: string) {
    const tokens = await getUserTokens(userId);
    return tokens?.refresh_token || null;
}

export async function saveUserTokens(userId: string, tokens: { access_token: string; refresh_token?: string; expires_at: number }) {
    const supabase = createAdminClient();

    const data: any = {
        user_id: userId,
        access_token: tokens.access_token,
        expires_at: new Date(tokens.expires_at).toISOString(),
    };

    if (tokens.refresh_token) {
        data.refresh_token = tokens.refresh_token;
    }

    const { error } = await supabase
        .from('user_tokens')
        .upsert(data, { onConflict: 'user_id' });

    if (error) {
        console.error('Error saving user tokens:', error);
        throw error;
    }
}
