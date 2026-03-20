/**
 * Bot List Sidebar Component
 * Displays list of user's bots with enable/disable toggle
 */

'use client';

import { motion } from 'framer-motion';
import { BotCard } from './BotCard';
import { Plus, Search, RefreshCw, Bot } from 'lucide-react';
import type { EmailBot } from '@/lib/bots/types';
import { useState } from 'react';
import { syncBotsAction } from '@/app/actions/bots';
import { toast } from 'sonner';

interface BotListSidebarProps {
    bots: EmailBot[];
    selectedBotId: string | null;
    onSelectBot: (botId: string) => void;
    onCreateNew: () => void;
    onAddPreset?: (presetId: string) => void;
    onBotUpdated: (bot: EmailBot) => void;
}

export function BotListSidebar({
    bots,
    selectedBotId,
    onSelectBot,
    onCreateNew,
    onAddPreset,
    onBotUpdated,
}: BotListSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncBotsAction();
            if (result.success) {
                toast.success(`Sync complete! ${result.emailsProcessed} emails processed.`);
            } else {
                toast.error(result.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('Failed to trigger sync');
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredBots = bots.filter(bot =>
        bot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-[420px] flex-shrink-0 flex flex-col gap-4 h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border-r border-violet-100/50 dark:border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-serif flex items-center text-gray-900">
                    <Bot className="w-8 h-8 text-violet-600 mr-2" />
                    Email Bots
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`p-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-gray-200/50 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-full hover:bg-white hover:text-gray-900 dark:hover:bg-zinc-700 hover:shadow-md transition-all ${isSyncing ? 'animate-spin' : ''}`}
                        title="Sync Now"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="p-2 bg-violet-600/90 hover:bg-violet-600 text-white rounded-full shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 transition-all"
                        title="Create New Bot"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search bots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-zinc-800/60 backdrop-blur border border-gray-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2 custom-scrollbar pb-4">
                {/* Preset Bots */}
                {!searchQuery && (
                    <div className="mb-4 space-y-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Presets</h3>

                        {/* Founders Bot */}
                        <div
                            onClick={() => onAddPreset?.('preset_startup_bot')}
                            className={`
                            p-3.5 rounded-2xl border transition-all cursor-pointer group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5
                            bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 border-gray-200/50 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/30
                        `}
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">Founders Bot</h3>
                                <span className="text-[10px] bg-gray-100/80 dark:bg-zinc-700/80 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">Safe</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                Investors & cold sales. High safety, no meetings.
                            </p>
                        </div>

                        {/* E-Commerce Bot */}
                        <div
                            onClick={() => onAddPreset?.('preset_ecommerce_bot')}
                            className={`
                            p-3.5 rounded-2xl border transition-all cursor-pointer group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5
                            bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 border-gray-200/50 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/30
                        `}
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">E-Commerce Bot</h3>
                                <span className="text-[10px] bg-gray-100/80 dark:bg-zinc-700/80 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">Store</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                Shopify & WooCommerce. Orders, returns & Q&A.
                            </p>
                        </div>

                        {/* Generic Reply Bot */}
                        <div
                            onClick={() => onAddPreset?.('preset_generic_reply_bot')}
                            className={`
                            p-3.5 rounded-2xl border transition-all cursor-pointer group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5
                            bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 border-gray-200/50 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/30
                        `}
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">Generic Reply Bot</h3>
                                <span className="text-[10px] bg-gray-100/80 dark:bg-zinc-700/80 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">Auto</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                Auto-responses via templates. AI handling.
                            </p>
                        </div>

                        {/* Follow-Up Bot */}
                        <div
                            onClick={() => onAddPreset?.('preset_follow_up_bot')}
                            className={`
                            p-3.5 rounded-2xl border transition-all cursor-pointer group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5
                            bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md hover:bg-white dark:hover:bg-zinc-800 border-gray-200/50 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/30
                        `}
                        >
                            <div className="flex justify-between items-start mb-1.5">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">Follow-Up Bot</h3>
                                <span className="text-[10px] bg-gray-100/80 dark:bg-zinc-700/80 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">Trace</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                Monitors threads and suggests follow-up drafts.
                            </p>
                        </div>
                    </div>
                )}

                {/* User Bot List */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">My Bots</h3>
                    {filteredBots.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            {searchQuery ? (
                                <p>No bots match "{searchQuery}"</p>
                            ) : (
                                <div>
                                    <p className="mb-2">No bots yet</p>
                                    <button
                                        onClick={onCreateNew}
                                        className="text-violet-600 hover:underline text-sm"
                                    >
                                        Create your first bot
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        filteredBots.map((bot, index) => (
                            <motion.div
                                key={bot.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <BotCard
                                    bot={bot}
                                    isSelected={bot.id === selectedBotId}
                                    onClick={() => onSelectBot(bot.id)}
                                    onBotUpdated={onBotUpdated}
                                />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Stats Footer */}
            <div className="p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-300" /> {bots.length} Total</span>
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" /> {bots.filter(b => b.enabled).length} Active</span>
                </div>
            </div>
        </div>
    );
}
