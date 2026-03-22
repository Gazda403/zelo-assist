import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

interface WelcomeBriefingProps {
    userName: string;
    analyzedCount: number;
    urgentCount: number;
    draftsCount: number;
    onSummarizeUrgent?: () => void;
    onReviewDrafts?: () => void;
}

export function WelcomeBriefing({ 
    userName, 
    analyzedCount, 
    urgentCount, 
    draftsCount,
    onSummarizeUrgent,
    onReviewDrafts
}: WelcomeBriefingProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className="relative overflow-hidden bg-gradient-to-r from-accent/10 via-purple-500/5 to-transparent border border-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm group mb-6"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors z-20"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                    {/* Bot Avatar Section */}
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20 relative z-10">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        {/* Ping animation behind avatar */}
                        <div className="absolute inset-0 bg-accent rounded-2xl animate-ping opacity-20" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold font-serif mb-2 text-foreground">
                            Welcome back{userName ? `, ${userName}` : ''}!
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed max-w-3xl">
                            While you were away, I analyzed <span className="font-semibold text-foreground">{analyzedCount}</span> new emails. 
                            There {urgentCount === 1 ? 'is' : 'are'} <span className="font-semibold text-accent">{urgentCount}</span> that require{urgentCount === 1 ? 's' : ''} your urgent attention, 
                            and I've prepared <span className="font-semibold text-foreground">{draftsCount}</span> draft replies awaiting your review.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={onSummarizeUrgent}
                                className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-accent/50 focus:outline-none flex items-center gap-2 hover:-translate-y-0.5"
                            >
                                <Sparkles className="w-4 h-4" />
                                {urgentCount > 0 ? "Summarize Urgent" : "Summarize Inbox"}
                            </button>
                            
                            {draftsCount > 0 && (
                                <button
                                    onClick={onReviewDrafts} 
                                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-border hover:border-accent/30 text-foreground text-sm font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-accent/50 focus:outline-none flex items-center gap-2 hover:-translate-y-0.5"
                                >
                                    Review Drafts
                                    <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

