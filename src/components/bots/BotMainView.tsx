'use client';

import { useState, useEffect } from 'react';
import { BotListSidebar } from './BotListSidebar';
import { BotDetailView } from './BotDetailView';
import { BotWizard } from './BotWizard';
import { getBotsAction, createBotAction, addPresetBotAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';
import { toast } from 'sonner';

export default function BotMainView() {
    const [bots, setBots] = useState<EmailBot[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBots();
    }, []);

    const loadBots = async () => {
        try {
            setLoading(true);
            const data = await getBotsAction();
            setBots(data);
            if (data.length > 0 && !selectedBotId) {
                setSelectedBotId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to load bots:', error);
            toast.error('Failed to load bots');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBot = async (botData: any) => {
        try {
            const newBot = await createBotAction(botData);
            setBots([...bots, newBot]);
            setSelectedBotId(newBot.id);
            setShowWizard(false);
            toast.success('Bot created successfully!');
        } catch (error) {
            console.error('Failed to create bot:', error);
            toast.error('Failed to create bot');
            throw error;
        }
    };

    const handleAddPreset = async (presetId: string) => {
        try {
            const newBot = await addPresetBotAction(presetId);
            setBots([...bots, newBot]);
            setSelectedBotId(newBot.id);
            setShowWizard(false);
            toast.success(`${newBot.name} added!`);
        } catch (error) {
            console.error('Failed to add preset:', error);
            toast.error('Failed to add preset bot');
        }
    };

    const handleBotUpdated = (updatedBot: EmailBot) => {
        setBots(bots.map(b => b.id === updatedBot.id ? updatedBot : b));
    };

    const handleBotDeleted = (botId: string) => {
        setBots(bots.filter(b => b.id !== botId));
        if (selectedBotId === botId) {
            setSelectedBotId(bots.length > 1 ? bots[0].id : null);
        }
        toast.success('Bot deleted');
    };

    const selectedBot = bots.find(b => b.id === selectedBotId);

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50/50 dark:bg-zinc-950/50">
            <BotListSidebar
                bots={bots}
                selectedBotId={selectedBotId}
                onSelectBot={(id) => {
                    setSelectedBotId(id);
                    setShowWizard(false);
                }}
                onCreateNew={() => setShowWizard(true)}
                onAddPreset={handleAddPreset}
                onBotUpdated={handleBotUpdated}
            />

            <main className="flex-1 overflow-y-auto custom-scrollbar">
                {showWizard ? (
                    <BotWizard
                        onCancel={() => setShowWizard(false)}
                        onComplete={handleCreateBot}
                    />
                ) : selectedBot ? (
                    <BotDetailView
                        bot={selectedBot}
                        onBotUpdated={handleBotUpdated}
                        onBotDeleted={handleBotDeleted}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-6">
                            <Bot className="w-12 h-12 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Manage Your AI Workforce</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Select a bot from the sidebar to view its performance, or create a new one to automate your workflows.
                        </p>
                        <button
                            onClick={() => setShowWizard(true)}
                            className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-violet-200 transition-all hover:-translate-y-0.5"
                        >
                            Create Your First Bot
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
