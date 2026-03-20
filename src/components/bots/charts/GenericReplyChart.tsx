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

interface GenericReplyChartProps {
    data: {
        date: string;
        success: number;
        failed: number;
    }[];
}

/**
 * GenericReplyChart Component
 * Responsible for rendering the acknowledgment performance bar chart.
 * Encapsulated to avoid Recharts styling issues in a Next.js environment.
 */
export default function GenericReplyChart({ data }: GenericReplyChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                barSize={32}
            >
                <defs>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#d946ef" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="0" dy="4" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
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
                <YAxis hide domain={[0, 'auto']} allowDecimals={false} />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-2xl backdrop-blur-md">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">{payload[0].payload.date}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-[10px] font-bold text-fuchsia-500 uppercase">Successful</span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[0].value}</span>
                                        </div>
                                        {payload.length > 1 && (
                                            <div className="flex justify-between gap-4">
                                                <span className="text-[10px] font-bold text-red-500 uppercase">Failed</span>
                                                <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[1].value}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                    dataKey="success"
                    stackId="a"
                    fill="url(#successGradient)"
                    filter="url(#shadow)"
                    minPointSize={2}
                />
                <Bar
                    dataKey="failed"
                    stackId="a"
                    fill="url(#failedGradient)"
                    filter="url(#shadow)"
                    minPointSize={2}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
