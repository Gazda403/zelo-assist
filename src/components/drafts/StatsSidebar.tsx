'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { LucideCalendar, LucideTrendingUp, LucideInfo } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDraftStatsAction } from '@/app/actions/gmail';

interface StatsSidebarProps {
    emails: any[];
}

export default function StatsSidebar({ emails }: StatsSidebarProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [urgencyData, setUrgencyData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        avgUrgency: "0.0",
        draftsCount: 0,
        unreadCount: 0,
    });

    useEffect(() => {
        let mounted = true;
        async function loadStats() {
            try {
                const stats = await getDraftStatsAction();
                if (mounted && stats) {
                    setDailyData(stats.dailyData);
                    setUrgencyData(stats.urgencyData);
                    setMetrics(stats.metrics);
                }
            } catch (error) {
                console.error("Failed to load draft stats:", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        loadStats();

        return () => { mounted = false; };
    }, [emails]);

    const COLORS = ['#e5e7eb', '#a5b4fc', '#818cf8', '#ef4444'];

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 bg-gray-50/50 p-4 border-l border-violet-100/50">
                <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500 animate-pulse">Loading insights...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl p-5 border-l border-violet-100/50 dark:border-white/5 overflow-y-auto custom-scrollbar">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
                className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-violet-100/50 dark:border-white/5 p-5 transition-all"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <LucideCalendar className="w-4 h-4 text-violet-500" />
                        Inbox Volume
                    </h3>
                    <span className="text-xs bg-violet-100 text-violet-700 font-medium px-2 py-0.5 rounded-full">
                        Week
                    </span>
                </div>

                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyData}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-violet-100/50 dark:border-white/5 p-5 transition-all"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <LucideInfo className="w-4 h-4 text-violet-500" />
                        Urgency Distribution
                    </h3>
                </div>

                <div className="h-40 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={urgencyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {urgencyData.map((entry, index) => {
                                    let colorIndex = 0;
                                    if (entry.name === 'Medium') colorIndex = 1;
                                    if (entry.name === 'High') colorIndex = 2;
                                    if (entry.name === 'Critical') colorIndex = 3;
                                    if (entry.name === 'No Data') colorIndex = 0;

                                    return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />
                                })}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-gray-200"></span> Low
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-indigo-300"></span> Medium
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span> High
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
                    </div>
                </div>
            </motion.div>

            <div className="space-y-3 pt-2">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-[0_8px_25px_rgba(124,58,237,0.3)] transition-all"
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold tracking-wide opacity-90 uppercase">Avg Urgency</span>
                        <LucideTrendingUp className="w-4 h-4 opacity-90" />
                    </div>
                    <div className="text-3xl font-black tracking-tight">{metrics.avgUrgency}</div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 border border-violet-100/50 dark:border-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] flex items-center justify-between transition-all"
                >
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Unread</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{metrics.unreadCount}</div>
                </motion.div>
            </div>
        </div>
    );
}
