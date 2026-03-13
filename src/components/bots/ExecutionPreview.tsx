'use client';

import { motion } from 'framer-motion';
import { Bot, ChevronRight, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import type { BotAction, BotTrigger, BotCondition } from '@/lib/bots/types';

interface ExecutionPreviewProps {
    trigger: BotTrigger | null;
    conditions: BotCondition[];
    actions: BotAction[];
}

export function ExecutionPreview({ trigger, conditions, actions }: ExecutionPreviewProps) {
    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl transition-colors relative overflow-hidden">
            {/* Background design element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-500">
                    <Zap className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50">Logics Flow</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Execution Path Analysis</p>
                </div>
            </div>

            <div className="space-y-6 relative">
                {/* Trigger */}
                <div className="relative pl-8 pb-6 border-l-2 border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-orange-500 border-4 border-white dark:border-zinc-900 shadow-sm" />
                    <div>
                        <p className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest mb-1">Inbound Event</p>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {trigger ? trigger.type.replace(/_/g, ' ') : 'Define a trigger...'}
                        </h4>
                    </div>
                </div>

                {/* Conditions */}
                <div className="relative pl-8 pb-6 border-l-2 border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                    <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm ${conditions.length > 0 ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <div>
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1">Validation Filters ({conditions.length})</p>
                        {conditions.length > 0 ? (
                            <div className="space-y-1 mt-2">
                                {conditions.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                                        {c.type.replace(/_/g, ' ')}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <h4 className="text-xs font-medium text-zinc-500 italic mt-1">Universal acceptance (No filters)</h4>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="relative pl-8 last:border-0">
                    <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm ${actions.length > 0 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Outcome Pipeline</p>
                        {actions.length > 0 ? (
                            <div className="space-y-3 mt-3">
                                {actions.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group transition-all hover:border-emerald-500/30">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-black">
                                            {i + 1}
                                        </div>
                                        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {a.type.replace(/_/g, ' ')}
                                        </h4>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <h4 className="text-xs font-medium text-zinc-500 italic mt-1">Specify action steps...</h4>
                        )}
                    </div>
                </div>
            </div>

            {/* Warning if no actions */}
            {actions.length === 0 && (
                <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-orange-800 dark:text-orange-400 leading-relaxed uppercase tracking-tighter">
                        Pipeline contains no Terminal outcomes. The agent will analyze but take no actions.
                    </p>
                </div>
            )}
            
            {/* Success indicator if complete */}
            {trigger && actions.length > 0 && (
                <div className="mt-8 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Logic sequence verified</span>
                </div>
            )}
        </div>
    );
}
