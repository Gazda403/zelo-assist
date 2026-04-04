import { EmailBot } from "@/lib/bots/types";

export const ALERT_BOT_PRESET: EmailBot = {
    id: "preset_alert_bot",
    userId: "system",
    name: "Alert Bot",
    description: "Your personal inbox trip wire. Describe in plain English what emails matter most — AI extracts the rules and fires a notification the moment something matches.",
    prompt: `You are the Alert Bot — a silent watchdog for the inbox.
    
    Your only job is to silently scan incoming emails and fire a notification if anything matches the user's defined rules.
    
    DETECTION RULES (set by user, stored in alertConfig):
    - senderFilters: alert if email sender matches any of these addresses or domains
    - keywords: alert if email subject or body contains any of these keywords
    - searchIn: where to look — subject, body, or both
    
    ACTIONS:
    - IF match found → NOTIFY user immediately with email subject and sender
    - NEVER reply, forward, or take any other action
    - NEVER notify for newsletters, unsubscribe emails, or automated system emails unless explicitly included
    
    OPERATING RULES:
    - Be precise. Only fire for actual matches, not vague similarities.
    - Respect user's rules exactly as defined.
    `,
    enabled: false,
    isPremium: false, // Free for all users
    createdAt: new Date(),
    updatedAt: new Date(),

    trigger: {
        type: 'new_email_received',
        config: {}
    },

    conditions: [],

    actions: [
        {
            type: 'notify_user',
            config: {
                message: "🔔 Alert Bot: '{{subject}}' from {{sender}} matched your alert rules.",
                priority: 'high'
            }
        }
    ],

    alertConfig: {
        userDescription: '',
        senderFilters: [],
        keywords: [],
        searchIn: 'both',
    },

    safety: {
        autoSendEnabled: false,
        maxSendsPerDay: 0,
        cooldownMinutes: 0,
        loopPrevention: false,
    },

    stats: {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        emailsSent: 0,
        draftsCreated: 0
    }
};
