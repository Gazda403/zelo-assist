'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertCircle, 
    Shield, 
    CheckCircle2, 
    X, 
    ArrowRight,
    FileText,
    ExternalLink,
    Lock,
    Eye
} from 'lucide-react';

interface TermsAcceptanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    botName?: string;
}

export function TermsAcceptanceModal({ isOpen, onClose, onAccept, botName = "Zelo AI Bot" }: TermsAcceptanceModalProps) {
    const [scrolledToBottom, setScrolledToBottom] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isBottom = Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) < 20;
        if (isBottom) setScrolledToBottom(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/60 dark:bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Shield className="w-48 h-48 text-orange-500" />
                </div>

                <div className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50">Legal Engagement Framework</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Autonomous Executive Protocol 1.0</p>
                        </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 mb-8 relative">
                        <div className="flex items-start gap-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="mb-4">
                                    You are enabling <span className="text-orange-600 dark:text-orange-500 font-bold underline">Direct Dispatch Mode</span> for "{botName}". 
                                    This empowers the AI to transmit emails from your account without a secondary review phase.
                                </p>
                                <p>
                                    Review the framework below. You must verify understanding of the operational risks associated with automated correspondence.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div 
                        onScroll={handleScroll}
                        className="h-64 overflow-y-auto pr-4 space-y-6 mb-8 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 border-y border-zinc-100 dark:border-zinc-800 py-6 text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed"
                    >
                        <section className="space-y-4">
                            <h4 className="text-zinc-900 dark:text-zinc-200 font-bold uppercase tracking-widest text-[10px]">1. Operational Directives</h4>
                            <p>
                                The AI proxy acts as your executive agent. Transmissions occur based on your configured Policy Engine and vector context. 
                                Errors in configuration are the responsibility of the operator.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-zinc-900 dark:text-zinc-200 font-bold uppercase tracking-widest text-[10px]">2. Financial Constraints</h4>
                            <p>
                                Automated replies are strictly prohibited from entering into binding financial commitments, signing contracts, or authorizing payments 
                                unless explicitly explicitly configured via dedicated secure hooks.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-zinc-900 dark:text-zinc-200 font-bold uppercase tracking-widest text-[10px]">3. Liability Shield</h4>
                            <p>
                                Zelo AI provides the neural infrastructure. The operator remains the legal sender of all correspondence. 
                                We do not assume liability for business outcomes, missed opportunities, or miscommunications resulting from automated scaling.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-zinc-900 dark:text-zinc-200 font-bold uppercase tracking-widest text-[10px]">4. System Safety</h4>
                            <p>
                                Adaptive safety filters remain active. The system will auto-abort and revert to Draft Mode if threat indices exceed 85% 
                                or if conflicting directives are detected in the neural matrix.
                            </p>
                        </section>

                        {!scrolledToBottom && (
                            <div className="sticky bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent flex items-end justify-center pb-2">
                                <span className="text-[10px] font-bold text-zinc-400 animate-bounce flex items-center gap-1">
                                    Continue reading <ArrowRight className="w-3 h-3 rotate-90" />
                                </span>
                            </div>
                        )}
                    </div>

                    <label className={`flex items-start gap-4 p-5 border transition-all cursor-pointer mb-10 ${
                        agreed ? 'bg-orange-500/5 border-orange-500/30' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}>
                        <div className="relative flex items-center justify-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 transition-all checked:border-orange-500 checked:bg-orange-500 focus:outline-none rounded-none"
                            />
                            <CheckCircle2 className="absolute w-3.5 h-3.5 text-white dark:text-zinc-950 opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-200">
                                I confirm authorization for autonomous transmission
                            </span>
                            <p className="text-[10px] text-zinc-500 font-medium">This setting can be toggled in real-time from the dashboard.</p>
                        </div>
                    </label>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-all"
                        >
                            Abort
                        </button>
                        <button
                            onClick={onAccept}
                            disabled={!agreed}
                            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-3 ${
                                agreed
                                    ? 'bg-orange-500 dark:bg-orange-600 text-white dark:text-zinc-50 border-orange-500 hover:bg-orange-600 dark:hover:bg-orange-500 shadow-lg shadow-orange-500/20'
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {agreed ? <Zap className="w-4 h-4 fill-current" /> : <Lock className="w-4 h-4" />}
                            Initialize Policy Engagement
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
