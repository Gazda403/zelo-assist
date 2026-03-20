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
    Cell,
} from 'recharts';

interface StoreHealthChartProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

/**
 * StoreHealthChart Component
 * Responsible for rendering the store performance bar chart.
 * Encapsulated to avoid Recharts styling issues in a Next.js environment.
 */
export default function StoreHealthChart({ data }: StoreHealthChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                barSize={60}
            >
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
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 shadow-2xl backdrop-blur-md">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-white">{payload[0].value}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="value">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
