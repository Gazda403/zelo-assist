/**
 * Bot Detail View Component
 * Shows bot overview, configuration, execution logs, and settings
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Activity, Info, Trash2, Power, ArrowLeft } from 'lucide-react';
import type { EmailBot, AcknowledgmentTemplate } from '@/lib/bots/types';
import { deleteBotAction, toggleBotAction, acceptBotTermsAction } from '@/app/actions/bots';
import { BotExecutionLog } from './BotExecutionLog';
import { BotFollowUpList } from './BotFollowUpList';
import { ExecutionPreview } from './ExecutionPreview';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';
import { FollowUpConfig } from './FollowUpConfig';
import { KnowledgeBaseManager } from './KnowledgeBaseManager';
import { FoundersBotDashboard } from './FoundersBotDashboard';
import { EcommerceBotDashboard } from './EcommerceBotDashboard';
import { GenericReplyBotDashboard } from './GenericReplyBotDashboard';
import { FollowUpBotDashboard } from './FollowUpBotDashboard';
import { AlertBotDashboard } from './AlertBotDashboard';
import { updateBotAction } from '@/app/actions/bots';
import { Clock, Book, Brain } from 'lucide-react';
import { AcknowledgmentTemplateEditor } from './AcknowledgmentTemplateEditor';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface BotDetailViewProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
    onBotDeleted: (botId: string) => void;
    onBack?: () => void;
}

type Tab = 'overview' | 'followups' | 'kb' | 'logs' | 'settings';

export function BotDetailView({ bot, onBotUpdated, onBotDeleted, onBack }: BotDetailViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Auto-show terms modal if auto-send is enabled but terms not accepted
    const hasAutoSend = bot.actions.some(a => a.type === 'auto_send_email' || a.type === 'reply_with_template');

    useEffect(() => {
        if (hasAutoSend && bot.safety.autoSendEnabled && !bot.acceptedTermsAt) {
            setShowTermsModal(true);
        }
    }, [bot.id, hasAutoSend, bot.safety.autoSendEnabled, bot.acceptedTermsAt]);

    const handleToggle = async () => {
        const newEnabledState = !bot.enabled;

        // If enabling with auto-send and terms not accepted, show modal
        if (newEnabledState && hasAutoSend && bot.safety.autoSendEnabled && !bot.acceptedTermsAt) {
            setShowTermsModal(true);
            return;
        }

        // Otherwise toggle directly
        setIsToggling(true);
        try {
            const updated = await toggleBotAction(bot.id, newEnabledState);
            onBotUpdated(updated);
        } catch (error) {
            console.error('Failed to toggle bot:', error);
            alert('Failed to toggle bot');
        } finally {
            setIsToggling(false);
        }
    };

    const handleAcceptTerms = async () => {
        try {
            // Accept terms first
            await acceptBotTermsAction(bot.id, '1.0');
            // Then enable bot
            const updated = await toggleBotAction(bot.id, true);
            onBotUpdated(updated);
            setShowTermsModal(false);
        } catch (error) {
            console.error('Failed to accept terms:', error);
            throw error;
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteBotAction(bot.id);
            onBotDeleted(bot.id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Failed to delete bot:', error);
            alert('Failed to delete bot');
        } finally {
            setIsDeleting(false);
        }
    };

    // Show Follow-Ups tab only if bot has follow-up related triggers
    const hasFollowUps = bot.trigger.type === 'email_thread_inactive_for' ||
        bot.trigger.type === 'outgoing_email_sent' ||
        bot.name.toLowerCase().includes('follow');

    const isAcknowledgmentBot = bot.id === 'preset_generic_reply_bot' ||
        bot.name.includes('Auto-Acknowledgment') ||
        bot.name.includes('Acknowledge') ||
        bot.name.includes('Generic Reply');

    const isFollowUpBot = bot.id === 'preset_follow_up_bot' ||
        bot.name.includes('Follow-Up') ||
        bot.name.includes('Follow Up');

    const isAlertBot = bot.id === 'preset_alert_bot' ||
        bot.name.includes('Alert Bot') ||
        bot.name.toLowerCase().includes('trip wire');

    const tabs = [
        { id: 'overview' as Tab, label: 'Overview', icon: Info },
        ...(hasFollowUps ? [{ id: 'followups' as Tab, label: 'Follow Ups', icon: Clock }] : []),
        ...((!isAcknowledgmentBot && !isFollowUpBot) ? [{ id: 'kb' as Tab, label: 'Knowledge Base', icon: Brain }] : []),
        { id: 'logs' as Tab, label: 'Execution Logs', icon: Activity },
        ...(!isFollowUpBot ? [{ id: 'settings' as Tab, label: 'Settings', icon: Settings }] : []),
    ];

    return (
        <div id="tour-bot-settings" className="max-w-5xl mx-auto p-6 max-md:px-3 max-md:py-4">
            {/* Header */}
            <div className="mb-6 max-md:mb-4">
                <div className="flex items-start justify-between mb-4 max-md:mb-2 max-md:gap-2">
                    <div className="flex-1 max-md:min-w-0">
                        <div className="flex items-center gap-3 mb-2 max-md:gap-2 max-md:mb-1">
                            {onBack && (
                                <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors max-md:p-1.5 max-md:-ml-1">
                                    <ArrowLeft className="w-5 h-5 max-md:w-4 max-md:h-4" />
                                </button>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-bold font-serif max-md:text-xl max-md:leading-tight">{bot.name}</h1>
                            {/* Enable toggle — inline on desktop, moved to actions column on mobile */}
                            <button
                                onClick={handleToggle}
                                disabled={isToggling}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 max-md:hidden ${bot.enabled
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Power className="w-4 h-4" />
                                {bot.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                        {bot.description && (
                            <p className="text-gray-600 max-md:text-xs max-md:line-clamp-2">{bot.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 max-md:gap-1.5 max-md:shrink-0">
                        {/* Enable toggle on mobile only — compact icon+label */}
                        <button
                            onClick={handleToggle}
                            disabled={isToggling}
                            className={`hidden max-md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${bot.enabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Power className="w-3.5 h-3.5" />
                        </button>
                        <ExecutionPreview bot={bot} />
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 max-md:p-1.5"
                            title="Delete bot"
                        >
                            <Trash2 className="w-5 h-5 max-md:w-4 max-md:h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b max-md:overflow-x-auto max-md:hide-scrollbar">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const shortLabel: Record<string, string> = {
                            'Knowledge Base': 'KB',
                            'Execution Logs': 'Logs',
                        };
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                title={tab.label}
                                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap max-md:gap-1.5 max-md:px-3 max-md:text-xs ${
                                    activeTab === tab.id
                                        ? 'border-violet-600 text-violet-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 shrink-0" />
                                {/* Full label on desktop, short label on mobile */}
                                <span className="max-md:hidden">{tab.label}</span>
                                <span className="hidden max-md:inline">{shortLabel[tab.label] ?? tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'overview' && (
                    <>
                        {/* Custom Dashboard for Founders/Startup Bot */}
                        {(bot.id === 'preset_startup_bot' || bot.name.includes('Startup Bot') || bot.name.includes('Founders Bot')) ? (
                            <FoundersBotDashboard bot={bot} onBotUpdated={onBotUpdated} onNavigateToTab={(tab) => setActiveTab(tab as Tab)} />
                        ) : (bot.id === 'preset_ecommerce_bot' || bot.name.includes('E-Commerce') || bot.name.includes('Ecommerce')) ? (
                            <EcommerceBotDashboard
                                bot={bot}
                                onBotUpdated={onBotUpdated}
                                onNavigateToTab={(tab) => setActiveTab(tab as Tab)}
                            />
                        ) : (bot.id === 'preset_generic_reply_bot' || bot.name.includes('Generic Reply') || bot.name.includes('Auto Reply') || bot.name.includes('Auto-Acknowledgment')) ? (
                            <GenericReplyBotDashboard bot={bot} onBotUpdated={onBotUpdated} />
                        ) : (bot.id === 'preset_follow_up_bot' || bot.name.includes('Follow-Up') || bot.name.includes('Follow Up')) ? (
                            <FollowUpBotDashboard
                                bot={bot}
                                onBotUpdated={onBotUpdated}
                                onDelete={handleDelete}
                                isDeleting={isDeleting}
                            />
                        ) : isAlertBot ? (
                            <AlertBotDashboard
                                bot={bot}
                                onBotUpdated={onBotUpdated}
                                onDelete={handleDelete}
                                isDeleting={isDeleting}
                            />
                        ) : (
                            <div className="space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-md:gap-3">
                                    <motion.div whileHover={{ y: -2 }} className="p-5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all max-md:p-4">
                                        <div className="text-3xl font-black text-violet-600 dark:text-violet-400 max-md:text-2xl">{bot.stats.totalExecutions}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 max-md:text-xs">Total Runs</div>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -2 }} className="p-5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all max-md:p-4">
                                        <div className="text-3xl font-black text-green-600 dark:text-green-400 max-md:text-2xl">{bot.stats.successCount}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 max-md:text-xs">Successful</div>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -2 }} className="p-5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all max-md:p-4">
                                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 max-md:text-2xl">{bot.stats.emailsSent}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 max-md:text-xs">Emails Sent</div>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -2 }} className="p-5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] transition-all max-md:p-4">
                                        <div className="text-3xl font-black text-purple-600 dark:text-purple-400 max-md:text-2xl">{bot.stats.draftsCreated}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 max-md:text-xs">Drafts Created</div>
                                    </motion.div>
                                </div>

                                {/* Configuration */}
                                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
                                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Configuration</h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Trigger:</span>
                                            <span className="ml-2 font-mono bg-violet-50/50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-bold px-2.5 py-1 rounded-lg">
                                                {bot.trigger.type}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Conditions:</span>
                                            <span className="ml-2 font-medium">
                                                {bot.conditions.length === 0 ? (
                                                    <span className="text-gray-400">None</span>
                                                ) : (
                                                    bot.conditions.map(c => c.type).join(', ')
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Actions:</span>
                                            <span className="ml-2 font-medium">
                                                {bot.actions.map(a => a.type).join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Safety */}
                                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
                                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Safety Settings</h3>
                                    <div className="space-y-3 text-sm font-medium">
                                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Auto-send enabled</span>
                                            <span className={bot.safety.autoSendEnabled ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-400'}>
                                                {bot.safety.autoSendEnabled ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        {bot.safety.autoSendEnabled && (
                                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                                <span className="text-gray-500 dark:text-gray-400">Terms accepted</span>
                                                <span className={bot.acceptedTermsAt ? 'text-green-600 dark:text-green-400 font-bold' : 'text-amber-600 font-bold'}>
                                                    {bot.acceptedTermsAt ? '✓ Yes' : '✗ No'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Max sends per day</span>
                                            <span className="text-gray-900 dark:text-gray-200">{bot.safety.maxSendsPerDay}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                                            <span className="text-gray-500 dark:text-gray-400">Cooldown</span>
                                            <span className="text-gray-900 dark:text-gray-200">{bot.safety.cooldownMinutes} minutes</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 dark:text-gray-400">Loop prevention</span>
                                            <span className={bot.safety.loopPrevention ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-400'}>
                                                {bot.safety.loopPrevention ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'followups' && (
                    <div className="space-y-6">
                        <BotFollowUpList botId={bot.id} />

                        {isFollowUpBot && (
                            <>
                                <FollowUpConfig
                                    bot={bot}
                                    onUpdate={async (updates) => {
                                        const updated = await updateBotAction(bot.id, updates);
                                        onBotUpdated(updated);
                                    }}
                                />

                                <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 shadow-sm">
                                    <h3 className="font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Bot
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'kb' && <KnowledgeBaseManager botId={bot.id} />}

                {activeTab === 'logs' && <BotExecutionLog botId={bot.id} />}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Template Editor for Auto-Acknowledgment Bot */}
                        {(isAcknowledgmentBot) && (
                            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] p-6 transition-all">
                                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Acknowledgment Template</h3>
                                <AcknowledgmentTemplateEditor
                                    botId={bot.id}
                                    currentTemplate={(bot.actions.find(a => a.type === 'auto_send_email')?.config as any)?.acknowledgmentTemplate}
                                    onSave={async (template: AcknowledgmentTemplate) => {
                                        const updatedActions = bot.actions.map(action => {
                                            if (action.type === 'auto_send_email') {
                                                const config = action.config as any;
                                                return {
                                                    ...action,
                                                    config: {
                                                        ...config,
                                                        acknowledgmentTemplate: template
                                                    }
                                                };
                                            }
                                            return action;
                                        });

                                        const updated = await updateBotAction(bot.id, { actions: updatedActions });
                                        onBotUpdated(updated);
                                    }}
                                />
                            </div>
                        )}

                        {(hasFollowUps || isAcknowledgmentBot) && (
                            <FollowUpConfig
                                bot={bot}
                                onUpdate={async (updates) => {
                                    const updated = await updateBotAction(bot.id, updates);
                                    onBotUpdated(updated);
                                }}
                            />
                        )}

                        <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Bot
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Terms Modal */}
            <TermsAcceptanceModal
                bot={bot}
                isOpen={showTermsModal}
                onAccept={handleAcceptTerms}
                onCancel={() => setShowTermsModal(false)}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                botName={bot.name}
                isDeleting={isDeleting}
            />
        </div>
    );
}
