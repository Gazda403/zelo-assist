"use server";

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marks the current user's onboarding as complete in the database.
 * Called after the user finishes the onboarding guide.
 */
export async function markOnboardingCompleteAction(): Promise<{ success: boolean }> {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);

    if (error) {
        console.error("Failed to mark onboarding complete:", error);
        return { success: false };
    }

    console.log("Onboarding marked complete for:", session.user.id);
    return { success: true };
}

/**
 * Resets onboarding status for the current user.
 */
export async function resetOnboardingAction(): Promise<{ success: boolean }> {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: false })
        .eq("id", session.user.id);

    if (error) {
        console.error("Failed to reset onboarding:", error);
        return { success: false };
    }

    return { success: true };
}
