import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BotEntity } from './BotEntity';

interface WelcomeBriefingProps {
    userName: string;
    analyzedCount: number;
    urgentCount: number;
    draftsCount: number;
    onSummarizeUrgent?: () => void;
    onReviewDrafts?: () => void;
    variant?: 'banner' | 'sidebar';
}

export function WelcomeBriefing({ 
    userName, 
    analyzedCount, 
    urgentCount, 
    draftsCount,
    onSummarizeUrgent,
    onReviewDrafts,
    variant = 'banner'
}: WelcomeBriefingProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const isSidebar = variant === 'sidebar';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: isSidebar ? -20 : 0, y: isSidebar ? 0 : -20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, width: isSidebar ? 0 : 'auto', height: isSidebar ? 'auto' : 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className={cn(
                    "relative overflow-hidden bg-gradient-to-br from-accent/15 via-purple-500/5 to-card border border-accent/20 shadow-sm group",
                    isSidebar ? "rounded-3xl p-5 flex flex-col gap-4 sticky top-6" : "rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6"
                )}
            >
                {/* Background Glow */}
                <div className={cn(
                    "absolute top-0 right-0 bg-accent/20 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000",
                    isSidebar ? "-mt-10 -mr-10 w-48 h-48" : "-mt-16 -mr-16 w-64 h-64"
                )} />
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors z-20"
                >
                    <X className="w-3.5 h-3.5" />
                </button>

                {/* Bot Avatar Section */}
                <BotEntity className={cn(
                    "relative shrink-0",
                    isSidebar ? "w-12 h-12" : "w-16 h-16 sm:w-20 sm:h-20"
                )} />

                {/* Content Section */}
                <div className="flex-1 relative z-10">
                    <h2 className={cn(
                        "font-bold font-serif mb-1.5 text-foreground leading-tight",
                        isSidebar ? "text-lg" : "text-xl sm:text-2xl mb-2"
                    )}>
                        {isSidebar ? `Hi ${userName}!` : `Welcome back${userName ? `, ${userName}` : ''}!`}
                    </h2>
                    <p className={cn(
                        "text-muted-foreground leading-relaxed",
                        isSidebar ? "text-xs mb-4" : "text-sm sm:text-base mb-4 max-w-3xl"
                    )}>
                        {isSidebar ? (
                            <>
                                I analyzed <span className="font-semibold text-foreground">{analyzedCount}</span> emails. 
                                <span className="font-semibold text-accent">{urgentCount}</span> urgent.
                            </>
                        ) : (
                            <>
                                While you were away, I analyzed <span className="font-semibold text-foreground">{analyzedCount}</span> new emails. 
                                There {urgentCount === 1 ? 'is' : 'are'} <span className="font-semibold text-accent">{urgentCount}</span> that require{urgentCount === 1 ? 's' : ''} your urgent attention, 
                                and I've prepared <span className="font-semibold text-foreground">{draftsCount}</span> drafts.
                            </>
                        )}
                    </p>
                    
                    <div className={cn(
                        "flex flex-wrap items-center gap-2",
                        isSidebar && "flex-col items-stretch"
                    )}>
                        <button
                            onClick={onSummarizeUrgent}
                            className={cn(
                                "bg-accent hover:bg-accent/90 text-accent-foreground font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-accent/50 focus:outline-none flex items-center justify-center gap-2 hover:-translate-y-0.5",
                                isSidebar ? "w-full py-2 text-xs" : "px-4 py-2 text-sm"
                            )}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Summarize
                        </button>
                        
                        {draftsCount > 0 && (
                            <button
                                onClick={onReviewDrafts} 
                                className={cn(
                                    "bg-white dark:bg-zinc-800 border border-border hover:border-accent/30 text-foreground font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-accent/50 focus:outline-none flex items-center justify-center gap-2 hover:-translate-y-0.5",
                                    isSidebar ? "w-full py-2 text-xs" : "px-4 py-2 text-sm"
                                )}
                            >
                                {isSidebar ? 'Review' : 'Review Drafts'}
                                <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-50" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

