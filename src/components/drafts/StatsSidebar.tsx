'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LucideCalendar, LucideTrendingUp, LucideInfo } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDraftStatsAction } from '@/app/actions/gmail';

export default function StatsSidebar({ emails }: { emails: any[] }) {
    const [isLoading, setIsLoading] = useState(true);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [urgencyData, setUrgencyData] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ avgUrgency: "0.0", draftsCount: 0, unreadCount: 0 });

    useEffect(() => {
        async function loadStats() {
            try {
                const stats = await getDraftStatsAction();
                if (stats) {
                    setDailyData(stats.dailyData);
                    setUrgencyData(stats.urgencyData);
                    setMetrics(stats.metrics);
                }
            } catch (error) {
                console.error("Failed to load draft stats:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadStats();
    }, [emails]);

    const COLORS = ['#e5e7eb', '#a5b4fc', '#818cf8', '#ef4444'];

    if (isLoading) return <div className="h-full flex flex-col items-center justify-center space-y-4 p-4 border-l border-violet-100/50"><div className="w-8 h-8 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" /></div>;

    return (
        <div className="h-full flex flex-col space-y-5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl p-5 border-l border-violet-100/50 dark:border-white/5 overflow-y-auto custom-scrollbar">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-5 border border-violet-100/50 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><LucideCalendar className="w-4 h-4 text-violet-500" /> Inbox Volume</h3></div>
                <div className="h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={dailyData}><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none' }} /><Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} /></BarChart></ResponsiveContainer></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-5 border border-violet-100/50 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><LucideInfo className="w-4 h-4 text-violet-500" /> Urgency Distribution</h3></div>
                <div className="h-40"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={urgencyData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">{urgencyData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            </motion.div>
            <div className="space-y-3 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg"><div className="flex justify-between items-center mb-1"><span className="text-xs font-semibold uppercase">Avg Urgency</span><LucideTrendingUp className="w-4 h-4" /></div><div className="text-3xl font-black">{metrics.avgUrgency}</div></motion.div>
                <div className="bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-4 border border-violet-100/50 shadow-sm flex items-center justify-between"><div className="text-sm font-semibold text-gray-500">Unread</div><div className="text-xl font-bold">{metrics.unreadCount}</div></div>
                <div className="bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-4 border border-violet-100/50 shadow-sm flex items-center justify-between"><div className="text-sm font-semibold text-gray-500">Drafts</div><div className="text-xl font-bold">{metrics.draftsCount}</div></div>
            </div>
        </div>
    );
}
