import { NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { PAYMENT_CONFIG } from '@/config/payments';

// Need a way to map the generic "planId" back to Lemon Squeezy variant if planId passed is a PayPal one or a custom internal one,
// but let's assume the frontend will pass the correct Lemon Squeezy variant ID as `variantId`.
// Or we just expect `variantId` in the body.

export async function POST(req: Request) {
    try {
        const { variantId, customUserId, userEmail } = await req.json();

        if (!variantId) {
            return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 });
        }

        lemonSqueezySetup({ apiKey: PAYMENT_CONFIG.lemonsqueezy.apiKey });

        const newCheckout = {
            checkoutOptions: {
                embed: false,
                media: true,
                logo: true,
            },
            checkoutData: {
                email: userEmail || undefined,
                custom: {
                    user_id: customUserId || 'anonymous',
                },
            },
            productOptions: {
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                receiptButtonText: 'Go to Dashboard',
                receiptThankYouNote: 'Thank you for your purchase!'
            }
        };

        const { error, data } = await createCheckout(
            PAYMENT_CONFIG.lemonsqueezy.storeId,
            variantId,
            newCheckout
        );


        if (error) {
            console.error('[Lemon Squeezy Checkout] Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ url: data?.data?.attributes?.url });
    } catch (error: any) {
        console.error('[Lemon Squeezy Checkout] Exception:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
