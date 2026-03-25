"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, MousePointerClick } from "lucide-react";
import { markOnboardingCompleteAction } from "@/app/actions/onboarding";

// ─── Step Definitions ───────────────────────────────────────────────────────

interface TourStep {
    /** ID of the element to spotlight, or null for a centred welcome card */
    targetId: string | null;
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
        title: "Welcome to Zelo Assist! 👋",
        description:
            "Let's take a live tour of the app. We'll highlight each feature one by one — some steps ask you to try a feature yourself before moving on.",
        nextType: "button",
        clickHint: undefined,
    },
    {
        targetId: "tour-stats",
        title: "Inbox at a Glance 📊",
        description:
            "Here you can see how many emails are unread, your average AI urgency score, and how many emails have been analyzed. These update every time you load your inbox.",
        nextType: "button",
        tooltipSide: "bottom",
        padding: 12,
    },
    {
        targetId: "tour-filters",
        title: "Time Filters ⏱",
        description:
            "Filter your inbox by time range — last 24 hours, 7 days, a full month, or all time. Try it! Click any filter button to continue.",
        nextType: "element-click",
        clickHint: "Click a filter button to continue →",
        tooltipSide: "bottom",
        padding: 10,
    },
    {
        targetId: "tour-sort",
        title: "Sort Controls ⚡",
        description:
            "Sort emails by AI Urgency (most critical first), by Date, or Alphabetically by sender. The urgency sort is the default — your most important messages float to the top.",
        nextType: "button",
        tooltipSide: "bottom",
        padding: 10,
    },
    {
        targetId: "tour-email-list",
        title: "Your Emails ✉️",
        description:
            "Every email has an AI urgency score from 1–10. Click any email card below to open it — you'll find AI-powered reply drafts, thread details, and more.",
        nextType: "element-click",
        clickHint: "Click any email to continue →",
        tooltipSide: "top",
        padding: 12,
    },
];

// ─── Tooltip Positioning ─────────────────────────────────────────────────────

const TOOLTIP_WIDTH = 340;

function getTooltipPos(
    rect: DOMRect,
    side: TourStep["tooltipSide"],
    padding: number
): { top: number; left: number } {
    const gap = 14;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    let top = 0;
    let left = 0;

    if (side === "bottom") {
        top = rect.bottom + padding + gap;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    } else if (side === "top") {
        top = rect.top - padding - gap - 220;
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    } else if (side === "right") {
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + padding + gap;
    } else {
        top = rect.top + rect.height / 2 - 100;
        left = rect.left - padding - gap - TOOLTIP_WIDTH;
    }

    // Clamp to viewport
    left = Math.max(16, Math.min(left, vw - TOOLTIP_WIDTH - 16));
    if (top < 16) top = 16;
    if (top + 260 > vh) top = vh - 276;

    return { top, left };
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface TourSpotlightProps {
    open: boolean;
    onClose: () => void;
}

export function TourSpotlight({ open, onClose }: TourSpotlightProps) {
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

    // ─── Track spotlit element position live via rAF ──────────────────────
    useEffect(() => {
        if (!open || !currentStep.targetId) {
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
    }, [open, step, currentStep.targetId]);

    // ─── Listen for click on target for 'element-click' steps ────────────
    useEffect(() => {
        if (
            !open ||
            currentStep.nextType !== "element-click" ||
            !currentStep.targetId
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
            await markOnboardingCompleteAction();
            onClose();
        } else {
            const next = step + 1;
            sessionStorage.setItem("tour_step", String(next));
            setStep(next);
        }
    }, [isLast, step, onClose]);

    const dismiss = useCallback(async () => {
        if (closingRef.current) return;
        closingRef.current = true;
        sessionStorage.removeItem("tour_step");
        localStorage.removeItem("tour_force");
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
            style={{ pointerEvents: "none" }}
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
                        initial={{ scale: 0.88, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: TOOLTIP_WIDTH,
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
                            width: TOOLTIP_WIDTH,
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
