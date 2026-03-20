/**
 * Bot Card Component
 * Individual bot card in the sidebar list
 */

'use client';

import { motion } from 'framer-motion';
import { Crown, Power } from 'lucide-react';
import type { EmailBot } from '@/lib/bots/types';
import { toggleBotAction } from '@/app/actions/bots';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BotCardProps {
    bot: EmailBot;
    isSelected: boolean;
    onClick: () => void;
    onBotUpdated: (bot: EmailBot) => void;
}

export function BotCard({ bot, isSelected, onClick, onBotUpdated }: BotCardProps) {
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger card selection

        setIsToggling(true);
        try {
            const updated = await toggleBotAction(bot.id, !bot.enabled);
            onBotUpdated(updated);
        } catch (error) {
            console.error('Failed to toggle bot:', error);
        } finally {
            setIsToggling(false);
        }
    };

    const statusColor = bot.enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300';
    const statusText = bot.enabled ? 'Active' : 'Disabled';

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
                'p-3 pt-2.5 pb-2.5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-md',
                isSelected
                    ? 'border-transparent bg-violet-50/80 dark:bg-violet-900/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-2 ring-violet-500/30'
                    : 'border-transparent bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5'
            )}
        >
            {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full -mr-8 -mt-8" />
            )}

            <div className="flex items-start justify-between gap-3 min-w-0 relative">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className={cn(
                            "font-bold text-sm truncate tracking-tight transition-colors",
                            isSelected ? "text-violet-900 dark:text-violet-300" : "text-gray-900 dark:text-gray-100 group-hover:text-violet-700"
                        )}>{bot.name}</h3>
                        {bot.isPremium && (
                            <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                    </div>
                    {bot.description && (
                        <p className="text-[11px] text-gray-500 line-clamp-1 leading-tight mb-2 opacity-80">{bot.description}</p>
                    )}
                </div>

                {/* Toggle Switch - Positioned top right for compactness */}
                <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={cn(
                        'relative w-8 h-4 rounded-full transition-colors flex-shrink-0 mt-0.5',
                        bot.enabled ? 'bg-violet-600' : 'bg-gray-200',
                        isToggling && 'opacity-50'
                    )}
                    title={bot.enabled ? 'Disable bot' : 'Enable bot'}
                >
                    <motion.div
                        className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                        animate={{ x: bot.enabled ? 16 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-medium border-t border-gray-50 pt-2 mt-1">
                <div className="flex items-center gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full', statusColor)} />
                    <span className={cn(
                        "uppercase tracking-wider font-bold",
                        bot.enabled ? "text-green-600" : "text-gray-400"
                    )}>{statusText}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="font-bold text-gray-900/40 dark:text-gray-400 uppercase tracking-tighter bg-gray-50/80 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded">
                        {bot.stats.totalExecutions} RUNS
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
