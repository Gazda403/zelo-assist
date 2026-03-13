'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, 
    ArrowRight, 
    CheckCircle2, 
    XCircle, 
    Zap, 
    MessageSquare,
    ChevronRight,
    Search,
    Calendar,
    Target,
    Users
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { getFollowUpDashboardDataAction } from '@/app/actions/follow-up-dashboard';
import { updateBotAction } from '@/app/actions/bots';
import type { EmailBot } from '@/lib/bots/types';
import { toast } from 'sonner';

const FollowUpChart = dynamic(
    () => import('./charts/FollowUpChart'),
    { ssr: false }
);

interface FollowUpBotDashboardProps {
    bot: EmailBot;
    onBotUpdated: (bot: EmailBot) => void;
}

interface DashboardStats {
    activeFollowUps: number;
    completedFollowUps: number;
    replyRate: number;
    avgStepsToReply: number;
    conversionRate: number;
    timeSaved: number;
    performanceHistory: any[];
    upcomingFollowUps: any[];
}

export function FollowUpBotDashboard({ bot, onBotUpdated }: FollowUpBotDashboardProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        activeFollowUps: 0,
        completedFollowUps: 0,
        replyRate: 0,
        avgStepsToReply: 0,
        conversionRate: 0,
        timeSaved: 0,
        performanceHistory: [],
        upcomingFollowUps: [],
    });

    const fetchData = async () => {
        try {
            const data = await getFollowUpDashboardDataAction(bot.id);
            setStats({
                activeFollowUps: data.activeFollowUps,
                completedFollowUps: data.completedFollowUps,
                replyRate: data.replyRate,
                avgStepsToReply: data.avgStepsToReply,
                conversionRate: data.conversionRate,
                timeSaved: data.timeSaved,
                performanceHistory: data.performanceHistory,
                upcomingFollowUps: data.upcomingFollowUps,
            });
        } catch (error) {
            console.error('Failed to fetch follow-up dashboard data:', error);
            toast.error('Failed to sync sequence metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [bot.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Sequence Engine</p>
                            <h4 className="text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Persistence Alpha</h4>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Active Sequences', value: stats.activeFollowUps, sub: `${stats.completedFollowUps} recently closed`, icon: Target, color: 'text-indigo-500' },
                                { label: 'Reply Velocity', value: `${stats.replyRate}%`, sub: 'Avg conversion response', icon: Zap, color: 'text-orange-500' },
                                { label: 'Steps to Close', value: stats.avgStepsToReply, sub: 'Persistence depth index', icon: MessageSquare, color: 'text-emerald-500' }
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
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Flow Tracking</span>
                                </div>
                            </div>
                            <div className="flex gap-6">
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
                {/* Upcoming Actions */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl transition-colors"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    Pending Dispatches
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium uppercase tracking-widest">Next 24 Hours Schedule</p>
                            </div>
                            <div className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold tracking-widest gap-2 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                AGENT READY
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                            {stats.upcomingFollowUps.length === 0 ? (
                                <div className="text-center py-20 text-zinc-400 dark:text-zinc-600 text-sm font-medium italic">
                                    No pending dispatch events detected in the current stack.
                                </div>
                            ) : (
                                stats.upcomingFollowUps.map((action, idx) => (
                                    <motion.div
                                        key={action.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                        className="flex items-center justify-between p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/5 transition-colors">
                                                <Users className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{action.recipient}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest">STEP {action.step}</span>
                                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                    <span className="text-[10px] text-zinc-500 font-medium">Attempting in {action.dueIn}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 border border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 hover:border-indigo-500/30 transition-all">
                                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Performance Delta / Summary */}
                <div className="col-span-12 lg:col-span-5 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl relative overflow-hidden transition-colors"
                    >
                        <div className="absolute bottom-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                            <Zap className="w-40 h-40 text-indigo-500" />
                        </div>

                        <h3 className="font-serif font-bold text-2xl text-zinc-900 dark:text-zinc-50 mb-8 flex items-center gap-3">
                            <ArrowRight className="w-5 h-5 text-indigo-500" />
                            Efficiency Matrix
                        </h3>

                        <div className="space-y-8 relative z-10">
                            {[
                                { label: 'Automated Response Yield', value: `${stats.conversionRate}%`, color: 'bg-emerald-500' },
                                { label: 'System Resource Leverage', value: '88%', color: 'bg-indigo-500' },
                                { label: 'Noise Rejection Profile', value: '94%', color: 'bg-orange-500' }
                            ].map((row) => (
                                <div key={row.label}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{row.label}</span>
                                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{row.value}</span>
                                    </div>
                                    <div className="h-1 bg-zinc-200 dark:bg-zinc-800 w-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: row.value }}
                                            transition={{ duration: 1, delay: 0.8 }}
                                            className={`h-full ${row.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group cursor-default">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Time Reclaimed Alpha</span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">{stats.timeSaved}h</span>
                                <span className="text-[10px] font-medium text-zinc-500 italic">Weekly human bandwidth saved</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

