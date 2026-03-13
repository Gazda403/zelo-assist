import { createClient } from '@/lib/supabase/client';
export async function trackEvent(event: any) {
    const supabase = createClient();
    await supabase.from('analytics_events').insert({ event_name: event.name, properties: event.properties });
}
