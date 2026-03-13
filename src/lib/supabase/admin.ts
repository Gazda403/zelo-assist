import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase Client
 * Uses SERVICE_ROLE_KEY to bypass RLS.
 * CRITICAL: Use ONLY on server-side.
 */
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
};
