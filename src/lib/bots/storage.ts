/**
 * Bot Data Access Layer
 * Handles database interactions for bot settings, execution logs, and monitoring through Supabase.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { EmailBot, BotExecutionLog, BotStats, MonitoredThread } from './types';

// ============================================================================
// Bot Management
// ============================================================================

/**
 * Get all bots for a user
 */
export async function getBots(userId: string): Promise<EmailBot[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Bot Storage] Error fetching bots:', error);
        throw new Error(`Failed to fetch bots: ${error.message}`);
    }

    return data || [];
}

/**
 * Get only enabled bots for a user
 */
export async function getEnabledBots(userId: string): Promise<EmailBot[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

    if (error) {
        console.error('[Bot Storage] Error fetching enabled bots:', error);
        throw new Error(`Failed to fetch enabled bots: ${error.message}`);
    }

    return data || [];
}

/**
 * Get a single bot by ID
 */
export async function getBotById(id: string, userId: string): Promise<EmailBot | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('[Bot Storage] Error fetching bot:', error);
        throw new Error(`Failed to fetch bot: ${error.message}`);
    }

    return data;
}

/**
 * Create a new bot
 */
export async function createBot(bot: Partial<EmailBot>): Promise<EmailBot> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bots')
        .insert(bot)
        .select()
        .single();

    if (error) {
        console.error('[Bot Storage] Error creating bot:', error);
        throw new Error(`Failed to create bot: ${error.message}`);
    }

    return data;
}

/**
 * Update a bot
 */
export async function updateBot(id: string, userId: string, updates: Partial<EmailBot>): Promise<EmailBot> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bots')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('[Bot Storage] Error updating bot:', error);
        throw new Error(`Failed to update bot: ${error.message}`);
    }

    return data;
}

/**
 * Delete a bot
 */
export async function deleteBot(id: string, userId: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error('[Bot Storage] Error deleting bot:', error);
        throw new Error(`Failed to delete bot: ${error.message}`);
    }
}

// ============================================================================
// Bot Stats & Execution Logs
// ============================================================================

/**
 * Log a bot execution
 */
export async function logExecution(log: Partial<BotExecutionLog>): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('bot_execution_logs')
        .insert(log);

    if (error) {
        console.error('[Bot Storage] Error logging execution:', error);
        // Don't throw - logging failure shouldn't break the bot engine
    }
}

/**
 * Update bot statistics
 */
export async function updateBotStats(botId: string, result: {
    success: boolean;
    emailsSent?: number;
    draftsCreated?: number;
    lastUsedTemplate?: string;
}): Promise<void> {
    const supabase = createAdminClient();

    // In a real app, this should be an atomic increment or a background job
    // Fetch current stats
    const { data: current, error: fetchError } = await supabase
        .from('bots')
        .select('stats')
        .eq('id', botId)
        .single();

    if (fetchError || !current) return;

    const stats: BotStats = current.stats || {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        emailsSent: 0,
        draftsCreated: 0,
    };

    stats.totalExecutions += 1;
    if (result.success) {
        stats.successCount += 1;
    } else {
        stats.failureCount += 1;
    }

    if (result.emailsSent) stats.emailsSent += result.emailsSent;
    if (result.draftsCreated) stats.draftsCreated += result.draftsCreated;
    if (result.lastUsedTemplate) stats.lastUsedTemplate = result.lastUsedTemplate;

    stats.lastExecutedAt = new Date();

    const { error: updateError } = await supabase
        .from('bots')
        .update({ stats })
        .eq('id', botId);

    if (updateError) {
        console.error('[Bot Storage] Error updating bot stats:', updateError);
    }
}

/**
 * Get recent execution logs for a bot
 */
export async function getExecutionLogs(botId: string, limit: number = 10): Promise<BotExecutionLog[]> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bot_execution_logs')
        .select('*')
        .eq('bot_id', botId)
        .order('triggered_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[Bot Storage] Error fetching execution logs:', error);
        return [];
    }

    return (data || []).map(log => ({
        ...log,
        triggeredAt: new Date(log.triggered_at),
        actionsExecuted: log.actions_executed || [],
    }));
}

// ============================================================================
// Safety Counters
// ============================================================================

/**
 * Count how many emails a bot sent today
 */
export async function countSendsToday(botId: string): Promise<number> {
    const supabase = createAdminClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
        .from('bot_execution_logs')
        .select('*', { count: 'exact', head: true })
        .eq('bot_id', botId)
        .gte('triggered_at', today.toISOString())
        .filter('status', 'eq', 'success')
        .not('actions_executed', 'is', null);

    if (error) {
        console.error('[Bot Storage] Error counting today sends:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Get last time an email was sent to a specific recipient by a bot
 */
export async function getLastSentTo(botId: string, recipientEmail: string): Promise<Date | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from('bot_execution_logs')
        .select('triggered_at')
        .eq('bot_id', botId)
        .eq('status', 'success')
        .filter('metadata->>senderEmail', 'eq', recipientEmail)
        .order('triggered_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;

    return new Date(data.triggered_at);
}

// ============================================================================
// Monitoring (Follow-Up Bot)
// ============================================================================

/**
 * Add a thread to monitoring queue
 */
export async function monitorThread(monitored: Partial<MonitoredThread>): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('monitored_threads')
        .insert(monitored);

    if (error) {
        console.error('[Bot Storage] Error adding thread to monitor:', error);
        throw new Error(`Failed to monitor thread: ${error.message}`);
    }
}

/**
 * Get all threads due for follow-up
 */
export async function getPendingFollowUps(): Promise<MonitoredThread[]> {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('monitored_threads')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', now);

    if (error) {
        console.error('[Bot Storage] Error fetching pending follow-ups:', error);
        return [];
    }

    return data || [];
}

/**
 * Get recently added monitored threads for a user
 */
export async function getMonitoredThreads(userId: string, limit: number = 20): Promise<MonitoredThread[]> {
    const supabase = createAdminClient();

    // We join with bots to filter by userId
    const { data, error } = await supabase
        .from('monitored_threads')
        .select(`
            *,
            bots!inner(user_id)
        `)
        .eq('bots.user_id', userId)
        .order('added_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('[Bot Storage] Error fetching monitored threads:', error);
        throw new Error(`Failed to fetch monitored threads: ${error.message}`);
    }

    return data || [];
}

/**
 * Update monitored thread status
 */
export async function updateMonitoredThread(id: string, updates: Partial<MonitoredThread>): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('monitored_threads')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('[Bot Storage] Error updating monitored thread:', error);
        throw new Error(`Failed to update monitored thread: ${error.message}`);
    }
}
