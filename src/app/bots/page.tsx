/**
 * /bots Page - Email Bots Management
 * 
 * Main page for creating, viewing, and managing email automation bots.
 */

'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PremiumFeatureGuard } from '@/components/layout/PremiumFeatureGuard';
import { BotListSidebar } from '@/components/bots/BotListSidebar';
import { BotMainView } from '@/components/bots/BotMainView';
import { getBotsAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';
import { Loader2 } from 'lucide-react';
import { STARTUP_BOT_PRESET } from '@/ai/bots/startup-bot';
import { ECOMMERCE_BOT_PRESET } from '@/ai/bots/ecommerce-bot';
import { GENERIC_REPLY_BOT_PRESET } from '@/ai/bots/generic-reply-bot';
import { FOLLOW_UP_BOT_PRESET } from '@/ai/bots/follow-up-bot';
import { ALERT_BOT_PRESET } from '@/ai/bots/alert-bot';
import { createBotAction } from '@/app/actions/bots';
import { toast } from 'sonner';

export default function BotsPage() {
    const [bots, setBots] = useState<EmailBot[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load bots on mount
    useEffect(() => {
        loadBots();
    }, []);

    const loadBots = async () => {
        try {
            setLoading(true);
            const data = await getBotsAction();
            setBots(data);
        } catch (error) {
            console.error('Failed to load bots:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedBot = selectedBotId
        ? bots.find(b => b.id === selectedBotId) || null
        : null;

    const handleBotCreated = (bot: EmailBot) => {
        setBots([...bots, bot]);
        setSelectedBotId(bot.id);
        setIsCreating(false);
    };

    const handleBotUpdated = (bot: EmailBot) => {
        setBots(bots.map(b => (b.id === bot.id ? bot : b)));
    };

    const handleBotDeleted = (botId: string) => {
        setBots(bots.filter(b => b.id !== botId));
        setSelectedBotId(null);
    };

    const handleCreateNew = () => {
        setSelectedBotId(null);
        setIsCreating(true);
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
    };

    const handlePresetAdd = async (presetId: string) => {
        if (presetId === 'preset_startup_bot') {
            try {
                // Deep clone to avoid shared references
                const newBot: EmailBot = {
                    ...structuredClone(STARTUP_BOT_PRESET),
                    id: crypto.randomUUID(),
                    userId: 'current-user', // This will be overwritten by backend
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Persist and get the actual bot from server
                const savedBot = await createBotAction(newBot);

                // Update local state with the correct ID
                setBots(prev => [...prev, savedBot]);
                setSelectedBotId(savedBot.id);

                toast.success("Startup Bot added successfully!");
            } catch (error: any) {
                console.error("Failed to add preset bot:", error);
                toast.error(error.message || "Failed to add bot");
                // Rollback on error would be ideal here
            }
        } else if (presetId === 'preset_ecommerce_bot') {
            try {
                // Deep clone to avoid shared references
                const newBot: EmailBot = {
                    ...structuredClone(ECOMMERCE_BOT_PRESET),
                    id: crypto.randomUUID(),
                    userId: 'current-user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Persist
                const savedBot = await createBotAction(newBot);

                setBots(prev => [...prev, savedBot]);
                setSelectedBotId(savedBot.id);

                toast.success("E-Commerce Bot added successfully!");
            } catch (error: any) {
                console.error("Failed to add ecom bot:", error);
                toast.error(error.message || "Failed to add bot");
            }
        } else if (presetId === 'preset_generic_reply_bot') {
            try {
                const newBot: EmailBot = {
                    ...structuredClone(GENERIC_REPLY_BOT_PRESET),
                    id: crypto.randomUUID(),
                    userId: 'current-user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Persist
                const savedBot = await createBotAction(newBot);

                setBots(prev => [...prev, savedBot]);
                setSelectedBotId(savedBot.id);

                toast.success("Generic Reply Bot added successfully!");
            } catch (error: any) {
                console.error("Failed to add generic bot:", error);
                toast.error(error.message || "Failed to add bot");
            }
        } else if (presetId === 'preset_follow_up_bot') {
            try {
                const newBot: EmailBot = {
                    ...structuredClone(FOLLOW_UP_BOT_PRESET),
                    id: crypto.randomUUID(),
                    userId: 'current-user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Persist
                const savedBot = await createBotAction(newBot);

                setBots(prev => [...prev, savedBot]);
                setSelectedBotId(savedBot.id);

                toast.success("Follow-Up Bot added successfully!");
            } catch (error: any) {
                console.error("Failed to add follow-up bot:", error);
                toast.error(error.message || "Failed to add bot");
            }
        } else if (presetId === 'preset_alert_bot') {
            try {
                const newBot: EmailBot = {
                    ...structuredClone(ALERT_BOT_PRESET),
                    id: crypto.randomUUID(),
                    userId: 'current-user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const savedBot = await createBotAction(newBot);

                setBots(prev => [...prev, savedBot]);
                setSelectedBotId(savedBot.id);

                toast.success("🔔 Alert Bot added! Configure your alert rules to get started.");
            } catch (error: any) {
                console.error("Failed to add alert bot:", error);
                toast.error(error.message || "Failed to add bot");
            }
        }
    };

    if (loading) {
        return (
            <AppShell title="Bots">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading bots...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Bots" onSelectEmail={setSelectedBotId}>
            <PremiumFeatureGuard>
                <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 h-[calc(100vh-100px)] overflow-hidden bg-transparent lg:bg-gray-50/50 dark:lg:bg-zinc-950/50 rounded-none lg:rounded-2xl">
                    {/* Left Sidebar - Bot List */}
                    <div className={`w-full lg:w-[420px] flex-shrink-0 h-full ${selectedBotId || isCreating ? 'hidden lg:block' : 'block'}`}>
                    <BotListSidebar
                        bots={bots}
                        selectedBotId={selectedBotId}
                        onSelectBot={setSelectedBotId}
                        onCreateNew={handleCreateNew}
                        onAddPreset={handlePresetAdd}
                        onBotUpdated={handleBotUpdated}
                    />
                    </div>

                    {/* Main Content Area */}
                    <div className={`flex-1 h-full min-w-0 ${!selectedBotId && !isCreating ? 'hidden lg:block' : 'block'}`}>
                    <BotMainView
                        selectedBot={selectedBot}
                        isCreating={isCreating}
                        onBotCreated={handleBotCreated}
                        onBotUpdated={handleBotUpdated}
                        onBotDeleted={handleBotDeleted}
                        onCancelCreate={handleCancelCreate}
                        onBack={() => {
                            setSelectedBotId(null);
                            setIsCreating(false);
                        }}
                    />
                    </div>
                </div>
            </PremiumFeatureGuard>
        </AppShell>
    );
}
