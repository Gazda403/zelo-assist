"use server";

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Records a referral when a new user signs up.
 * This is called during the first login if a ref code is present.
 */
export async function recordReferralAction(referrerId: string) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || userId === referrerId) {
        return { success: false, error: "Invalid user or self-referral" };
    }

    const supabase = createAdminClient();

    // Check if user was already referred
    const { data: existing } = await supabase
        .from("referrals")
        .select("id")
        .eq("referred_user_id", userId)
        .single();

    if (existing) {
        return { success: false, error: "Already referred" };
    }

    const { error } = await supabase
        .from("referrals")
        .insert({
            referrer_id: referrerId,
            referred_user_id: userId,
            status: 'signed_up'
        });

    if (error) {
        console.error("Failed to record referral:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Gets referral statistics for the current user.
 */
export async function getReferralStatsAction() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) return { count: 0 };

    const supabase = createAdminClient();

    const { count, error } = await supabase
        .from("referrals")
        .select("*", { count: 'exact', head: true })
        .eq("referrer_id", userId);

    if (error) {
        console.error("Failed to fetch referral stats:", error);
        return { count: 0 };
    }

    return { count: count || 0 };
}

/**
 * OUTREACH LEADS ACTIONS
 */

export async function getOutreachLeadsAction() {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("outreach_leads")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch leads:", error);
        return [];
    }

    return data;
}

export async function addOutreachLeadAction(lead: { name: string, email: string, company?: string, source?: string }) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false };

    const supabase = await createClient();
    const { error } = await supabase
        .from("outreach_leads")
        .insert({
            ...lead,
            user_id: userId
        });

    if (error) {
        console.error("Failed to add lead:", error);
        return { success: false };
    }

    return { success: true };
}

export async function updateLeadStatusAction(leadId: string, status: string, pitchUsed?: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false };

    const supabase = await createClient();
    const { error } = await supabase
        .from("outreach_leads")
        .update({ status, pitch_used: pitchUsed })
        .eq("id", leadId)
        .eq("user_id", userId);

    if (error) {
        console.error("Failed to update lead:", error);
        return { success: false };
    }

    return { success: true };
}
