/**
 * Bot Main View Component
 * Manages main content area - switches between wizard, detail view, and empty state
 */

'use client';

import { BotWizard } from './BotWizard';
import { BotDetailView } from './BotDetailView';
import type { EmailBot } from '@/lib/bots/types';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface BotMainViewProps {
    selectedBot: EmailBot | null;
    isCreating: boolean;
    onBotCreated: (bot: EmailBot) => void;
    onBotUpdated: (bot: EmailBot) => void;
    onBotDeleted: (botId: string) => void;
    onCancelCreate: () => void;
    onBack?: () => void;
}

export function BotMainView({
    selectedBot,
    isCreating,
    onBotCreated,
    onBotUpdated,
    onBotDeleted,
    onCancelCreate,
    onBack,
}: BotMainViewProps) {
    // Show wizard when creating
    if (isCreating) {
        return (
            <div className="flex-1 h-full overflow-hidden">
                <BotWizard
                    onBotCreated={onBotCreated}
                    onCancel={onCancelCreate}
                />
            </div>
        );
    }

    // Show detail view when bot is selected
    if (selectedBot) {
        return (
            <div className="flex-1 h-full overflow-y-auto">
                <BotDetailView
                    bot={selectedBot}
                    onBotUpdated={onBotUpdated}
                    onBotDeleted={onBotDeleted}
                    onBack={onBack}
                />
            </div>
        );
    }

    // Empty state - no selection
    return (
        <div className="flex-1 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="mb-6 flex justify-center">
                    <div className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full">
                        <Sparkles className="w-12 h-12 text-violet-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-3 font-serif">
                    Automate Your Email Workflow
                </h2>

                <p className="text-gray-600 mb-6">
                    Create intelligent bots to handle routine emails, send auto-replies,
                    organize your inbox, and never miss an important message.
                </p>

                <div className="space-y-4 text-left bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl p-6 rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                    <h3 className="font-semibold text-sm mb-3">Popular use cases:</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                            <span>Auto-draft replies to customer support emails</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                            <span>Send out-of-office responses automatically</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                            <span>Get notified about high-urgency emails</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                            <span>Organize newsletters and marketing emails</span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    Select a bot from the sidebar or create a new one to get started
                </p>
            </motion.div>
        </div>
    );
}
