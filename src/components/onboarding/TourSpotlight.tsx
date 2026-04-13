"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, MousePointerClick } from "lucide-react";
import { markOnboardingCompleteAction } from "@/app/actions/onboarding";
import { usePathname, useRouter } from "next/navigation";

// ─── Step Definitions ───────────────────────────────────────────────────────

interface TourStep {
    targetId: string | null;
    path: string;
    title: string;
    description: string;
    /** 'button' = user clicks Next in the tooltip; 'element-click' = user must click the spotlit element */
    nextType: "button" | "element-click";
    /** Hint shown when nextType is 'element-click' */
    clickHint?: string;
    tooltipSide?: "top" | "bottom" | "left" | "right";
    padding?: number;
}

const STEPS: TourStep[] = [
    {
        targetId: null,
        path: "/",
        title: "Welcome to XeloFlow! 👋",
        description: "Let's take a tour of your new AI email workspace. We'll explore Inbox, Drafts, Send, and Bots.",
        nextType: "button",
    },
    {
        targetId: "tour-stats",
        path: "/",
        title: "Workspace Stats 📊",
        description: "Get a quick pulse of your inbox—unread counts, average urgency, and total AI-analyzed emails are always visible at a glance.",
        nextType: "button",
        tooltipSide: "bottom",
        padding: 12,
    },
    {
        targetId: "tour-email-list",
        path: "/",
        title: "Smart Inbox ✨",
        description: "Whenever you click an email in this list, a popup options panel appears instantly. It also includes an AI chatbot and an AI-generated summary of the thread.",
        nextType: "button",
        tooltipSide: "right",
        padding: 8,
    },
    {
        targetId: "tour-summary",
        path: "/",
        title: "AI Workspace Summary 🧠",
        description: "On your left, I synthesize your entire inbox contextually. I'll highlight urgent matters and prepare your day before you even start.",
        nextType: "button",
        tooltipSide: "right",
        padding: 10,
    },
    {
        targetId: "tour-chatbot",
        path: "/",
        title: "Your Personal AI 🤖",
        description: "Down here, I'm always available. Ask me to find specific emails, summarize threads, or draft complex replies for you.",
        nextType: "button",
        tooltipSide: "top",
        padding: 8,
    },
    {
        targetId: "tour-nav-drafts",
        path: "/",
        title: "Let's go to Drafts",
        description: "Next, let's explore how AI helps you write. Click the 'Drafts' tab in the top navigation to continue.",
        nextType: "element-click",
        clickHint: "Click the 'Drafts' tab →",
        tooltipSide: "bottom",
        padding: 4,
    },
    {
        targetId: "tour-draft-list",
        path: "/drafts",
        title: "AI Drafts ✍️",
        description: "Clicking any email here reveals an auto-generated draft. You can freely edit these drafts yourself, or instruct the AI to alter them for you before sending.",
        nextType: "button",
        tooltipSide: "right",
        padding: 12,
    },
    {
        targetId: "tour-nav-send",
        path: "/drafts",
        title: "Moving to Send",
        description: "Perfect. Now let's see how you write brand new emails. Click the 'Send' tab above.",
        nextType: "element-click",
        clickHint: "Click the 'Send' tab →",
        tooltipSide: "bottom",
        padding: 4,
    },
    {
        targetId: "tour-send-logic",
        path: "/send",
        title: "Fancy Email Writing 🎩",
        description: "Here you can compose new emails using our advanced generative writing logic. Just provide bullet points, and the AI crafts a professional, articulate message instantly.",
        nextType: "button",
        tooltipSide: "right",
        padding: 16,
    },
    {
        targetId: "tour-nav-bots",
        path: "/send",
        title: "Explore Automations",
        description: "Finally, the real magic. Click the 'Bots' tab to see how they automate your workflow.",
        nextType: "element-click",
        clickHint: "Click the 'Bots' tab →",
        tooltipSide: "bottom",
        padding: 4,
    },
    {
        targetId: "tour-bots-header",
        path: "/bots",
        title: "AI Bots 🤖",
        description: "Bots are autonomous agents that continuously monitor your inbox. You can create them to auto-reply, categorize, or alert you based on specific conditions.",
        nextType: "button",
        tooltipSide: "bottom",
        padding: 10,
    },
    {
        targetId: "tour-bot-grid",
        path: "/bots",
        title: "Configure a Bot",
        description: "Let's look at one in detail. Click on any of your active bot cards below to open its settings.",
        nextType: "element-click",
        clickHint: "Click a Bot card →",
        tooltipSide: "top",
        padding: 8,
    },
    {
        targetId: "tour-bot-settings",
        path: "/bots",
        title: "Bot Settings & Presets ⚙️",
        description: "Here you can customize exactly what this bot does. Set presets, adjust its instructions, and define when it should trigger. You're fully in control!",
        nextType: "button",
        tooltipSide: "left",
        padding: 12,
    },
    {
        targetId: null,
        path: "/bots",
        title: "You're All Set! 🚀",
        description: "That's everything! You now know how to navigate the core features of XeloFlow. Enjoy your empty inbox!",
        nextType: "button",
    }
];

// ─── Tooltip Positioning ─────────────────────────────────────────────────────

const TOOLTIP_WIDTH = 340;

function getTooltipPos(
    rect: DOMRect,
    side: TourStep["tooltipSide"],
    padding: number
): { top: number; left: number; width: number } {
    const gap = 14;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const actualWidth = Math.min(TOOLTIP_WIDTH, vw - 32);
    let top = 0;
    let left = 0;

    if (side === "bottom") {
        top = rect.bottom + padding + gap;
        left = rect.left + rect.width / 2 - actualWidth / 2;
    } else if (side === "top") {
        top = rect.top - padding - gap - 220;
        left = rect.left + rect.width / 2 - actualWidth / 2;
    } else if (side === "right") {
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + padding + gap;
        // Fallback to bottom on small screens if it overflows to the right
        if (vw < 768 && left + actualWidth > vw - 16) {
            top = rect.bottom + padding + gap;
            left = rect.left + rect.width / 2 - actualWidth / 2;
        }
    } else {
        top = rect.top + rect.height / 2 - 100;
        left = rect.left - padding - gap - actualWidth;
        // Fallback to bottom on small screens if it overflows to the left
        if (vw < 768 && left < 16) {
            top = rect.bottom + padding + gap;
            left = rect.left + rect.width / 2 - actualWidth / 2;
        }
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, vw - actualWidth - 16));
    if (top < 16) top = 16;
    if (top + 260 > vh) top = vh - 276;

    return { top, left, width: actualWidth };
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface TourSpotlightProps {
    open: boolean;
    onClose: () => void;
}

export function TourSpotlight({ open, onClose }: TourSpotlightProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Restore step from sessionStorage if tour was interrupted mid-way
    const [step, setStep] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("tour_step");
            if (saved !== null) {
                const n = parseInt(saved, 10);
                if (!isNaN(n) && n >= 0 && n < STEPS.length) return n;
            }
        }
        return 0;
    });
    const [rect, setRect] = useState<DOMRect | null>(null);
    const rafRef = useRef<number | null>(null);
    const closingRef = useRef(false);

    const currentStep = STEPS[step];
    const isLast = step === STEPS.length - 1;
    const padding = currentStep.padding ?? 12;

    const isPathMismatch = currentStep.path !== pathname;

    // ─── Track spotlit element position live via rAF ──────────────────────
    useEffect(() => {
        if (!open || !currentStep.targetId || isPathMismatch) {
            setRect(null);
            return;
        }

        const update = () => {
            const el = document.getElementById(currentStep.targetId!);
            if (el) {
                const r = el.getBoundingClientRect();
                setRect((prev) =>
                    prev &&
                    prev.top === r.top &&
                    prev.left === r.left &&
                    prev.width === r.width &&
                    prev.height === r.height
                        ? prev
                        : r
                );
                // Scroll element into view if it's off-screen
                if (r.bottom > window.innerHeight || r.top < 0) {
                    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            }
            rafRef.current = requestAnimationFrame(update);
        };

        rafRef.current = requestAnimationFrame(update);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [open, step, currentStep.targetId, pathname]);

    // ─── Listen for click on target for 'element-click' steps ────────────
    useEffect(() => {
        if (
            !open ||
            currentStep.nextType !== "element-click" ||
            !currentStep.targetId ||
            isPathMismatch
        )
            return;

        const el = document.getElementById(currentStep.targetId);
        if (!el) return;

        const handler = (e: Event) => {
            if (!closingRef.current) advance();
        };

        el.addEventListener("click", handler, { capture: true, once: true });
        return () =>
            el.removeEventListener("click", handler, { capture: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, step]);

    const advance = useCallback(async () => {
        if (closingRef.current) return;
        if (isLast) {
            closingRef.current = true;
            sessionStorage.removeItem("tour_step");
            localStorage.removeItem("tour_force");
            localStorage.setItem("onboarding_complete", "true");
            await markOnboardingCompleteAction();
            onClose();
        } else {
            const next = step + 1;
            const nextStep = STEPS[next];
            
            sessionStorage.setItem("tour_step", String(next));
            setStep(next);

            // If the next step is on a different page, navigate there
            if (nextStep && nextStep.path !== pathname) {
                router.push(nextStep.path);
            }
        }
    }, [isLast, step, onClose, pathname, router]);

    const dismiss = useCallback(async () => {
        if (closingRef.current) return;
        closingRef.current = true;
        sessionStorage.removeItem("tour_step");
        localStorage.removeItem("tour_force");
        localStorage.setItem("onboarding_complete", "true");
        await markOnboardingCompleteAction();
        onClose();
    }, [onClose]);

    if (!open) return null;

    // Spotlight geometry (with padding)
    const spot = rect
        ? {
              x: rect.left - padding,
              y: rect.top - padding,
              w: rect.width + padding * 2,
              h: rect.height + padding * 2,
          }
        : null;

    const tooltipPos =
        rect && currentStep.tooltipSide
            ? getTooltipPos(rect, currentStep.tooltipSide, padding)
            : null;

    return (
        // Outer shell: pointer-events:none so spotlight pass-through works via children
        <div
            className="fixed inset-0 z-[100]"
            style={{ pointerEvents: "none", opacity: isPathMismatch ? 0 : 1, transition: "opacity 0.2s" }}
        >
            {/* ── SVG overlay with spotlight hole ── */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: "none" }}
            >
                <defs>
                    <mask id="tour-mask">
                        {/* White = visible (dark overlay shows) */}
                        <rect width="100%" height="100%" fill="white" />
                        {/* Black = transparent hole */}
                        {spot && (
                            <rect
                                x={spot.x}
                                y={spot.y}
                                width={spot.w}
                                height={spot.h}
                                rx={10}
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>

                {/* Dark overlay */}
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.58)"
                    mask="url(#tour-mask)"
                />

                {/* Orange glow ring around spotlight */}
                {spot && (
                    <rect
                        x={spot.x - 1.5}
                        y={spot.y - 1.5}
                        width={spot.w + 3}
                        height={spot.h + 3}
                        rx={11}
                        fill="none"
                        stroke="rgba(249,115,22,0.75)"
                        strokeWidth={2.5}
                    />
                )}
            </svg>

            {/* ── Pointer-blocking divs around spotlight ── */}
            {/* When nextType === 'element-click', we leave the spotlight hole open
                so the user can click the real element. For 'button' steps we block everything. */}
            {spot ? (
                <>
                    {/* Top */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: spot.y,
                            pointerEvents: "auto",
                        }}
                    />
                    {/* Bottom */}
                    <div
                        style={{
                            position: "absolute",
                            top: spot.y + spot.h,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: "auto",
                        }}
                    />
                    {/* Left */}
                    <div
                        style={{
                            position: "absolute",
                            top: spot.y,
                            height: spot.h,
                            left: 0,
                            width: spot.x,
                            pointerEvents: "auto",
                        }}
                    />
                    {/* Right */}
                    <div
                        style={{
                            position: "absolute",
                            top: spot.y,
                            height: spot.h,
                            left: spot.x + spot.w,
                            right: 0,
                            pointerEvents: "auto",
                        }}
                    />
                    {/* For 'button' steps, also block the spotlight itself */}
                    {currentStep.nextType === "button" && (
                        <div
                            style={{
                                position: "absolute",
                                top: spot.y,
                                left: spot.x,
                                width: spot.w,
                                height: spot.h,
                                pointerEvents: "auto",
                            }}
                        />
                    )}
                </>
            ) : (
                /* No spotlight → block full screen (welcome step) */
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "auto",
                    }}
                />
            )}

            {/* ── Tooltip card ── */}
            <AnimatePresence mode="wait">
                {/* Welcome step — centred */}
                {!currentStep.targetId && (
                    <motion.div
                        key="welcome"
                        initial={{ scale: 0.88, opacity: 0, x: "-50%", y: "calc(-50% + 24px)" }}
                        animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                        exit={{ scale: 0.88, opacity: 0, x: "-50%", y: "-50%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: "min(340px, calc(100vw - 32px))",
                            pointerEvents: "auto",
                            zIndex: 101,
                        }}
                    >
                        <TooltipCard
                            step={currentStep}
                            stepIndex={step}
                            totalSteps={STEPS.length}
                            onNext={advance}
                            onDismiss={dismiss}
                            isLast={isLast}
                        />
                    </motion.div>
                )}

                {/* Positioned tooltip */}
                {tooltipPos && (
                    <motion.div
                        key={`step-${step}`}
                        initial={{
                            opacity: 0,
                            y: currentStep.tooltipSide === "top" ? 8 : -8,
                        }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            top: tooltipPos.top,
                            left: tooltipPos.left,
                            width: tooltipPos.width,
                            pointerEvents: "auto",
                            zIndex: 101,
                        }}
                    >
                        <TooltipCard
                            step={currentStep}
                            stepIndex={step}
                            totalSteps={STEPS.length}
                            onNext={advance}
                            onDismiss={dismiss}
                            isLast={isLast}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Tooltip Card ─────────────────────────────────────────────────────────────

function TooltipCard({
    step,
    stepIndex,
    totalSteps,
    onNext,
    onDismiss,
    isLast,
}: {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onDismiss: () => void;
    isLast: boolean;
}) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-400" />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug">
                        {step.title}
                    </h3>
                    <button
                        onClick={onDismiss}
                        className="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                        title="Skip tour"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {step.description}
                </p>

                {/* "You must interact" hint — pulses to draw attention */}
                {step.nextType === "element-click" && step.clickHint && (
                    <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 mb-3"
                    >
                        <MousePointerClick className="w-3.5 h-3.5 shrink-0" />
                        {step.clickHint}
                    </motion.div>
                )}

                {/* Footer: progress dots + next button */}
                <div className="flex items-center justify-between">
                    {/* Progress dots */}
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    width: i === stepIndex ? 16 : 6,
                                    backgroundColor:
                                        i === stepIndex
                                            ? "#f97316"
                                            : i < stepIndex
                                            ? "#fed7aa"
                                            : "#e5e7eb",
                                }}
                                transition={{ duration: 0.25 }}
                                style={{ height: 6, borderRadius: 9999 }}
                            />
                        ))}
                    </div>

                    {/* Next / Done button — only for 'button' steps */}
                    {step.nextType === "button" && (
                        <motion.button
                            onClick={onNext}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-200 dark:shadow-orange-900/20 transition-colors"
                        >
                            {isLast ? (
                                "All done! 🎉"
                            ) : (
                                <>
                                    Next <ArrowRight className="w-3 h-3" />
                                </>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
