"use server";

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marks the current user's onboarding as complete in the database.
 * Called after the user finishes the onboarding guide.
 */
export async function markOnboardingCompleteAction(): Promise<{ success: boolean }> {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.email);

    if (error) {
        console.error("Failed to mark onboarding complete:", error);
        return { success: false };
    }

    console.log("Onboarding marked complete for:", session.user.email);
    return { success: true };
}
