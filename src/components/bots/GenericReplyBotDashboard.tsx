'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Zap,
    CheckCircle2,
    Clock,
    TrendingUp,
    Activity,
    RefreshCw,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getGenericReplyDashboardDataAction } from '@/app/actions/generic-reply-dashboard';
import { updateBotAction } from '@/app/actions/bots';
import { toast } from 'sonner';
import type { EmailBot } from '@/lib/bots/types';

const GenericReplyChart = dynamic(
    () => import('./charts/GenericReplyChart'),
    { ssr: false }
);

interface GenericReplyBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
}

interface TemplateStats {
    [templateName: string]: number;
}

interface DashboardStats {
    totalAcknowledgments: number;
    successRate: number;
    avgResponseTime: number;
    templatesUsed: TemplateStats;
    escalations: number;
    newSendersToday: number;
    performanceHistory: any[];
}

export function GenericReplyBotDashboard({ bot, onBotUpdated }: GenericReplyBotDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalAcknowledgments: 0,
        successRate: 0,
        avgResponseTime: 0,
        templatesUsed: {},
        escalations: 0,
        newSendersToday: 0,
        performanceHistory: [],
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const data = await getGenericReplyDashboardDataAction(bot.id);
            setStats({
                totalAcknowledgments: data.totalReplies || 0,
                successRate: data.successRate,
                avgResponseTime: data.avgResponseTime,
                templatesUsed: data.templatesUsed,
                escalations: data.escalations,
                newSendersToday: 0, // Not currently provided by action
                performanceHistory: data.performanceHistory || [],
            });
            setRecentActivity(data.recentActivity);
        } catch (error) {
            console.error('Failed to fetch Generic Reply dashboard data:', error);
            toast.error('Failed to sync template metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [bot.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const maxTemplateCount = Math.max(...Object.values(stats.templatesUsed), 1);

    return (
        <div className="space-y-6 pb-12 rounded-none font-sans mt-4 transition-colors">
            {/* Premium Stats Visualization Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors"
            >
                <div className="grid grid-cols-12 divide-x divide-zinc-200 dark:divide-zinc-800">
                    {/* Left: Key Metrics Overview */}
                    <div className="col-span-12 lg:col-span-5 p-4 sm:p-8 space-y-5 sm:space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em] mb-2">Automated Engagement</p>
                            <h4 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Acknowledgment Health</h4>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Acknowledgments Sent', value: stats.totalAcknowledgments, sub: `${stats.newSendersToday} new senders today`, icon: Zap, color: 'text-fuchsia-500' },
                                { label: 'Response Time', value: `${stats.avgResponseTime}m`, sub: 'Instant preliminary reply', icon: Clock, color: 'text-blue-500' },
                                { label: 'Delivery Rate', value: `${stats.successRate}%`, sub: 'Successfully routed', icon: CheckCircle2, color: 'text-emerald-500' }
                            ].map((item) => (
                                <div key={item.label} className="group cursor-default">
                                    <div className="flex items-center gap-3 mb-1">
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-fuchsia-500 transition-colors">{item.value}</span>
                                        <span className="text-[10px] font-medium text-zinc-500 italic">{item.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Interactive Visual Analytics */}
                    <div className="col-span-12 lg:col-span-7 p-4 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/20 relative">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-0 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Delivery Metrics</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 xl:gap-6">
                                {[
                                    { name: 'Successful', color: 'bg-fuchsia-500' },
                                    { name: 'Failed', color: 'bg-red-500' }
                                ].map(t => (
                                    <div key={t.name} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${t.color}`} />
                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <GenericReplyChart data={stats.performanceHistory} />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-4 sm:gap-8">
                {/* Template Usage Breakdown */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-fuchsia-500" />
                                Template Usage
                            </h3>
                        </div>
                        <div className="space-y-6">
                            {Object.entries(stats.templatesUsed).map(([template, count]) => (
                                <div key={template} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-fuchsia-500 transition-colors">{template}</span>
                                        <span className="text-xs font-mono font-bold text-zinc-500">{count} uses</span>
                                    </div>
                                    <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / maxTemplateCount) * 100}%` }}
                                            transition={{ delay: 0.5, duration: 1, ease: 'circOut' }}
                                            className="h-full bg-fuchsia-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-fuchsia-500" />
                                Recent Acknowledgments
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {recentActivity.map((activity, idx) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + idx * 0.05 }}
                                    className="flex gap-4 p-4 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 transition-all group/item"
                                >
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-500 uppercase tracking-widest bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2 py-0.5 border border-fuchsia-200 dark:border-fuchsia-500/20">
                                                {activity.template}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-medium">{activity.time}</span>
                                        </div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 line-clamp-1 group-hover/item:text-fuchsia-600 dark:group-hover/item:text-fuchsia-400 transition-colors">{activity.subject}</p>
                                        <p className="text-xs text-zinc-500 font-medium line-clamp-1">To: {activity.recipient}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
