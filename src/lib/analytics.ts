/**
 * Simple Analytics Utility
 * Tracking bot and user events for the dashboard
 */

export const trackEvent = (name: string, properties?: any) => {
    // In a real app, this would send to PostHog, Mixpanel, or custom DB
    console.log(`[Analytics] Event: ${name}`, properties);
};

export const trackBotExecution = (botId: string, status: 'success' | 'failure' | 'safety_blocked') => {
    trackEvent('bot_execution', { botId, status, timestamp: new Date().toISOString() });
};
