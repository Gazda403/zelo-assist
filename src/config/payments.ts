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
            starter_monthly: "P-2X240436JD099084WNIKHRMI",
            starter_annual: "P-4C681675K5030801VNIKHRMI",
            pro_monthly: "P-6LA29324VL943072KNIKHRMI",
            pro_annual: "P-82733186C75552323NIKHRMQ",
        }
    },

    // Lemon Squeezy Configuration
    lemonsqueezy: {
        storeId: process.env.LEMONSQUEEZY_STORE_ID || '',
        apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
        webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
        plans: {
            starter_monthly: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID || '',
            starter_annual: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID || '',
            pro_monthly: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || '',
            pro_annual: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || '',
        }
    }
};

/**
 * Maps external Plan IDs to internal Plan Types
 */
export const PLAN_ID_MAP: Record<string, 'starter' | 'pro'> = {
    // PayPal
    "P-2X240436JD099084WNIKHRMI": 'starter',
    "P-4C681675K5030801VNIKHRMI": 'starter',
    "P-6LA29324VL943072KNIKHRMI": 'pro',
    "P-82733186C75552323NIKHRMQ": 'pro',

    // Lemon Squeezy
    // To ensure type safety and dynamic resolution, these are matched against the env variables directly in the webhook handler,
    // but you can hardcode the variant IDs here if they are static.
};
