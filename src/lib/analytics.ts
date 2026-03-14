import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export type AnalyticsEvent = {
    name: string
    properties?: Record<string, any>
    userId?: string
}

/**
 * Tracks an event to Supabase.
 * SAFE to call from Client Components.
 */
export async function trackEvent(event: AnalyticsEvent) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const userId = event.userId || user?.id

        if (!userId) {
            console.warn('Analytics: No user ID found for event', event.name)
            // Optional: Store anonymous events?
        }

        const { error } = await supabase.from('analytics_events').insert({
            event_name: event.name,
            properties: event.properties || {},
            user_id: userId,
        })

        if (error) {
            console.error('Analytics: Failed to track event', error)
        }
    } catch (err) {
        console.error('Analytics: Exception tracking event', err)
    }
}

/**
 * Tracks an event from a Server Action or Server Component.
 */
export async function trackServerEvent(event: AnalyticsEvent) {
    try {
        const supabase = await createServerClient()
        // For server events, we usually expect userId to be passed or derived from session
        let userId = event.userId

        if (!userId) {
            const { data: { user } } = await supabase.auth.getUser()
            userId = user?.id
        }

        const { error } = await supabase.from('analytics_events').insert({
            event_name: event.name,
            properties: event.properties || {},
            user_id: userId,
        })

        if (error) {
            console.error('Analytics (Server): Failed to track event', error)
        }
    } catch (err) {
        console.error('Analytics (Server): Exception tracking event', err)
    }
}

// Email ratings moved to @/lib/db/email-storage.ts
