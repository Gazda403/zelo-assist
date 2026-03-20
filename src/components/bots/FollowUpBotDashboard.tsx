'use client';

import { useState, useEffect } from 'react';
import {
    MessageCircle,
    Clock,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Activity,
    Send,
    Shield,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getFollowUpDashboardDataAction } from '@/app/actions/follow-up-dashboard';
import { updateBotAction } from '@/app/actions/bots';
import { FollowUpConfig } from './FollowUpConfig';
import { toast } from 'sonner';
import type { EmailBot } from '@/lib/bots/types';
const FollowUpChart = dynamic(
    () => import('./charts/FollowUpChart'),
    { ssr: false }
);

interface FollowUpBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
    onDelete: () => void;
    isDeleting: boolean;
}

interface DashboardStats {
    monitoredThreads: number;
    followUpsSent: number;
    successRate: number;
    avgResponseTime: number;
    escalations: number;
    performanceHistory: any[];
}

export function FollowUpBotDashboard({ bot, onBotUpdated, onDelete, isDeleting }: FollowUpBotDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        monitoredThreads: 0,
        followUpsSent: 0,
        successRate: 0,
        avgResponseTime: 0,
        escalations: 0,
        performanceHistory: [],
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const data = await getFollowUpDashboardDataAction(bot.id);
            setStats({
                monitoredThreads: data.monitoredThreads,
                followUpsSent: data.followUpsSent,
                successRate: data.successRate,
                avgResponseTime: data.avgResponseTime,
                escalations: data.escalations,
                performanceHistory: data.performanceHistory,
            });
            setRecentActivity(data.recentActivity);
        } catch (error) {
            console.error('Failed to fetch Follow-Up dashboard data:', error);
            toast.error('Failed to sync follow-up metrics');
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 rounded-none font-sans mt-4 transition-colors">
            {/* Premium Stats Visualization Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors"
            >
                <div className="grid grid-cols-12 divide-x divide-zinc-200 dark:divide-zinc-800">
                    {/* Left: Key Metrics Overview */}
                    <div className="col-span-12 lg:col-span-4 p-8 space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Continuity Engine</p>
                            <h4 className="text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Active Threads</h4>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Monitored Threads', value: stats.monitoredThreads, sub: 'Currently tracking', icon: Activity, color: 'text-indigo-500' },
                                { label: 'Follow-Ups Sent', value: stats.followUpsSent, sub: 'Automated nudges', icon: Send, color: 'text-blue-500' },
                                { label: 'Success Rate', value: `${stats.successRate}%`, sub: 'Replied to follow-up', icon: TrendingUp, color: 'text-emerald-500' }
                            ].map((item) => (
                                <div key={item.label} className="group cursor-default">
                                    <div className="flex items-center gap-3 mb-1">
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">{item.value}</span>
                                        <span className="text-[10px] font-medium text-zinc-500 italic">{item.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Interactive Visual Analytics */}
                    <div className="col-span-12 lg:col-span-8 p-8 bg-zinc-50/50 dark:bg-zinc-950/20 relative">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-0 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Campaign Metrics</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 xl:gap-6">
                                {[
                                    { name: 'Sent', color: 'bg-indigo-500' },
                                    { name: 'Replied', color: 'bg-emerald-500' },
                                    { name: 'Failed', color: 'bg-rose-500' }
                                ].map(t => (
                                    <div key={t.name} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${t.color}`} />
                                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">{t.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <FollowUpChart data={stats.performanceHistory} />
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Response Time */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Response Time Distribution
                            </h3>
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: 'Same Day', value: '42%', color: 'from-indigo-500 to-indigo-400', endColor: 'text-indigo-500' },
                                { name: '1-3 Days', value: '35%', color: 'from-blue-500 to-blue-400', endColor: 'text-blue-500' },
                                { name: '4-7 Days', value: '18%', color: 'from-emerald-500 to-emerald-400', endColor: 'text-emerald-500' },
                                { name: '7+ Days (Escalated)', value: '5%', color: 'from-rose-500 to-rose-400', endColor: 'text-rose-500' }
                            ].map((item, i) => (
                                <div key={item.name} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-500 transition-colors">{item.name}</span>
                                        <span className={`text-xs font-mono font-bold ${item.endColor}`}>{item.value}</span>
                                    </div>
                                    <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: item.value }}
                                            transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: 'circOut' }}
                                            className={`h-full bg-gradient-to-r ${item.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Recent Follow-Ups */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl transition-colors h-full"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif font-bold text-xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Recent Follow-Ups
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {recentActivity.map((activity, idx) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                    className="flex items-center justify-between p-4 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 transition-all group/item gap-4"
                                >
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 border border-indigo-200 dark:border-indigo-500/20">
                                                {activity.daysWaited}d wait
                                            </span>
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-medium">{activity.time}</span>
                                        </div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 line-clamp-1 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{activity.subject}</p>
                                        <p className="text-xs text-zinc-500 font-medium line-clamp-1">To: {activity.recipient}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {activity.status === 'replied' && (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 border border-emerald-200 dark:border-emerald-500/20">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Replied
                                            </span>
                                        )}
                                        {activity.status === 'sent' && (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 border border-indigo-200 dark:border-indigo-500/20">
                                                <Send className="w-3.5 h-3.5" />
                                                Sent
                                            </span>
                                        )}
                                        {activity.status === 'escalated' && (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 border border-rose-200 dark:border-rose-500/20">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Escalated
                                            </span>
                                        )}
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
