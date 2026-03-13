'use client';

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

interface StoreHealthChartProps {
  data: any[];
}

export default function StoreHealthChart({ data }: StoreHealthChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#10b981' }}
        />
        <Bar dataKey="value" fill="#10b981" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.value > 80 ? '#10b981' : entry.value > 50 ? '#f59e0b' : '#ef4444'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
