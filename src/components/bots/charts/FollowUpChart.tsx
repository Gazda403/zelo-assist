'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface FollowUpChartProps {
  data: any[];
}

export default function FollowUpChart({ data }: FollowUpChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorFollow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis 
          dataKey="name" 
          stroke="#52525b" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#52525b" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#8b5cf6' }}
        />
        <Area
          type="monotone"
          dataKey="conversion"
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorFollow)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
