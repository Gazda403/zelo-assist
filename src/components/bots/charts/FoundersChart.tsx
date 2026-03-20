'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface FoundersChartProps {
    data: {
        name: string;
        productivity: number;
        emails: number;
    }[];
}

/**
 * FoundersChart Component
 * Renders a productivity and email volume AreaChart for the Founders Bot.
 */
export default function FoundersChart({ data }: FoundersChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.1} />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                />
                <YAxis hide />
                <Tooltip
                    cursor={{ stroke: '#f97316', strokeWidth: 1 }}
                    content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-2xl backdrop-blur-md">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">{payload[0].payload.name}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-[10px] font-bold text-orange-500 uppercase">Productivity</span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[0].value}%</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase">Emails</span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">{payload[1].value}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="productivity"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorProd)"
                    strokeWidth={3}
                />
                <Area
                    type="monotone"
                    dataKey="emails"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorEmails)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
