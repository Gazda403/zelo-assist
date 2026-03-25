"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Star } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { CheckoutModal } from '../checkout/CheckoutModal';

interface PlanPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "10 days trial, then limited access",
        features: ["1 email account", "Up to 3 bots", "Basic analytics"],
        buttonText: "Get Started Free",
        highlighted: false,
        planId: null,
        icon: null,
    },
    {
        name: "Starter",
        monthlyPrice: 13.99,
        annualPrice: 134.28,
        description: "For small teams & startups",
        features: ["Up to 3 email accounts", "Up to 3 bots", "Advanced analytics", "Standard support"],
        buttonText: "Subscribe — Starter",
        highlighted: true,
        monthlyPlanId: "P-0G345889PP367702PNHCEERA",
        annualPlanId: "P-74N72422VD313690PNHCEERA",
        icon: <Star className="w-4 h-4" />,
    },
    {
        name: "Pro",
        monthlyPrice: 39,
        annualPrice: 374.40,
        description: "Advanced automation power",
        features: ["Up to 10 email accounts", "Unlimited bots", "All triggers", "Priority support"],
        buttonText: "Subscribe — Pro",
        highlighted: false,
        monthlyPlanId: "P-5M650937436226326NHCEERA",
        annualPlanId: "P-2W102421T2805691UNHCEERI",
        icon: <Zap className="w-4 h-4" />,
    }
];

export function PlanPickerModal({ isOpen, onClose }: PlanPickerModalProps) {
    const [isAnnual, setIsAnnual] = useState(true);
    const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: number | string; planId: string } | null>(null);

    const handlePlanSelect = (plan: typeof plans[number]) => {
        if (plan.name === "Free") {
            signIn('google');
            onClose();
            return;
        }
        const price = isAnnual && 'annualPrice' in plan ? (plan.annualPrice! / 12).toFixed(2) : plan.monthlyPrice;
        const planId = isAnnual && 'annualPlanId' in plan ? plan.annualPlanId! : ('monthlyPlanId' in plan ? (plan as any).monthlyPlanId! : '');
        if (!planId) return;
        setCheckoutPlan({ name: plan.name, price: price ?? plan.monthlyPrice ?? 0, planId });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {checkoutPlan ? (
                <CheckoutModal
                    isOpen={true}
                    onClose={() => setCheckoutPlan(null)}
                    planName={`${checkoutPlan.name} (${isAnnual ? 'Annual' : 'Monthly'})`}
                    planPrice={checkoutPlan.price}
                    planId={checkoutPlan.planId}
                />
            ) : (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-b from-orange-50/50 to-white">
                            <div>
                                <h3 className="text-3xl font-extrabold text-[#292524] tracking-tight mb-2">Choose your plan</h3>
                                <p className="text-sm text-orange-900/70">Secure your spot. Cancel anytime. No hidden fees.</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-orange-100/50 transition-colors text-stone-400 hover:text-[#292524] -mt-6">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Billing Toggle */}
                            <div className="flex justify-center mb-10">
                                <div className="relative flex items-center p-1 bg-orange-50/50 rounded-full border border-orange-100/50 backdrop-blur-sm">
                                    <button
                                        onClick={() => setIsAnnual(true)}
                                        className={`relative w-48 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${isAnnual ? 'text-[#1C1917] shadow-sm bg-white' : 'text-stone-500 hover:text-primary'}`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            Bill annually
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs">
                                                Save 20%
                                            </span>
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

                            {/* Plan Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                                {plans.map((plan) => (
                                    <motion.div
                                        key={plan.name}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        className={`group relative rounded-3xl p-6 flex flex-col transition-all duration-300 cursor-pointer ${plan.highlighted
                                            ? 'bg-white border-2 border-transparent bg-clip-padding shadow-xl before:absolute before:inset-[-2px] before:-z-10 before:rounded-[26px] before:bg-gradient-to-b before:from-orange-200 before:to-transparent'
                                            : 'bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-xl hover:bg-white hover:border-transparent hover:before:absolute hover:before:inset-[-2px] hover:before:-z-10 hover:before:rounded-[26px] hover:before:bg-gradient-to-b hover:before:from-orange-100 hover:before:to-transparent'
                                            }`}
                                        onClick={() => handlePlanSelect(plan)}
                                    >
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                {plan.icon && <span className="text-primary">{plan.icon}</span>}
                                                <h4 className={`text-2xl font-semibold ${plan.highlighted ? 'text-[#1C1917]' : 'text-gray-900'}`}>{plan.name}</h4>
                                            </div>
                                            <p className="text-gray-500 text-xs mb-4 h-8">{plan.description}</p>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold tracking-tight text-[#1C1917]">
                                                    {'monthlyPrice' in plan
                                                        ? `$${isAnnual ? (plan.monthlyPrice! * 0.8).toFixed(2) : plan.monthlyPrice}`
                                                        : plan.price}
                                                </span>
                                                {isAnnual && 'monthlyPrice' in plan && (
                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">
                                                        Save ${(plan.monthlyPrice! * 0.2 * 12).toFixed(2)}/yr
                                                    </span>
                                                )}
                                            </div>
                                            {'monthlyPrice' in plan && (
                                                <p className="text-[10px] text-gray-400 mt-1 h-4">
                                                    {isAnnual ? `per year. (~$${(plan.monthlyPrice! * 0.8).toFixed(2)}/mo)` : "per month, billed monthly."}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 mb-6 ${plan.highlighted
                                                ? 'bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40'
                                                : 'bg-white text-gray-900 border border-gray-200 group-hover:border-primary/50 hover:bg-gray-50'
                                                }`}
                                        >
                                            {plan.buttonText}
                                        </button>

                                        {/* Separator */}
                                        <div className="flex items-center justify-center gap-2 mb-6 text-gray-200">
                                            <div className="h-px bg-gray-100 flex-1"></div>
                                            <span className="text-sm text-primary/30 font-serif">✧</span>
                                            <div className="h-px bg-gray-100 flex-1"></div>
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">What's included:</p>
                                            <ul className="space-y-3">
                                                {plan.features.map((f) => (
                                                    <li key={f} className="flex gap-2 text-xs text-gray-600">
                                                        <div className="w-4 h-4 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 mt-0.5">
                                                            <Check className="w-2.5 h-2.5 text-primary stroke-[3px]" />
                                                        </div>
                                                        <span className="leading-tight">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
