/**
 * Founders Bot Dashboard
 * Custom visual dashboard with charts and metrics for the Startup/Founders Bot
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Activity,
    Users,
    Clock,
    AlertTriangle,
    Target,
    AlertCircle,
    ChevronRight,
    Mail,
    Bell,
    Shield,
    Globe,
    Briefcase,
    XCircle,
    CheckCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const FoundersChart = dynamic(
    () => import('./charts/FoundersChart'),
    { ssr: false }
);
import { getFoundersDashboardDataAction } from '@/app/actions/founders-dashboard';
import { updateBotAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';
import { toast } from 'sonner';

interface FoundersBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
    onNavigateToTab?: (tab: string) => void;
}

interface IntentStats {
    User_Support: number;
    Cold_Sales: number;
    Investor_Outreach: number;
    Hiring: number;
    Meeting_Request: number;
    Legal_Finance: number;
    Other: number;
}

interface RiskDistribution {
    low: number;
    medium: number;
    high: number;
}

export function FoundersBotDashboard({ bot, onBotUpdated, onNavigateToTab }: FoundersBotDashboardProps) {
    const botId = bot.id;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmails: 0,
        supportResolved: 0,
        timeSaved: 0,
        intents: {} as IntentStats,
        riskDistribution: { low: 0, medium: 0, high: 0 } as RiskDistribution,
        businessEmails: 0,
        spamFiltered: 0,
        autoSendEnabled: bot.safety?.autoSendEnabled || false,
    });

    const [avgRisk, setAvgRisk] = useState(0);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    const [showTermsModal, setShowTermsModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Default startup auto-send configs
    const [autoSendConfig, setAutoSendConfig] = useState({
        hiring_talent: false,
        user_support: true,
        investor_outreach: false,
        cold_sales: true
    });

    const fetchData = async () => {
        try {
            const data = await getFoundersDashboardDataAction(botId);
            setStats({
                totalEmails: data.totalEmails,
                supportResolved: data.supportResolved,
                timeSaved: data.timeSaved,
                intents: data.intents as unknown as IntentStats,
                riskDistribution: data.riskDistribution,
                businessEmails: data.businessEmails,
                spamFiltered: data.spamFiltered,
                autoSendEnabled: data.autoSendEnabled,
            });

            if (data.autoSendRules && data.autoSendRules.length > 0) {
                setAutoSendConfig({
                    hiring_talent: data.autoSendRules.includes('hiring_talent'),
                    user_support: data.autoSendRules.includes('user_support'),
                    investor_outreach: data.autoSendRules.includes('investor_outreach'),
                    cold_sales: data.autoSendRules.includes('cold_sales'),
                });
            }

            setAvgRisk(data.avgRisk);
            setRecentActivity(data.recentActivity as any);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to sync dashboard metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [botId]);

    const handleAutoSendToggle = async () => {
        if (!stats.autoSendEnabled) {
            if (!bot.acceptedTermsAt) {
                setAgreedToTerms(false);
                setShowTermsModal(true);
            } else {
                await persistAutoSend(true);
            }
        } else {
            await persistAutoSend(false);
        }
    };

    const persistAutoSend = async (enable: boolean) => {
        setUpdating(true);
        try {
            let updatedActions = [...bot.actions];
            if (enable) {
                updatedActions = updatedActions.map(a =>
                    a.type === 'create_draft'
                        ? { type: 'auto_send_email', config: { ...a.config } }
                        : a
                );
                if (!updatedActions.some(a => a.type === 'auto_send_email' || a.type === 'reply_with_template')) {
                    updatedActions.push({ type: 'auto_send_email', config: { tone: 'professional' } });
                }
            } else {
                updatedActions = updatedActions.map(a =>
                    (a.type === 'auto_send_email' || a.type === 'reply_with_template')
                        ? { type: 'create_draft', config: { ...a.config } }
                        : a
                );
            }

            // Also persist current rules if enabling
            const activeRules = enable ? Object.entries(autoSendConfig)
                .filter(([_, active]) => active)
                .map(([id]) => id) : bot.safety?.autoSendRules || [];

            const updated = await updateBotAction(botId, {
                safety: {
                    ...bot.safety,
                    autoSendEnabled: enable,
                    autoSendRules: activeRules
                },
                actions: updatedActions,
            });
            onBotUpdated(updated);
            setStats(prev => ({ ...prev, autoSendEnabled: enable }));
            toast.success(enable ? 'Auto-reply enabled' : 'Auto-reply disabled');
        } catch (error) {
            toast.error('Failed to update automation settings');
        } finally {
            setUpdating(false);
        }
    };

    const handleTermsAccepted = async () => {
        if (!agreedToTerms) return;
        setUpdating(true);
        try {
            const { acceptBotTermsAction } = await import('@/app/actions/bots');
            await acceptBotTermsAction(botId, '1.0');
            await persistAutoSend(true);
            setShowTermsModal(false);
        } catch (error) {
            toast.error('Failed to enable automation');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-zinc-950 text-zinc-400">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium animate-pulse">Establishing neural link...</p>
                </div>
            </div>
        );
    }

    const totalIntents = Object.values(stats.intents).reduce((a, b) => a + b, 0);
    const intentColors: Record<keyof IntentStats, string> = {
        User_Support: '#10b981', // emerald
        Cold_Sales: '#52525b', // zinc
        Investor_Outreach: '#f97316', // orange
        Hiring: '#3b82f6', // blue
        Meeting_Request: '#a855f7', // purple
        Legal_Finance: '#ef4444', // red
        Other: '#71717a', // zinc-500
    };

    return (
        <div className="space-y-8 pb-12 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-4 sm:p-6 lg:p-8 rounded-none font-sans mt-4 border border-zinc-200 dark:border-zinc-800 transition-colors">

            {/* Auto-Send & Configuration Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-colors"
            >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Target className="w-48 h-48 text-orange-500" />
                </div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                    <div>
                        <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                            <Activity className={`w-6 h-6 ${stats.autoSendEnabled ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            Autonomous Engine
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-medium">Control the strictness of the founder AI proxy.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold tracking-widest uppercase ${stats.autoSendEnabled ? 'text-orange-600 dark:text-orange-500' : 'text-zinc-500'}`}>
                            {stats.autoSendEnabled ? 'SYSTEM ACTIVE' : 'DRAFT MODE ONLY'}
                        </span>
                        <button
                            onClick={handleAutoSendToggle}
                            className={`relative inline-flex h-7 w-12 items-center rounded-none transition-colors border ${stats.autoSendEnabled ? 'bg-orange-500 dark:bg-orange-600 border-orange-500' : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform transition-transform ${stats.autoSendEnabled ? 'translate-x-6 bg-white dark:bg-zinc-50' : 'translate-x-1 bg-zinc-400 dark:bg-zinc-300'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Granular Controls */}
                {stats.autoSendEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 relative z-10"
                    >
                        {[
                            { id: 'user_support', label: 'User Support', icon: Users, desc: 'Acknowledge & Escalate' },
                            { id: 'investor_outreach', label: 'Investor Relations', icon: Globe, desc: 'Warm engagement' },
                            { id: 'hiring_talent', label: 'Talent & Hiring', icon: Briefcase, desc: 'Screening reqs' },
                            { id: 'cold_sales', label: 'Cold Sales', icon: XCircle, desc: 'Polite declines' }
                        ].map((category) => {
                            const isActive = autoSendConfig[category.id as keyof typeof autoSendConfig];

                            return (
                                <div
                                    key={category.id}
                                    className={`p-5 border cursor-pointer transition-all duration-300 ${isActive
                                        ? 'border-orange-500/50 bg-orange-50 dark:bg-orange-500/5 hover:bg-orange-100 dark:hover:bg-orange-500/10'
                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 opacity-60 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                    onClick={async () => {
                                        const nextValue = !isActive;
                                        setAutoSendConfig(prev => ({
                                            ...prev,
                                            [category.id]: nextValue
                                        }));

                                        try {
                                            const activeRules = Object.entries({
                                                ...autoSendConfig,
                                                [category.id]: nextValue
                                            })
                                                .filter(([_, active]) => active)
                                                .map(([id]) => id);

                                            const updated = await updateBotAction(botId, {
                                                safety: {
                                                    ...bot.safety,
                                                    autoSendRules: activeRules
                                                },
                                            });
                                            onBotUpdated(updated);
                                        } catch (err) {
                                            toast.error('Failed to update module state');
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <category.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                        <div className={`w-3 h-3 border ${isActive ? 'bg-orange-500 border-orange-400' : 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-transparent'}`}></div>
                                    </div>
                                    <span className={`block text-sm font-bold ${isActive ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {category.label}
                                    </span>
                                    <span className="text-xs text-zinc-500 font-medium block mt-1">
                                        {category.desc}
                                    </span>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>

            {/* Premium Stats Visualization Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors"
            >
                <div className="flex flex-col lg:grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
                    {/* Left: Key Metrics Overview */}
                    <div className="col-span-12 lg:col-span-4 p-8 space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Cognitive Performance</p>
                            <h4 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">System Leverage</h4>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Emails Handled', value: stats.totalEmails, sub: `${Math.round((stats.supportResolved / Math.max(stats.totalEmails, 1)) * 100)}% automated`, icon: Mail, color: 'text-orange-500' },
                                { label: 'Time Reclaimed', value: `${stats.timeSaved}h`, sub: 'Weekly productivity alpha', icon: Clock, color: 'text-blue-500' },
                                { label: 'Noise Shield', value: stats.spamFiltered, sub: 'Junk & cold pitches stopped', icon: Shield, color: 'text-emerald-500' }
                            ].map((item) => (
                                <div key={item.label} className="group cursor-default">
                                    <div className="flex items-center gap-3 mb-1">
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-orange-500 transition-colors">{item.value}</span>
                                        <span className="text-[10px] font-medium text-zinc-500 italic">{item.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Interactive Visual Analytics */}
                    <div className="col-span-12 lg:col-span-8 p-8 bg-zinc-50/50 dark:bg-zinc-950/20 relative">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Neural Proxy Active</span>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                {[
                                    { name: 'Productivity %', color: 'bg-orange-500' },
                                    { name: 'Volume', color: 'bg-blue-500' }
                                ].map(t => (
                                    <div key={t.name} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${t.color}`} />
                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <FoundersChart
                                data={[
                                    { name: 'Mon', productivity: 65, emails: 12 },
                                    { name: 'Tue', productivity: 78, emails: 15 },
                                    { name: 'Wed', productivity: stats.totalEmails > 0 ? 88 : 45, emails: stats.totalEmails > 0 ? stats.totalEmails : 8 },
                                    { name: 'Thu', productivity: 82, emails: 18 },
                                    { name: 'Fri', productivity: 95, emails: 22 },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    {/* Intent Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                    <Target className="w-5 h-5 text-orange-500" />
                                    Cognitive Routing
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium uppercase tracking-widest">Inbound Vector Analysis</p>
                            </div>
                            <div className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold tracking-widest gap-2 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse"></span>
                                LIVE DATA
                            </div>
                        </div>
                        <div className="space-y-6">
                            {Object.entries(stats.intents).map(([intent, count]) => {
                                const percentage = totalIntents === 0 ? 0 : (count / totalIntents) * 100;
                                const color = intentColors[intent as keyof IntentStats] || '#71717a';
                                return (
                                    <div key={intent} className="group">
                                        <div className="flex justify-between mb-2 items-end">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                                                {intent.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-zinc-500">
                                                {count} • {Math.round(percentage)}%
                                            </span>
                                        </div>
                                        <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: 0.5, duration: 1, ease: 'circOut' }}
                                                className="h-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Business Filter Efficiency Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 relative overflow-hidden transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                            <AlertCircle className="w-48 h-48 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-zinc-900 dark:text-zinc-50">
                            <AlertCircle className="w-6 h-6 text-orange-500" />
                            Risk Assessment
                        </h3>
                        <div className="flex items-end gap-2 h-24 mb-6 relative z-10 w-full">
                            {[12, 45, 18, 56, 34, 89, 23, 10, 5, 2].map((v, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${v}%` }}
                                    transition={{ delay: 0.8 + i * 0.05, duration: 1 }}
                                    className={`flex-1 ${v > 70 ? 'bg-red-500' : v > 30 ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 relative z-10 transition-colors">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Mean Threat Index</p>
                                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{avgRisk}</p>
                            </div>
                            <div className={`px-4 py-2 text-xs font-black uppercase tracking-widest border ${avgRisk < 30 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                                avgRisk < 70 ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' :
                                    'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20'
                                }`}>
                                {avgRisk < 30 ? 'STABLE' : avgRisk < 70 ? 'ELEVATED' : 'CRITICAL'}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    {/* Live Activity Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-orange-500" />
                                Live Telemetry
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1 max-h-[400px] overflow-y-auto pr-4 mb-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {recentActivity.length === 0 ? (
                                <div className="text-zinc-500 text-sm text-center py-10 font-medium tracking-wide">
                                    No operations verified. Awaiting signal.
                                </div>
                            ) : (
                                recentActivity.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + idx * 0.1 }}
                                        className="flex gap-4 group cursor-pointer p-4 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 transition-all"
                                        onClick={() => onNavigateToTab?.('logs')}
                                    >
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.priority === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                                            item.priority === 'Medium' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' :
                                                'bg-emerald-500'
                                            }`} />
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest">{item.type.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-medium">{item.time}</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.subject}</p>
                                            <p className="text-xs text-zinc-500 font-medium line-clamp-1">{item.sender} <span className="text-zinc-300 dark:text-zinc-700 mx-1">|</span> <span className="text-zinc-600 dark:text-zinc-400">{item.action}</span></p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => onNavigateToTab?.('logs')}
                            className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-500 transition-all flex items-center justify-center gap-2 group"
                        >
                            Open Raw Logs
                            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-orange-500" />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-10 max-w-lg w-full relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">System Override</h3>
                        </div>

                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400 mb-8 font-medium">
                            <p className="text-base text-zinc-800 dark:text-zinc-300">
                                You are arming the <span className="text-orange-600 dark:text-orange-500 font-bold border-b border-orange-500/30 pb-0.5">Autonomous Executive Protocol</span>.
                            </p>
                            <p className="text-sm leading-relaxed">
                                The AI will actively send emails on your behalf based on your intent parameters. No human review will occur before dispatch.
                            </p>
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 mt-6">
                                <ul className="space-y-3 text-xs tracking-wide">
                                    <li className="flex gap-3 items-center">
                                        <span className="w-1.5 h-1.5 bg-orange-500"></span>
                                        Strict domain validation remains active
                                    </li>
                                    <li className="flex gap-3 items-center">
                                        <span className="w-1.5 h-1.5 bg-orange-500"></span>
                                        Financial / Legal intents forced to manual draft
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <label className="flex items-start gap-4 p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer mb-8">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 transition-all checked:border-orange-500 checked:bg-orange-500 focus:outline-none rounded-none"
                                />
                                <CheckCircle className="absolute w-3.5 h-3.5 text-white dark:text-zinc-950 opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                                I assume full responsibility for authorized AI transmissions.
                            </span>
                        </label>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="px-6 py-4 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:bg-transparent dark:hover:bg-zinc-900 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleTermsAccepted}
                                disabled={updating || !agreedToTerms}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border ${agreedToTerms && !updating
                                    ? 'bg-orange-500 dark:bg-orange-600 text-white dark:text-zinc-50 border-orange-500 hover:bg-orange-600 dark:hover:bg-orange-500'
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                    }`}
                            >
                                {updating ? 'EXECUTING...' : 'AUTHORIZE ENGAGEMENT'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

