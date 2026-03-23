import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    starter: 3,
    pro: 10,
    exclusive: 999,
};

const ADMIN_EMAIL = "brankovicaleksandar2404@gmail.com";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch profile (subscription status & plan type)
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("subscription_status, plan_type, current_period_end")
        .eq("id", userId)
        .single();

    if (profileError && profileError.code !== "PGRST116") {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    let planType = profile?.plan_type ?? "free";
    let subscriptionStatus = profile?.subscription_status ?? "inactive";

    // Admin override
    if (session.user.email === ADMIN_EMAIL) {
        planType = "exclusive";
        subscriptionStatus = "active";
    }

    const maxSlots = PLAN_LIMITS[planType] ?? 1;

    // Count connected emails (the primary account always counts as 1)
    const { count: connectedCount } = await supabaseAdmin
        .from("connected_emails")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

    // Primary account always uses 1 slot
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
