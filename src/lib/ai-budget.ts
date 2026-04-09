/**
 * AI Budget Manager
 *
 * Enforces per-plan monthly AI spending limits.
 * Budget = 50% of the plan's monthly cost.
 *
 * Gemini 2.5 Flash pricing:
 *   - Input:  $0.30 per 1M tokens
 *   - Output: $2.50 per 1M tokens
 */

import { createAdminClient } from '@/lib/supabase/admin';

// ─── Plan Budget Limits (USD) ────────────────────────────────────────────────

const PLAN_BUDGETS: Record<string, number> = {
    free:      2.00,   // Free trial — generous enough for testing
    starter:   6.995,  // 50% of $13.99
    pro:       19.50,  // 50% of $39.00
    exclusive: Infinity, // Your own account — no limit
};

// ─── Gemini 2.5 Flash Token Costs ───────────────────────────────────────────

const COST_PER_INPUT_TOKEN  = 0.30  / 1_000_000; // $0.30 per 1M
const COST_PER_OUTPUT_TOKEN = 2.50  / 1_000_000; // $2.50 per 1M

/**
 * Calculate the dollar cost of a token usage pair.
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * COST_PER_INPUT_TOKEN) + (outputTokens * COST_PER_OUTPUT_TOKEN);
}

// ─── Budget Check ────────────────────────────────────────────────────────────

/**
 * Returns true if the user has budget remaining this month.
 * Also auto-resets the counter at the start of a new billing period.
 */
export async function hasBudgetRemaining(userId: string): Promise<boolean> {
    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('plan_type, ai_credits_used, ai_credits_reset_at')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        // If we can't check, allow it (fail-open for availability)
        console.warn(`[AI Budget] Could not fetch profile for ${userId}:`, error?.message);
        return true;
    }

    // Auto-reset if we've passed the reset date
    const resetAt = profile.ai_credits_reset_at ? new Date(profile.ai_credits_reset_at) : null;
    if (resetAt && new Date() >= resetAt) {
        const nextReset = new Date();
        nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
        nextReset.setUTCDate(1);
        nextReset.setUTCHours(0, 0, 0, 0);

        await supabase
            .from('profiles')
            .update({
                ai_credits_used: 0,
                ai_credits_reset_at: nextReset.toISOString(),
            })
            .eq('id', userId);

        console.log(`[AI Budget] Monthly reset for user ${userId}`);
        return true;
    }

    const planType = profile.plan_type ?? 'free';
    // Override for the owner account
    if (userId === 'brankovicaleksandar2404@gmail.com') return true;

    const limit = PLAN_BUDGETS[planType] ?? PLAN_BUDGETS.free;
    const used  = profile.ai_credits_used ?? 0;

    if (used >= limit) {
        console.log(`[AI Budget] User ${userId} (${planType}) has exhausted their monthly AI budget: $${used.toFixed(4)} / $${limit}`);
        return false;
    }

    return true;
}

// ─── Usage Logging ───────────────────────────────────────────────────────────

/**
 * Record AI token usage for a user after a successful AI call.
 * Safe to call fire-and-forget (errors are swallowed).
 */
export async function trackAiUsage(
    userId: string,
    inputTokens: number,
    outputTokens: number,
): Promise<void> {
    const cost = calculateCost(inputTokens, outputTokens);
    if (cost <= 0) return;

    const supabase = createAdminClient();

    // Atomically increment the credits used
    const { error } = await supabase.rpc('increment_ai_credits', {
        p_user_id: userId,
        p_amount:  cost,
    });

    if (error) {
        // Non-fatal: log and continue
        console.error(`[AI Budget] Failed to track usage for ${userId}:`, error.message);
    } else {
        console.log(`[AI Budget] Charged $${cost.toFixed(6)} (${inputTokens}in / ${outputTokens}out) to user ${userId}`);
    }
}

// ─── Convenience Wrapper ─────────────────────────────────────────────────────

/**
 * Get the current AI usage summary for a user.
 * Used for display in the dashboard.
 */
export async function getAiUsageSummary(userId: string): Promise<{
    used: number;
    limit: number;
    percentUsed: number;
    resetAt: Date | null;
    planType: string;
}> {
    const supabase = createAdminClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type, ai_credits_used, ai_credits_reset_at')
        .eq('id', userId)
        .single();

    const planType = profile?.plan_type ?? 'free';
    const limit = userId === 'brankovicaleksandar2404@gmail.com'
        ? Infinity
        : (PLAN_BUDGETS[planType] ?? PLAN_BUDGETS.free);
    const used = profile?.ai_credits_used ?? 0;

    return {
        used,
        limit,
        percentUsed: limit === Infinity ? 0 : (used / limit) * 100,
        resetAt: profile?.ai_credits_reset_at ? new Date(profile.ai_credits_reset_at) : null,
        planType,
    };
}
