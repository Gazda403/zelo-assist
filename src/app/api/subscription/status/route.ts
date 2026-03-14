import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plan limits
export const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    starter: 3,
    pro: 10,
};

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("subscription_status, plan_type, current_period_end")
        .eq("id", userId)
        .single();

    if (profileError && profileError.code !== "PGRST116") {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    const planType = profile?.plan_type ?? "free";
    const subscriptionStatus = profile?.subscription_status ?? "inactive";
    const maxSlots = PLAN_LIMITS[planType] ?? 1;

    // Count connected emails
    const { count: connectedCount } = await supabaseAdmin
        .from("connected_emails")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

    const usedSlots = 1 + (connectedCount ?? 0);

    return NextResponse.json({
        planType,
        subscriptionStatus,
        maxSlots,
        usedSlots,
        remainingSlots: Math.max(0, maxSlots - usedSlots),
        currentPeriodEnd: profile?.current_period_end ?? null,
        isActive: subscriptionStatus === "active" || planType === "free",
    });
}
