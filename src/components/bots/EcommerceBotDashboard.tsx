/**
 * E-Commerce Bot Dashboard
 * Custom visual dashboard for online store support automation
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    MessageSquare,
    BarChart3 as LucideBarChart,
    ChevronRight,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const StoreHealthChart = dynamic(
    () => import('./charts/StoreHealthChart'),
    { ssr: false }
);
import { getEcommerceDashboardDataAction } from '@/app/actions/ecommerce-dashboard';
import { updateBotAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';
import { toast } from 'sonner';

interface EcommerceBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
    onNavigateToTab?: (tab: string) => void;
}

interface OrderStats {
    Order_Status: number;
    Return_Request: number;
    Product_Inquiry: number;
    Complaint: number;
    Shipping_Question: number;
    Other: number;
}

export function EcommerceBotDashboard({ bot, onBotUpdated, onNavigateToTab }: EcommerceBotDashboardProps) {
    const botId = bot.id;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTickets: 0,
        ordersResolved: 0,
        avgResponseTime: 0,
        inquiryTypes: {} as OrderStats,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        returnsProcessed: 0,
        escalations: 0,
        autoSendEnabled: bot.safety?.autoSendEnabled || false,
    });

    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // ⚠️ Declared before any early returns to satisfy Rules of Hooks
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [autoSendConfig, setAutoSendConfig] = useState({
        customer_support: true,
        product_qa: false,
        refunds: false,
        faq: true
    });

    const fetchData = async () => {
        try {
            const data = await getEcommerceDashboardDataAction(botId);
            setStats({
                totalTickets: data.totalTickets,
                ordersResolved: data.ordersResolved,
                avgResponseTime: data.avgResponseTime,
                inquiryTypes: data.inquiryTypes as unknown as OrderStats,
                sentimentDistribution: data.sentimentDistribution,
                returnsProcessed: data.returnsProcessed,
                escalations: data.escalations,
                autoSendEnabled: data.autoSendEnabled,
            });
            if (data.autoSendRules) {
                setAutoSendConfig({
                    customer_support: data.autoSendRules.includes('customer_support'),
                    product_qa: data.autoSendRules.includes('product_qa'),
                    refunds: data.autoSendRules.includes('refunds'),
                    faq: data.autoSendRules.includes('faq'),
                });
            }
            setRecentActivity(data.recentActivity);
        } catch (error) {
            console.error('Failed to fetch E-Commerce dashboard data:', error);
            toast.error('Failed to sync store metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [botId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-zinc-950 text-zinc-400">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium animate-pulse">Loading store analytics...</p>
                </div>
            </div>
        );
    }

    const totalInquiries = Object.values(stats.inquiryTypes).reduce((a, b) => a + b, 0);
    const inquiryColors: Record<keyof OrderStats, string> = {
        Order_Status: '#3b82f6',
        Return_Request: '#f59e0b',
        Product_Inquiry: '#10b981',
        Complaint: '#ef4444',
        Shipping_Question: '#8b5cf6',
        Other: '#94a3b8',
    };

    const handleAutoSendToggle = async () => {
        if (!stats.autoSendEnabled) {
            // Enabling — show terms modal first if not already accepted
            if (!bot.acceptedTermsAt) {
                setAgreedToTerms(false);
                setShowTermsModal(true);
            } else {
                // Terms already accepted, just enable directly
                await persistAutoSend(true);
            }
        } else {
            // Disabling
            await persistAutoSend(false);
        }
    };

    const persistAutoSend = async (enable: boolean) => {
        setUpdating(true);
        try {
            // Update actions to switch between draft and auto-send
            let updatedActions = [...bot.actions];
            if (enable) {
                // Swap create_draft for auto_send_email
                updatedActions = updatedActions.map(a =>
                    a.type === 'create_draft'
                        ? { type: 'auto_send_email', config: { ...a.config } }
                        : a
                );
                // Ensure at least one send action exists
                if (!updatedActions.some(a => a.type === 'auto_send_email' || a.type === 'reply_with_template')) {
                    updatedActions.push({ type: 'auto_send_email', config: { tone: 'professional' } });
                }
            } else {
                // Swap auto_send_email or reply_with_template back to create_draft
                updatedActions = updatedActions.map(a =>
                    (a.type === 'auto_send_email' || a.type === 'reply_with_template')
                        ? { type: 'create_draft', config: { ...a.config } }
                        : a
                );
            }

            const updated = await updateBotAction(botId, {
                safety: { ...bot.safety, autoSendEnabled: enable },
                actions: updatedActions,
            });
            onBotUpdated(updated);
            setStats(prev => ({ ...prev, autoSendEnabled: enable }));
            toast.success(enable ? 'Auto-send enabled' : 'Auto-send disabled');
        } catch (error) {
            toast.error('Failed to update auto-send setting');
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
            toast.error('Failed to enable auto-send');
        } finally {
            setUpdating(false);
        }
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
                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                    <ShoppingCart className="w-48 h-48 text-orange-500" />
                </div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                    <div>
                        <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                            <RefreshCw className={`w-6 h-6 ${stats.autoSendEnabled ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            Automation Control
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm font-medium">Manage autonomous email responses and safety rules</p>
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

                {/* Granular Controls - Only visible when Auto-Send is ON */}
                {stats.autoSendEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800 relative z-10"
                    >
                        {[
                            { id: 'customer_support', label: 'Customer Support', icon: Users, desc: 'Address issues' },
                            { id: 'product_qa', label: 'Product Q&A', icon: Package, desc: 'Inquiry details' },
                            { id: 'refunds', label: 'Returns & Refunds', icon: RefreshCw, desc: 'Process labels' },
                            { id: 'faq', label: 'General FAQ', icon: MessageSquare, desc: 'Fast answers' }
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

                                        // Persist to backend
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
                                            toast.error('Failed to update category setting');
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
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Performance Summary</p>
                            <h4 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Store Health</h4>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Total Volume', value: stats.totalTickets, sub: `${Math.round((stats.ordersResolved / Math.max(stats.totalTickets, 1)) * 100)}% Auto-resolved`, icon: MessageSquare, color: 'text-orange-500' },
                                { label: 'Avg Resolution', value: `${stats.avgResponseTime}m`, sub: 'Lightning-fast response', icon: Clock, color: 'text-emerald-500' },
                                { label: 'Returns', value: stats.returnsProcessed, sub: 'Logistics automated', icon: RefreshCw, color: 'text-blue-500' }
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
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Store Synced</span>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                {[
                                    { name: 'Total', color: 'bg-orange-500' },
                                    { name: 'Resolved', color: 'bg-emerald-500' },
                                    { name: 'Returns', color: 'bg-blue-500' }
                                ].map(t => (
                                    <div key={t.name} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${t.color}`} />
                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <StoreHealthChart
                                data={[
                                    { name: 'Total', value: stats.totalTickets, color: '#f97316' },
                                    { name: 'Resolved', value: stats.ordersResolved, color: '#10b981' },
                                    { name: 'Returns', value: stats.returnsProcessed, color: '#3b82f6' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Inquiry Breakdown & Sentiment */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    {/* Inquiry Type Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => onNavigateToTab?.('logs')}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                    <LucideBarChart className="w-5 h-5 text-orange-500" />
                                    Inquiry Intelligence
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium uppercase tracking-widest">AI-powered ticket routing</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold tracking-widest gap-2 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse"></span>
                                    LIVE DATA
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-orange-500 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            {Object.entries(stats.inquiryTypes).map(([type, count]) => {
                                const percentage = totalInquiries === 0 ? 0 : (count / totalInquiries) * 100;
                                const color = inquiryColors[type as keyof OrderStats];
                                return (
                                    <div key={type} className="group/item">
                                        <div className="flex justify-between mb-2 items-end">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover/item:text-orange-500 dark:group-hover/item:text-orange-400 transition-colors">
                                                {type.replace(/_/g, ' ')}
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

                    {/* Customer Sentiment Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 relative overflow-hidden transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                            <Users className="w-48 h-48 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-3 text-zinc-900 dark:text-zinc-50">
                            <Users className="w-6 h-6 text-orange-500" />
                            Customer Satisfaction
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 w-full">
                            <div className="space-y-2">
                                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Happy</p>
                                <p className="text-5xl font-black text-zinc-900 dark:text-zinc-100">{stats.sentimentDistribution.positive}</p>
                                <p className="text-xs text-zinc-500 font-medium border-l-2 border-emerald-500/30 pl-2">Positive interactions</p>
                            </div>
                            <div className="space-y-2 border-l border-zinc-200 dark:border-zinc-800 pl-6">
                                <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Neutral</p>
                                <p className="text-5xl font-black text-zinc-900 dark:text-zinc-100">{stats.sentimentDistribution.neutral}</p>
                                <p className="text-xs text-zinc-500 font-medium border-l-2 border-orange-500/30 pl-2">Standard inquiries</p>
                            </div>
                            <div className="space-y-2 border-l border-zinc-200 dark:border-zinc-800 pl-6">
                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Escalated</p>
                                <p className="text-5xl font-black text-zinc-900 dark:text-zinc-100">{stats.sentimentDistribution.negative}</p>
                                <p className="text-xs text-zinc-500 font-medium border-l-2 border-red-500/30 pl-2">Requires attention</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sentiment Engine Active</span>
                            </div>
                            {(() => {
                                const total = stats.sentimentDistribution.positive + stats.sentimentDistribution.neutral + stats.sentimentDistribution.negative;
                                const pct = total === 0 ? 0 : Math.round((stats.sentimentDistribution.positive / total) * 100);
                                return (
                                    <span className="text-xl font-black text-emerald-500">
                                        {pct}% SATISFACTION
                                    </span>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Live Activity & Escalations */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    {/* Live Ticket Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => onNavigateToTab?.('logs')}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                <Package className="w-5 h-5 text-orange-500" />
                                Live Ticket Feed
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-orange-500 transition-colors" />
                            </div>
                        </div>

                        {/* Fixed Height Container for Feed */}
                        <div className="space-y-6 flex-1 max-h-[400px] overflow-y-auto pr-4 mb-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {recentActivity.length === 0 ? (
                                <div className="text-zinc-500 text-sm text-center py-10 font-medium tracking-wide">
                                    <MessageSquare className="w-12 h-12 mb-3 opacity-20 mx-auto text-zinc-400 dark:text-zinc-600" />
                                    <p className="font-bold">No recent tickets</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Incoming inquiries will appear here</p>
                                </div>
                            ) : (
                                recentActivity.slice(0, 10).map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + idx * 0.1 }}
                                        className="flex gap-4 group/item cursor-pointer p-4 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 transition-all"
                                    >
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.sentiment === 'negative' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                                            item.sentiment === 'positive' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-orange-500'
                                            }`} />
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest">{item.type.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-medium">{item.time}</span>
                                            </div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 line-clamp-1 group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors">{item.subject}</p>
                                            <p className="text-xs text-zinc-500 font-medium line-clamp-1">{item.customer} <span className="text-zinc-300 dark:text-zinc-700 mx-1">|</span> <span className="text-zinc-600 dark:text-zinc-400">{item.action}</span></p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <button
                            className="w-full py-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-500 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                            VIEW ALL TICKETS
                            <ShoppingCart className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover/btn:text-orange-500" />
                        </button>
                    </motion.div>

                    {/* Escalation Alert */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        onClick={() => onNavigateToTab?.('logs')}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                            <AlertCircle className="w-32 h-32 text-red-500" />
                        </div>
                        <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            Escalation Monitor
                            <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-red-500 transition-colors ml-auto" />
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 transition-colors">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">High-Value Orders</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">3</p>
                                </div>
                                <div className="px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 text-xs font-black tracking-widest uppercase">FLAGGED</div>
                            </div>
                            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 transition-colors">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Angry Customers</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stats.escalations}</p>
                                </div>
                                <div className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 text-xs font-black tracking-widest uppercase">URGENT</div>
                            </div>
                        </div>
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
                                        AI-generated replies adhere to your style
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
                                {updating ? 'AUTHORIZING...' : 'AUTHORIZE ENGAGEMENT'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
