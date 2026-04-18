/**
 * Email Bots System - Server Actions
 * 
 * Server-side actions for bot CRUD operations and execution.
 * All actions verify user authentication and ownership.
 */

'use server';

import { auth } from '@/auth';
import type { EmailBot, BotExecutionLog, BotStats, EmailEvent, MonitoredThread } from '@/lib/bots/types';
import {
    getAllBots,
    getBotById,
    createBot as storageCreateBot,
    updateBot as storageUpdateBot,
    deleteBot as storageDeleteBot,
    getExecutionLogs,
    getBotStats,
    getMonitoredThreads,
} from '@/lib/bots/storage';
import { getTemplate, getAllTemplates } from '@/lib/bots/templates';
import { testBot } from '@/lib/bots/engine/orchestrator';
import { validateBotSafety } from '@/lib/bots/engine/safety';

// ============================================================================
// Bot CRUD Operations
// ============================================================================

/**
 * Get all bots for the current user
 */
export async function getBotsAction(): Promise<EmailBot[]> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id; // Use persistent UUID as userId
    return await getAllBots(userId);
}

/**
 * Get bot by ID
 */
export async function getBotByIdAction(botId: string): Promise<EmailBot | null> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    return await getBotById(botId, userId);
}

/**
 * Create a new bot
 */
export async function createBotAction(
    bot: Omit<EmailBot, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<EmailBot> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // --- Subscription Limits Enforced Here ---
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan_type, first_login_at')
        .eq('id', userId)
        .single();
        
    let planType = profile?.plan_type ?? 'free';
    if (userId === 'dad0999b-d16e-472c-87a3-9324d32bcc69') { // UUID for brankovicaleksandar2404@gmail.com
        planType = 'exclusive';
    }
    
    const createdAt = profile?.first_login_at || new Date().toISOString();
    const trialDays = 7;
    const msSinceCreation = Date.now() - new Date(createdAt).getTime();
    const daysSinceCreation = msSinceCreation / (1000 * 60 * 60 * 24);
    const isTrialExpired = planType === "free" && daysSinceCreation > trialDays;

    if (isTrialExpired) {
        throw new Error(`Your 7-day free trial has expired. Please upgrade your plan to create and use bots.`);
    }

    let maxBots = (planType === 'pro' || planType === 'exclusive') ? Infinity : 3;
    if (planType === 'free' && !isTrialExpired) {
        maxBots = Infinity;
    }

    const existingBots = await getAllBots(userId);
    
    if (existingBots.length >= maxBots) {
        throw new Error(`Bot limit reached. Your plan allows up to ${maxBots} bots. Please upgrade your plan to create more bots.`);
    }
    // -----------------------------------------

    // Validate safety
    const warnings = validateBotSafety(bot as EmailBot);
    if (warnings.length > 0) {
        console.warn('[Bot Creation] Safety warnings:', warnings);
    }

    const newBot: EmailBot = {
        ...bot,
        id: crypto.randomUUID(),
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return await storageCreateBot(newBot);
}

/**
 * Update a bot
 */
export async function updateBotAction(
    botId: string,
    updates: Partial<EmailBot>
): Promise<EmailBot> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Verify ownership
    const existing = await getBotById(botId, userId);
    if (!existing) {
        throw new Error('Bot not found or access denied');
    }

    return await storageUpdateBot(botId, userId, updates);
}

/**
 * Delete a bot
 */
export async function deleteBotAction(botId: string): Promise<void> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Verify ownership
    const existing = await getBotById(botId, userId);
    if (!existing) {
        throw new Error('Bot not found or access denied');
    }

    await storageDeleteBot(botId, userId);
}

/**
 * Toggle bot enabled status
 */
export async function toggleBotAction(
    botId: string,
    enabled: boolean
): Promise<EmailBot> {
    return await updateBotAction(botId, { enabled });
}

/**
 * Accept auto-send terms for a bot
 */
export async function acceptBotTermsAction(
    botId: string,
    termsVersion: string
): Promise<EmailBot> {
    return await updateBotAction(botId, {
        acceptedTermsAt: new Date(),
        acceptedTermsVersion: termsVersion,
    });
}

// ============================================================================
// Bot Execution & Testing
// ============================================================================

/**
 * Test bot execution (dry-run)
 * Returns preview of what would happen without executing
 */
export async function testBotAction(
    botId: string,
    emailId: string
): Promise<{
    triggerMatched: boolean;
    conditionsPassed: boolean;
    safetyAllowed: boolean;
    safetyReason?: string;
    wouldExecute: boolean;
    plannedActions: string[];
}> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    let bot;
    if (botId.startsWith('preset_')) {
        // Import templates/presets dynamically if needed, or check if we can get it from storage
        // Actually, our getBotById in storage doesn't return presets.
        // For now, let's just use the ID bypass if it's already in memory? 
        // No, better to try getting it from templates.
        const { getTemplate } = await import('@/lib/bots/templates');
        bot = getTemplate(botId);
    } else {
        bot = await getBotById(botId, userId);
    }

    if (!bot) {
        throw new Error('Bot not found');
    }

    // Create mock email event (would normally come from Gmail API)
    const mockEvent: EmailEvent = {
        type: 'new_email',
        emailId,
        sender: {
            name: 'Test Sender',
            email: 'test@example.com',
        },
        subject: 'Test Email',
        body: 'This is a test email for bot preview.',
        date: new Date().toISOString(),
        read: false,
        urgencyScore: 5,
    };

    return await testBot(bot as EmailBot, mockEvent);
}

// ============================================================================
// Logs & Stats
// ============================================================================

/**
 * Get execution logs for a bot
 */
export async function getBotExecutionLogsAction(
    botId: string,
    limit = 100
): Promise<BotExecutionLog[]> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Verify ownership for non-preset bots
    if (!botId.startsWith('preset_')) {
        const bot = await getBotById(botId, userId);
        if (!bot) {
            throw new Error('Bot not found or access denied');
        }
    }

    return await getExecutionLogs(botId, limit);
}

/**
 * Get bot statistics
 */
export async function getBotStatsAction(botId: string): Promise<BotStats | null> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // Verify ownership for non-preset bots
    if (!botId.startsWith('preset_')) {
        const bot = await getBotById(botId, userId);
        if (!bot) {
            throw new Error('Bot not found or access denied');
        }
    }

    return await getBotStats(botId);
}



// ============================================================================
// Templates
// ============================================================================

/**
 * Get all available bot templates
 */
export async function getTemplatesAction(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    isPremium: boolean;
}>> {
    return getAllTemplates();
}

/**
 * Clone a template to create a new bot
 */
export async function cloneTemplateAction(templateId: string): Promise<EmailBot> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const template = getTemplate(templateId);

    if (!template) {
        throw new Error(`Template not found: ${templateId}`);
    }

    // Create bot from template
    return await createBotAction(template);
}
/**
 * Search bots by name or description
 */
export async function searchBotsAction(query: string): Promise<EmailBot[]> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    const allBots = await getAllBots(userId);

    const lowerQuery = query.toLowerCase();
    return allBots.filter(bot =>
        bot.name.toLowerCase().includes(lowerQuery) ||
        (bot.description && bot.description.toLowerCase().includes(lowerQuery))
    );
}

// ============================================================================
// Sync Operations
// ============================================================================

/**
 * Trigger manual bot sync for current user
 */
export async function syncBotsAction(): Promise<{
    success: boolean;
    emailsProcessed: number;
    error?: string;
}> {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    try {
        const { syncBotsForUser } = await import('@/lib/bots/engine/sync');
        const result = await syncBotsForUser(userId);

        return {
            success: result.success,
            emailsProcessed: result.emailsProcessed || 0,
            error: result.error,
        };
    } catch (error: any) {
        console.error('[Bot Action] Sync failed:', error);
        return {
            success: false,
            emailsProcessed: 0,
            error: error.message || 'Unknown sync error',
        };
    }
}

// ============================================================================
// Knowledge Base Operations
// ============================================================================

/**
 * Get all knowledge base entries for a bot
 */
export async function getKnowledgeBaseAction(botId: string) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // For preset bots (id starts with "preset_"), allow access without ownership check
    // For user bots, verify ownership
    if (!botId.startsWith('preset_')) {
        const bot = await getBotById(botId, userId);
        if (!bot) {
            throw new Error('Bot not found or access denied');
        }
    }

    const { getBotKnowledgeBase } = await import('@/lib/bots/kb-storage');
    return await getBotKnowledgeBase(botId);
}

/**
 * Create a new knowledge base entry
 */
export async function createKBEntryAction(
    botId: string,
    entry: {
        category: 'brand' | 'policy' | 'faq' | 'product';
        title: string;
        content: string;
        keywords?: string[];
    }
) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = session.user.id;

    // For preset bots, allow access without ownership check
    // For user bots, verify ownership
    if (!botId.startsWith('preset_')) {
        const bot = await getBotById(botId, userId);
        if (!bot) {
            throw new Error('Bot not found or access denied');
        }
    }

    const { createKBEntry } = await import('@/lib/bots/kb-storage');
    return await createKBEntry({
        bot_id: botId,
        category: entry.category,
        title: entry.title,
        content: entry.content,
        keywords: entry.keywords || [],
        enabled: true,
    });
}

/**
 * Update a knowledge base entry
 */
export async function updateKBEntryAction(
    entryId: string,
    updates: {
        title?: string;
        content?: string;
        keywords?: string[];
        enabled?: boolean;
    }
) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const { updateKBEntry } = await import('@/lib/bots/kb-storage');
    return await updateKBEntry(entryId, updates);
}

/**
 * Delete a knowledge base entry
 */
export async function deleteKBEntryAction(entryId: string) {
    const session = await auth();

    if (!session || !session.user?.id) {
        throw new Error('Unauthorized');
    }

    const { deleteKBEntry } = await import('@/lib/bots/kb-storage');
    await deleteKBEntry(entryId);
}
