import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { PLAN_LIMITS } from "@/app/api/subscription/status/route";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { google_id, email, refresh_token } = await req.json();

    if (!google_id || !email) return NextResponse.json({ error: "Missing google_id or email" }, { status: 400 });

    const { data: profile } = await supabaseAdmin.from("profiles").select("plan_type, subscription_status").eq("id", userId).single();
    const planType = profile?.plan_type ?? "free";
    const subscriptionStatus = profile?.subscription_status ?? "inactive";

    if (planType !== "free" && subscriptionStatus !== "active") {
        return NextResponse.json({ error: "No active subscription." }, { status: 403 });
    }

    const maxSlots = PLAN_LIMITS[planType] ?? 1;
    const { count: existingCount } = await supabaseAdmin.from("connected_emails").select("*", { count: "exact", head: true }).eq("owner_id", userId);
    const usedSlots = 1 + (existingCount ?? 0);

    if (usedSlots >= maxSlots) return NextResponse.json({ error: `Email slot limit reached.`, usedSlots, maxSlots }, { status: 403 });

    const { error: insertError } = await supabaseAdmin.from("connected_emails").insert({ owner_id: userId, google_id, email, refresh_token });
    if (insertError) return NextResponse.json({ error: "Failed to connect email" }, { status: 500 });

    return NextResponse.json({ success: true, email, usedSlots: usedSlots + 1, maxSlots });
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: emails } = await supabaseAdmin.from("connected_emails").select("id, email, created_at").eq("owner_id", session.user.id).order("created_at", { ascending: true });
    return NextResponse.json({ emails: emails ?? [] });
}
