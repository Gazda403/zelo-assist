/**
 * Alert Bot Dashboard
 * Setup and monitoring UI for the trip-wire notification bot
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellRing, Sparkles, Loader2, X, Plus, Mail,
    AtSign, Tag, CheckCircle2, AlertTriangle, Trash2, Power,
    Clock, Search
} from 'lucide-react';
import type { EmailBot, AlertBotConfig, AlertMatch } from '@/lib/bots/types';
import { generateAlertRulesAction } from '@/app/actions/generate-alert-rules';
import { updateBotAction, toggleBotAction } from '@/app/actions/bots';
import { toast } from 'sonner';

interface AlertBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
    onDelete: () => void;
    isDeleting: boolean;
}

export function AlertBotDashboard({ bot, onBotUpdated, onDelete, isDeleting }: AlertBotDashboardProps) {
    const config: AlertBotConfig = bot.alertConfig ?? {
        userDescription: '',
        senderFilters: [],
        keywords: [],
        searchIn: 'both',
        recentAlerts: [],
    };

    const [description, setDescription] = useState(config.userDescription || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [localConfig, setLocalConfig] = useState<AlertBotConfig>(config);
    const [newSender, setNewSender] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    const recentAlerts: AlertMatch[] = localConfig.recentAlerts ?? [];

    // ── Generate rules from AI ──────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!description.trim()) {
            toast.error('Please describe what emails should trigger an alert.');
            return;
        }
        setIsGenerating(true);
        try {
            const rules = await generateAlertRulesAction(description);
            const merged: AlertBotConfig = {
                ...localConfig,
                userDescription: description,
                senderFilters: rules.senderFilters,
                keywords: rules.keywords,
                searchIn: rules.searchIn,
                lastGeneratedAt: rules.lastGeneratedAt,
            };
            setLocalConfig(merged);
            toast.success('Alert rules generated! Review and save below.');
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate rules.');
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Save rules to DB ────────────────────────────────────────────────────
    const handleSave = async () => {
        if (localConfig.senderFilters.length === 0 && localConfig.keywords.length === 0) {
            toast.error('Add at least one sender filter or keyword before saving.');
            return;
        }
        setIsSaving(true);
        try {
            const updated = await updateBotAction(bot.id, { alertConfig: localConfig });
            onBotUpdated(updated);
            toast.success('Alert rules saved!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to save rules.');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Toggle enabled ──────────────────────────────────────────────────────
    const handleToggle = async () => {
        setIsToggling(true);
        try {
            const updated = await toggleBotAction(bot.id, !bot.enabled);
            onBotUpdated(updated);
            toast.success(updated.enabled ? '🔔 Alert Bot is now watching your inbox!' : 'Alert Bot paused.');
        } catch {
            toast.error('Failed to toggle bot.');
        } finally {
            setIsToggling(false);
        }
    };

    // ── Chip helpers ────────────────────────────────────────────────────────
    const addSender = () => {
        const val = newSender.trim();
        if (!val || localConfig.senderFilters.includes(val)) return;
        setLocalConfig(c => ({ ...c, senderFilters: [...c.senderFilters, val] }));
        setNewSender('');
    };

    const removeSender = (s: string) =>
        setLocalConfig(c => ({ ...c, senderFilters: c.senderFilters.filter(x => x !== s) }));

    const addKeyword = () => {
        const val = newKeyword.trim().toLowerCase();
        if (!val || localConfig.keywords.includes(val)) return;
        setLocalConfig(c => ({ ...c, keywords: [...c.keywords, val] }));
        setNewKeyword('');
    };

    const removeKeyword = (k: string) =>
        setLocalConfig(c => ({ ...c, keywords: c.keywords.filter(x => x !== k) }));

    const hasRules = localConfig.senderFilters.length > 0 || localConfig.keywords.length > 0;
    const isDirty = JSON.stringify(localConfig) !== JSON.stringify(config);

    return (
        <div className="space-y-6">
            {/* ── Status Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${bot.enabled
                    ? 'bg-green-50/80 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {bot.enabled ? (
                        <div className="relative">
                            <BellRing className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                        </div>
                    ) : (
                        <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    )}
                    <div>
                        <p className={`font-semibold text-sm ${bot.enabled ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {bot.enabled ? 'Actively watching your inbox' : 'Bot is paused'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {hasRules
                                ? `Monitoring ${localConfig.senderFilters.length} sender(s) · ${localConfig.keywords.length} keyword(s)`
                                : 'No rules set yet — configure below'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleToggle}
                    disabled={isToggling || !hasRules}
                    title={!hasRules ? 'Save rules first' : ''}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${bot.enabled
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                >
                    {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    {bot.enabled ? 'Pause' : 'Enable'}
                </button>
            </motion.div>

            {/* ── AI Rule Generator ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6"
            >
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Describe Your Alert</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Type what emails should get your attention — AI will extract the rules for you.
                </p>

                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={`e.g. "Warn me if any email from david@company.com or anything about invoices, payments, or overdue bills"`}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
                />

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)]"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating Rules...</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Alert Rules</>
                    )}
                </button>
            </motion.div>

            {/* ── Rules Editor ── */}
            <AnimatePresence>
                {(hasRules || localConfig.lastGeneratedAt) && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6 space-y-5"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-violet-500" />
                                Detection Rules
                            </h3>
                            {localConfig.lastGeneratedAt && (
                                <span className="text-xs text-gray-400">
                                    Last generated {new Date(localConfig.lastGeneratedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* Search scope */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Search In
                            </label>
                            <div className="flex gap-2">
                                {(['subject', 'body', 'both'] as const).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setLocalConfig(c => ({ ...c, searchIn: opt }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${localConfig.searchIn === opt
                                            ? 'bg-violet-600 text-white border-violet-600'
                                            : 'bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-violet-400'
                                            }`}
                                    >
                                        {opt === 'both' ? 'Subject + Body' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sender Filters */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <AtSign className="w-3 h-3" /> Sender Filters
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {localConfig.senderFilters.map(s => (
                                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        {s}
                                        <button onClick={() => removeSender(s)} className="hover:text-red-500 transition-colors ml-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {localConfig.senderFilters.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">No sender filters — keyword-only mode</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSender}
                                    onChange={e => setNewSender(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSender()}
                                    placeholder="david@company.com or @paypal.com"
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400"
                                />
                                <button onClick={addSender} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Tag className="w-3 h-3" /> Keywords
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {localConfig.keywords.map(k => (
                                    <span key={k} className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-full text-xs font-medium">
                                        <Search className="w-3 h-3 shrink-0" />
                                        {k}
                                        <button onClick={() => removeKeyword(k)} className="hover:text-red-500 transition-colors ml-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {localConfig.keywords.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">No keywords — sender-only mode</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyword}
                                    onChange={e => setNewKeyword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addKeyword()}
                                    placeholder="invoice, payment, urgent..."
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all placeholder:text-gray-400"
                                />
                                <button onClick={addKeyword} className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Save button */}
                        {isDirty && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isSaving ? 'Saving...' : 'Save Rules'}
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Recent Alerts ── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6"
            >
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Recent Alerts
                    {recentAlerts.length > 0 && (
                        <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                            {recentAlerts.length}
                        </span>
                    )}
                </h3>

                {recentAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No alerts yet</p>
                        <p className="text-xs mt-1 opacity-70">
                            {bot.enabled ? 'Watching your inbox...' : 'Enable the bot to start watching'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentAlerts.slice(0, 10).map((alert, i) => (
                            <motion.div
                                key={`${alert.emailId}-${i}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-start gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl group"
                            >
                                <BellRing className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {alert.subject}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {alert.sender}
                                        </span>
                                        {alert.matchedKeyword && (
                                            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded-full font-bold">
                                                keyword: {alert.matchedKeyword}
                                            </span>
                                        )}
                                        {alert.matchedSender && (
                                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">
                                                sender match
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Alerts', value: bot.stats.totalExecutions, color: 'violet' },
                    { label: 'This Week', value: recentAlerts.filter(a => {
                        const d = new Date(a.detectedAt);
                        const now = new Date();
                        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
                    }).length, color: 'amber' },
                    { label: 'Rules Active', value: localConfig.senderFilters.length + localConfig.keywords.length, color: 'blue' },
                ].map(stat => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ y: -2 }}
                        className="p-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] text-center"
                    >
                        <div className={`text-3xl font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>
                            {stat.value}
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ── Danger Zone ── */}
            <div className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
                <h3 className="font-semibold mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Bot
                </button>
            </div>
        </div>
    );
}
