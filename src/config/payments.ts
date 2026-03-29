/**
 * Global Payment Configuration
 * 
 * Centralized settings for all payment providers (PayPal, Paddle).
 * Use these constants throughout the app for checkout and plan mapping.
 */

export const PAYMENT_CONFIG = {
    // Current environment
    isProduction: process.env.NODE_ENV === 'production',

    // PayPal Configuration
    paypal: {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        environment: process.env.PAYPAL_ENVIRONMENT || 'production',
        plans: {
            starter_monthly: "P-0G345889PP367702PNHCEERA",
            starter_annual: "P-74N72422VD313690PNHCEERA",
            pro_monthly: "P-5M650937436226326NHCEERA",
            pro_annual: "P-2W102421T2805691UNHCEERI",
        }
    },

    // Paddle Configuration (Sandbox placeholders - user to update with real IDs)
    paddle: {
        sellerId: process.env.NEXT_PUBLIC_PADDLE_SELLER_ID || '',
        apiKey: process.env.PADDLE_API_KEY || '',
        publicKey: process.env.PADDLE_PUBLIC_KEY || '',
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox', // 'sandbox' or 'production'
        plans: {
            starter_monthly: process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY_ID || '',
            starter_annual: process.env.NEXT_PUBLIC_PADDLE_STARTER_ANNUAL_ID || '',
            pro_monthly: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_ID || '',
            pro_annual: process.env.NEXT_PUBLIC_PADDLE_PRO_ANNUAL_ID || '',
        }
    }
};

/**
 * Maps external Plan IDs to internal Plan Types
 */
export const PLAN_ID_MAP: Record<string, 'starter' | 'pro'> = {
    // PayPal
    "P-0G345889PP367702PNHCEERA": 'starter',
    "P-74N72422VD313690PNHCEERA": 'starter',
    "P-5M650937436226326NHCEERA": 'pro',
    "P-2W102421T2805691UNHCEERI": 'pro',

    // Paddle placeholders (populate these when user provides IDs)
};
