"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Infinity } from 'lucide-react';
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
    alwaysFreeFeature?: string;
    buttonText: string;
    highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
    {
        name: "Free Trial",
        description: "Experience the full power of XeloFlow.",
        target: "Free",
        monthlyPrice: "$0",
        billingText: "7 days full access, then limited. Sequencing stays free.",
        alwaysFreeFeature: "Email Sequencing & Sending — free forever",
        features: [
            "Unlimited active bots",
            "Unlimited connected emails",
            "All premium AI templates",
            "Advanced workflows & automations",
            "7 days of full unrestricted access"
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

interface PricingProps {
    onGetStarted?: () => void;
}

export function Pricing({ onGetStarted }: PricingProps = {}) {
    const [isAnnual, setIsAnnual] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

    // Actual Sandbox Plan IDs generated via PayPal API
    const PLAN_IDS: Record<string, { monthly: string; annual: string }> = {
        "Starter": {
            monthly: "P-0G345889PP367702PNHCEERA",
            annual: "P-74N72422VD313690PNHCEERA"
        },
        "Pro": {
            monthly: "P-5M650937436226326NHCEERA",
            annual: "P-2W102421T2805691UNHCEERI"
        }
    };

    const handleCheckout = (tier: PricingTier) => {
        if (tier.name === "Free") {
            if (onGetStarted) {
                onGetStarted();
            }
            return;
        }
        setSelectedTier(tier);
        setIsCheckoutOpen(true);
    };

    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-gradient-to-b from-orange-50/30 to-white">
            {/* Background decorations matching the reference but switched to orange */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                        <span className="text-sm font-medium text-gray-700">Transparent pricing</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-extrabold text-[#292524] tracking-tight mb-6 mt-4">
                        Individual Plans
                    </h2>
                    <p className="text-lg text-orange-900/70 text-balance">
                        Receive unlimited credits when you pay yearly, and save on your plan.
                    </p>

                    {/* Billing Toggle */}
                    <div className="mt-10 flex justify-center px-4">
                        <div className="relative flex items-center p-1 bg-orange-50/50 rounded-full border border-orange-100/50 backdrop-blur-sm w-full max-w-[340px] sm:max-w-md">
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`relative flex-1 sm:w-48 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${isAnnual ? 'text-[#1C1917] shadow-sm bg-white' : 'text-stone-500 hover:text-primary'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-1 sm:gap-2">
                                    Bill annually
                                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] sm:text-xs whitespace-nowrap">
                                        Save 20%
                                    </span>
                                </span>
                            </button>
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`relative flex-1 sm:w-36 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${!isAnnual ? 'text-[#1C1917] shadow-sm bg-white' : 'text-stone-500 hover:text-primary'
                                    }`}
                            >
                                Bill monthly
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {pricingTiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8 }}
                            className={`group relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${tier.highlighted
                                ? 'bg-white border-2 border-transparent bg-clip-padding shadow-xl before:absolute before:inset-[-2px] before:-z-10 before:rounded-[26px] before:bg-gradient-to-b before:from-orange-200 before:to-transparent'
                                : 'bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-xl hover:bg-white hover:border-transparent hover:before:absolute hover:before:inset-[-2px] hover:before:-z-10 hover:before:rounded-[26px] hover:before:bg-gradient-to-b hover:before:from-orange-100 hover:before:to-transparent'
                                }`}
                        >
                            <div className="mb-8">
                                <h3 className={`text-2xl font-semibold mb-2 ${tier.highlighted ? 'text-[#1C1917]' : 'text-gray-900'}`}>
                                    {tier.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 h-10">{tier.description}</p>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold tracking-tight text-[#1C1917]">
                                        {typeof tier.monthlyPrice === 'number'
                                            ? `$${isAnnual ? (tier.monthlyPrice * 0.8).toFixed(2) : tier.monthlyPrice}`
                                            : tier.monthlyPrice}
                                    </span>
                                    {isAnnual && typeof tier.monthlyPrice === 'number' && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                                Save ${(tier.monthlyPrice * 0.2 * 12).toFixed(2)}/yr
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-2 h-8">
                                    {isAnnual && tier.annualBillingText ? tier.annualBillingText : tier.billingText}
                                </p>
                            </div>

                            <button
                                onClick={() => handleCheckout(tier)}
                                className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 ${tier.highlighted
                                    ? 'bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40'
                                    : 'bg-white text-gray-900 border border-gray-200 group-hover:border-primary/50 hover:bg-gray-50'
                                    }`}
                            >
                                {tier.buttonText}
                            </button>

                            {/* Separator */}
                            <div className="flex items-center justify-center gap-2 my-8 text-gray-200">
                                <div className="h-px bg-gray-100 flex-1"></div>
                                <span className="text-lg text-primary/30 font-serif">✧</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>

                            <div className="flex-1">
                                {tier.alwaysFreeFeature && (
                                    <div className="mb-5 flex items-center gap-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-4 py-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                            <Infinity className="w-3 h-3 text-white stroke-[2.5px]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-emerald-800 leading-tight">{tier.alwaysFreeFeature}</p>
                                            <p className="text-[10px] text-emerald-600 mt-0.5">Even after your trial ends</p>
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Trial includes:</p>
                                <ul className="space-y-4">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex gap-3 text-sm text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                                <Check className="w-3 h-3 text-primary stroke-[3px]" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
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
