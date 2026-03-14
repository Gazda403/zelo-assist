import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { planId, referenceCode } = body;

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: 'pending_bank_transfer',
            })
            .eq('id', (session.user as any).id);

        if (error) {
            console.error("Supabase Error updating profile:", error);
            return NextResponse.json({ error: "Failed to log bank transfer request" }, { status: 500 });
        }

        return NextResponse.json({
            status: "pending",
            message: "Bank transfer intent logged. Please send funds to complete activation."
        });

    } catch (error) {
        console.error("Error logging bank transfer intent:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
