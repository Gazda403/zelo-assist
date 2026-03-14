
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { CheckoutModal } from '../checkout/CheckoutModal';

interface PricingTier {
    name: string;
    description: string;
    target: string;
    monthlyPrice: number | string;
    annualPrice?: number;
    billingText: string;
    annualBillingText?: string;
    features: string[];
    buttonText: string;
    highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
    {
        name: "Free",
        description: "Great for testing the waters.",
        target: "Free",
        monthlyPrice: "$0",
        billingText: "is just a trial 10 days of pro before lock out",
        features: [
            "Up to 3 active bots",
            "Startup, E-Commerce, Follow-Up, Generic bots",
            "Auto-send safe emails",
            "Basic workflows & analytics dashboard",
            "Standard email support",
            "Standard triggers + urgency & time-based"
        ],
        buttonText: "Get started",
        highlighted: false,
    },
    {
        name: "Starter",
        description: "For small teams and startups.",
        target: "Starter",
        monthlyPrice: 13.99,
        annualPrice: 134.28,
        billingText: "per month, billed monthly.",
        annualBillingText: "per year. (~$11.19/mo)",
        features: [
            "Up to 3 active bots",
            "Startup, E-Commerce, Follow-Up, Generic bots",
            "Auto-send safe emails",
            "Basic workflows & analytics dashboard",
            "Standard email support",
            "Standard triggers + urgency & time-based"
        ],
        buttonText: "Get started",
        highlighted: true,
    },
    {
        name: "Pro",
        description: "Advanced automation power.",
        target: "Pro",
        monthlyPrice: 39,
        annualPrice: 374.40,
        billingText: "per month, billed monthly.",
        annualBillingText: "per year. (~$31.20/mo)",
        features: [
            "Unlimited active bots",
            "All preset bots included",
            "All triggers + advanced triggers",
            "Shopify/WooCommerce API access",
            "Advanced workflows & multi-step automations",
            "Priority email support"
        ],
        buttonText: "Get started",
        highlighted: false,
    }
];

export function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

    const PLAN_IDS: Record<string, { monthly: string; annual: string }> = {
        "Starter": {
            monthly: "P-5T3678661N225224LNGY4T4I",
            annual: "P-7LU13169F7423202JNGY4T4I"
        },
        "Pro": {
            monthly: "P-062658637E219450YNGY4T4I",
            annual: "P-2US94421VA592105WNGY4T4Q"
        }
    };

    const handleCheckout = (tier: PricingTier) => {
        if (tier.name === "Free") {
            return;
        }
        setSelectedTier(tier);
        setIsCheckoutOpen(true);
    };

    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-[#292524] tracking-tight mb-6 mt-4">
                        Individual Plans
                    </h2>
                    <div className="mt-10 flex justify-center">
                        <div className="relative flex items-center p-1 bg-orange-50/50 rounded-full border border-orange-100/50 backdrop-blur-sm">
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`relative w-48 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${isAnnual ? 'text-[#1C1917] shadow-sm bg-white' : 'text-stone-500 hover:text-primary'}`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Bill annually
                                </span>
                            </button>
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`relative w-36 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${!isAnnual ? 'text-[#1C1917] shadow-sm bg-white' : 'text-stone-500 hover:text-primary'}`}
                            >
                                Bill monthly
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {pricingTiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`group relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${tier.highlighted ? 'bg-white border-2 border-transparent bg-clip-padding shadow-xl' : 'bg-white/80 border border-gray-100'}`}
                        >
                            <h3 className="text-2xl font-semibold mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-bold tracking-tight">
                                    {typeof tier.monthlyPrice === 'number'
                                        ? `$${isAnnual ? (tier.monthlyPrice * 0.8).toFixed(2) : tier.monthlyPrice}`
                                        : tier.monthlyPrice}
                                </span>
                            </div>
                            <button
                                onClick={() => handleCheckout(tier)}
                                className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 ${tier.highlighted ? 'bg-primary text-white' : 'bg-white text-gray-900 border border-gray-200'}`}
                            >
                                {tier.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {selectedTier && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    planName={`${selectedTier.name} (${isAnnual ? 'Annual' : 'Monthly'})`}
                    planPrice={isAnnual && selectedTier.annualPrice ? (selectedTier.annualPrice / 12).toFixed(2) : selectedTier.monthlyPrice}
                    planId={isAnnual ? PLAN_IDS[selectedTier.name]?.annual : PLAN_IDS[selectedTier.name]?.monthly}
                />
            )}
        </section>
    );
}
