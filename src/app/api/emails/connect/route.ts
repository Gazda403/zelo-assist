import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    starter: 3,
    pro: 10,
};

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { google_id, email, refresh_token } = await req.json();

    if (!google_id || !email) {
        return NextResponse.json({ error: "Missing google_id or email" }, { status: 400 });
    }

    // Get the user's plan type
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan_type, subscription_status")
        .eq("id", userId)
        .single();

    const planType = profile?.plan_type ?? "free";
    const subscriptionStatus = profile?.subscription_status ?? "inactive";

    // Free users without active subscription still get 1 slot (their own account)
    // Only allow connecting extras if subscription is active
    if (planType !== "free" && subscriptionStatus !== "active") {
        return NextResponse.json(
            { error: "No active subscription. Please subscribe to connect additional email accounts." },
            { status: 403 }
        );
    }

    const maxSlots = PLAN_LIMITS[planType] ?? 1;

    // Count existing extra connections
    const { count: existingCount } = await supabaseAdmin
        .from("connected_emails")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

    // +1 because primary account always occupies 1 slot
    const usedSlots = 1 + (existingCount ?? 0);

    if (usedSlots >= maxSlots) {
        return NextResponse.json(
            {
                error: `Email slot limit reached. Your ${planType} plan allows ${maxSlots} email account(s).`,
                usedSlots,
                maxSlots
            },
            { status: 403 }
        );
    }

    // Check if this email is already connected
    const { data: existing } = await supabaseAdmin
        .from("connected_emails")
        .select("id")
        .eq("owner_id", userId)
        .eq("email", email)
        .single();

    if (existing) {
        return NextResponse.json({ message: "Email already connected", alreadyConnected: true });
    }

    // Insert the new connected email
    const { error: insertError } = await supabaseAdmin
        .from("connected_emails")
        .insert({ owner_id: userId, google_id, email, refresh_token });

    if (insertError) {
        console.error("[connect-email] Insert error:", insertError);
        return NextResponse.json({ error: "Failed to connect email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, email, usedSlots: usedSlots + 1, maxSlots });
}

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: emails, error } = await supabaseAdmin
        .from("connected_emails")
        .select("id, email, created_at")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    return NextResponse.json({ emails: emails ?? [] });
}
