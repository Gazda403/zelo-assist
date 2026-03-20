'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface FollowUpChartProps {
    data: {
        date: string;
        sent: number;
        replied: number;
        failed: number;
    }[];
}

/**
 * FollowUpChart Component
 * Responsible for rendering the follow-up performance bar chart.
 * Encapsulated to avoid Recharts styling issues in a Next.js environment.
 */
export default function FollowUpChart({ data }: FollowUpChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                barSize={24}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.1} />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                    tickFormatter={(str) => {
                        try {
                            const d = new Date(str);
                            if (isNaN(d.getTime())) return str;
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                            return str;
                        }
                    }}
                />
                <YAxis hide />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-2xl backdrop-blur-md">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">{payload[0].payload.date}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Sent</span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[0].value}</span>
                                        </div>
                                        {payload.length > 1 && (
                                            <div className="flex justify-between gap-4">
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Replied</span>
                                                <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[1].value}</span>
                                            </div>
                                        )}
                                        {payload.length > 2 && (
                                            <div className="flex justify-between gap-4">
                                                <span className="text-[10px] font-bold text-rose-500 uppercase">Failed</span>
                                                <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[2].value}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="sent">
                    {data.map((entry, index) => (
                        <Cell key={`cell-sent-${index}`} fill="#6366f1" fillOpacity={0.8} /> // indigo-500
                    ))}
                </Bar>
                <Bar dataKey="replied">
                    {data.map((entry, index) => (
                        <Cell key={`cell-replied-${index}`} fill="#10b981" fillOpacity={0.8} /> // emerald-500
                    ))}
                </Bar>
                <Bar dataKey="failed">
                    {data.map((entry, index) => (
                        <Cell key={`cell-failed-${index}`} fill="#f43f5e" fillOpacity={0.8} /> // rose-500
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
