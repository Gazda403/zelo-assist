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

interface GenericReplyChartProps {
  data: any[];
}

export default function GenericReplyChart({ data }: GenericReplyChartProps) {
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
          <linearGradient id="colorReply" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis 
          dataKey="time" 
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#d946ef' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#d946ef"
          fillOpacity={1}
          fill="url(#colorReply)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
