"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Zap,
    Filter,
    Mail,
    Bot,
    PenLine,
    ArrowRight,
    X,
    CheckCircle2,
} from "lucide-react";
import { markOnboardingCompleteAction } from "@/app/actions/onboarding";

interface Step {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    description: string;
    tip?: string;
}

const steps: Step[] = [
    {
        icon: <Sparkles className="w-8 h-8 text-white" />,
        iconBg: "from-orange-400 to-amber-500",
        title: "Welcome to Zelo Assist! 🎉",
        description:
            "Your inbox just got a whole lot smarter. Zelo Assist connects to your Gmail and uses AI to help you focus on what truly matters — so you spend less time triaging email and more time getting things done.",
        tip: "Everything is private. Your emails are processed on-demand and never stored long-term.",
    },
    {
        icon: <Zap className="w-8 h-8 text-white" />,
        iconBg: "from-amber-500 to-yellow-500",
        title: "AI Urgency Scoring ⚡",
        description:
            "Every email in your inbox is rated from 1–10 by AI. A score of 8+ means it needs your attention today. Lower scores? They can wait. You can sort your inbox by urgency to tackle the most critical messages first.",
        tip: "Hover over the urgency badge on any email to see why it got that score.",
    },
    {
        icon: <Filter className="w-8 h-8 text-white" />,
        iconBg: "from-sky-500 to-blue-600",
        title: "Smart Time Filters 🔍",
        description:
            "Use the filter buttons to focus on emails from the last 24h, 7 days, 30 days, or all time. You can also sort your list by Urgency, Date, or Alphabetically to find what you're looking for instantly.",
        tip: "New emails are loaded fresh from Gmail every time you visit.",
    },
    {
        icon: <PenLine className="w-8 h-8 text-white" />,
        iconBg: "from-purple-500 to-violet-600",
        title: "AI Draft Replies ✍️",
        description:
            "Click any email to open the detail view. From there, hit the Draft Reply button and AI will write a professional response for you in seconds — just review, tweak, and send.",
        tip: "You can pick from multiple tones: professional, friendly, concise.",
    },
    {
        icon: <Bot className="w-8 h-8 text-white" />,
        iconBg: "from-emerald-500 to-green-600",
        title: "Automated Email Bots 🤖",
        description:
            "Set up Bots that automatically act on your emails — monitor threads, send follow-ups, or flag important senders. Bots run in the background so your inbox practically manages itself.",
        tip: 'Find Bots in the sidebar under "Automations".',
    },
];

const slideVariants = {
    enter: (dir: number) => ({
        x: dir > 0 ? 60 : -60,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
        x: dir > 0 ? -60 : 60,
        opacity: 0,
    }),
};

interface OnboardingGuideProps {
    open: boolean;
    onClose: () => void;
}

export function OnboardingGuide({ open, onClose }: OnboardingGuideProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [closing, setClosing] = useState(false);

    const isLast = currentStep === steps.length - 1;

    async function handleFinish() {
        setClosing(true);
        localStorage.setItem("onboarding_complete", "true");
        await markOnboardingCompleteAction();
        onClose();
    }

    function handleNext() {
        if (isLast) {
            handleFinish();
        } else {
            setDirection(1);
            setCurrentStep((s) => s + 1);
        }
    }

    function handleBack() {
        setDirection(-1);
        setCurrentStep((s) => s - 1);
    }

    function handleDismiss() {
        handleFinish();
    }

    if (!open) return null;

    const step = steps[currentStep];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleDismiss();
                    }}
                >
                    <motion.div
                        key="modal"
                        initial={{ scale: 0.88, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 30 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Dismiss button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                            title="Skip guide"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Step content */}
                        <div className="overflow-hidden">
                            <AnimatePresence custom={direction} mode="wait">
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.28, ease: "easeInOut" }}
                                    className="px-8 pt-10 pb-6"
                                >
                                    {/* Icon circle */}
                                    <div className="flex justify-center mb-6">
                                        <div
                                            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center shadow-lg`}
                                        >
                                            {step.icon}
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl font-bold font-serif text-center text-gray-900 dark:text-white mb-3">
                                        {step.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-center text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                        {step.description}
                                    </p>

                                    {/* Tip */}
                                    {step.tip && (
                                        <div className="mt-4 mb-1 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3">
                                            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                                {step.tip}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-2 pb-4">
                            {steps.map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        width: i === currentStep ? 24 : 8,
                                        backgroundColor: i === currentStep ? "#f97316" : "#d1d5db",
                                    }}
                                    transition={{ duration: 0.25 }}
                                    className="h-2 rounded-full"
                                />
                            ))}
                        </div>

                        {/* Footer buttons */}
                        <div className="flex items-center justify-between px-8 pb-8 gap-3">
                            {currentStep > 0 ? (
                                <button
                                    onClick={handleBack}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl transition-all"
                                >
                                    Back
                                </button>
                            ) : (
                                <button
                                    onClick={handleDismiss}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-xl transition-all"
                                >
                                    Skip
                                </button>
                            )}

                            <motion.button
                                onClick={handleNext}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                disabled={closing}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-200 dark:shadow-orange-900/30 transition-all disabled:opacity-70"
                            >
                                {isLast ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Let&apos;s Go!
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </div>

                        {/* Step counter */}
                        <div className="absolute top-5 left-6 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {currentStep + 1} / {steps.length}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
