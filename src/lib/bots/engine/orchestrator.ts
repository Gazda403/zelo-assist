/**
 * Email Bots System - Orchestrator
 * 
 * Main entry point for bot execution.
 * Coordinates trigger evaluation, condition checking, safety validation,
 * and action execution.
 */

import type { EmailEvent, EmailBot, ActionResult } from '../types';
import { getEnabledBots } from '../storage';
import { logExecution, updateBotStats } from '../storage';
import { evaluateTrigger } from './triggers';
import { evaluateConditions } from './conditions';
import { executeActions } from './actions';
import { checkSafety } from './safety';
import { analyzeEmailTelemetry } from './analysis';

// ============================================================================
// Main Orchestrator
// ============================================================================

/**
 * Execute all matching bots for an email event
 * Called when new email is received
 * 
 * CRITICAL: Never throws - failures are logged but don't block inbox
 */
export async function executeBots(
    event: EmailEvent,
    userId: string,
    specificBots?: EmailBot[]
): Promise<void> {
    try {
        // Get all enabled bots for user if not provided
        const bots = specificBots || await getEnabledBots(userId);

        if (bots.length === 0) {
            return; // No bots configured
        }

        console.log(`[Bots] Evaluating ${bots.length} bots for email: ${event.subject}`);

        // Process each bot
        for (const bot of bots) {
            await executeSingleBot(bot, event);
        }
    } catch (error) {
        // Top-level safety net - log but don't throw
        console.error('[Bots] Orchestrator error:', error);
    }
}

/**
 * Execute a single bot against an event
 */
async function executeSingleBot(
    bot: EmailBot,
    event: EmailEvent
): Promise<void> {
    try {
        // Step 1: Evaluate trigger
        const triggerMatched = await evaluateTrigger(bot.trigger, event);

        if (!triggerMatched) {
            return; // Trigger didn't match
        }

        console.log(`[Bot ${bot.name}] Trigger matched`);

        // Step 2: Evaluate conditions (AND logic)
        const conditionsPassed = evaluateConditions(bot.conditions, event);

        if (!conditionsPassed) {
            console.log(`[Bot ${bot.name}] Conditions not met`);
            return;
        }

        console.log(`[Bot ${bot.name}] All conditions passed`);

        // Step 3: Analyze telemetry for dashboard AND action context
        const analysis = analyzeEmailTelemetry(event);
        console.log(`[Bot ${bot.name}] Intent detected: ${analysis.intent} (Risk: ${analysis.riskScore})`);

        // Step 4: Safety checks
        const safetyResult = await checkSafety(bot, event, analysis.intent);

        if (!safetyResult.allowed) {
            console.log(`[Bot ${bot.name}] Blocked by safety: ${safetyResult.reason}`);

            // Log the block
            await logExecution({
                id: crypto.randomUUID(),
                botId: bot.id,
                emailId: event.emailId,
                triggeredAt: new Date(),
                status: 'safety_blocked',
                actionsExecuted: [],
                errorMessage: safetyResult.reason,
                metadata: {
                    senderEmail: event.sender.email,
                    subject: event.subject,
                },
            });

            return;
        }

        // Step 5: Execute actions
        const results = await executeActions(bot.actions, event, bot, analysis.intent);

        // Step 6: Determine overall status
        const allSuccess = results.every(r => r.success);
        const status = allSuccess ? 'success' : 'failure';

        // Count sends and drafts
        const emailsSent = results.filter(r =>
            r.success && (r.type === 'auto_send_email' || r.type === 'reply_with_template')
        ).length;

        const draftsCreated = results.filter(r =>
            r.success && r.type === 'create_draft'
        ).length;

        // Step 6: Log execution
        await logExecution({
            id: crypto.randomUUID(),
            botId: bot.id,
            emailId: event.emailId,
            triggeredAt: new Date(),
            status,
            actionsExecuted: results.filter(r => r.success).map(r => r.type),
            errorMessage: results.find(r => !r.success)?.error,
            metadata: {
                senderEmail: event.sender.email,
                subject: event.subject,
                results,
                telemetry: analysis // Inject analysis into metadata
            },
        });

        // Step 7: Update stats
        const lastUsedTemplate = results.find(r =>
            r.success && (r.type === 'auto_send_email' || r.type === 'reply_with_template')
        )?.data?.templateName;

        await updateBotStats(bot.id, {
            success: allSuccess,
            emailsSent,
            draftsCreated,
            lastUsedTemplate
        });

        console.log(`[Bot ${bot.name}] Execution complete - ${status}`);
    } catch (error: any) {
        // Bot execution failed - log but don't throw
        console.error(`[Bot ${bot.name}] Execution error:`, error);

        await logExecution({
            id: crypto.randomUUID(),
            botId: bot.id,
            emailId: event.emailId,
            triggeredAt: new Date(),
            status: 'failure',
            actionsExecuted: [],
            errorMessage: error.message || 'Unknown error',
            metadata: {
                senderEmail: event.sender.email,
                subject: event.subject,
            },
        });

        await updateBotStats(bot.id, {
            success: false,
        });
    }
}

/**
 * Test bot execution (dry-run mode)
 * Returns what would happen without actually executing
 */
export async function testBot(
    bot: EmailBot,
    event: EmailEvent
): Promise<{
    triggerMatched: boolean;
    conditionsPassed: boolean;
    safetyAllowed: boolean;
    safetyReason?: string;
    wouldExecute: boolean;
    plannedActions: string[];
}> {
    const triggerMatched = await evaluateTrigger(bot.trigger, event);
    const conditionsPassed = evaluateConditions(bot.conditions, event);
    const analysis = analyzeEmailTelemetry(event);
    const safetyResult = await checkSafety(bot, event, analysis.intent);

    return {
        triggerMatched,
        conditionsPassed,
        safetyAllowed: safetyResult.allowed,
        safetyReason: safetyResult.reason,
        wouldExecute: triggerMatched && conditionsPassed && safetyResult.allowed,
        plannedActions: bot.actions.map(a => a.type),
    };
}
