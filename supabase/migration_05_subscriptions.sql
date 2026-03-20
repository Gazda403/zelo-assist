-- Migration 05: Add Payment and Subscription tracking to profiles
-- Tracks the user's active SaaS subscription via PayPal

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS paypal_subscription_id text,
ADD COLUMN IF NOT EXISTS current_period_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone;

-- Also create an index for faster lookups by paypal_subscription_id (useful for webhooks)
CREATE INDEX IF NOT EXISTS idx_profiles_paypal_sub_id ON public.profiles(paypal_subscription_id);
