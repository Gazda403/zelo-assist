import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    // Initialize inside the handler so env vars are available at request time
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { planId, referenceCode } = body;

        // In a real application, you might want a separate table for `transactions` or `invoices`
        // to track individual bank transfer attempts, receipts, etc.
        // For MVP SaaS: we update the user's profile status to pending so an Admin can manually approve.

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: 'pending_bank_transfer',
                // Optional: Store the reference code temporarily in a metadata jsonb field if you add one,
                // or just rely on the user ID for manual cross-referencing with your bank statements.
            })
            // Update the user using their NextAuth email (since id is NextAuth user ID but email is unique and available here).
            // It's safer to query profiles to fetch their ID first if needed, but if profiles.id == session.user.id this is easy.
            // But wait, authOptions might not expose session.user.id. Let's assume username/email.
            // If the user hasn't logged in with Google/GitHub, they might not have a profile yet in NextAuth.
            // Make sure your NextAuth configuration injects `id` into `session.user`.
            .eq('id', (session.user as any).id); // Ensure you've mapped user ID into the session in NextAuth callbacks

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
