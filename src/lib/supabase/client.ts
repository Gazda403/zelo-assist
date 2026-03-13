import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase Client
 * Respects RLS and uses Anon Key.
 */
export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};
