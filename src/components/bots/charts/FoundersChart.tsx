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

interface FoundersChartProps {
  data: any[];
}

export default function FoundersChart({ data }: FoundersChartProps) {
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
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
        <XAxis 
          dataKey="name" 
          stroke="#52525b" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#71717a' }}
        />
        <YAxis 
          stroke="#52525b" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#71717a' }}
        />
        <Tooltip
          cursor={{ fill: '#27272a', opacity: 0.4 }}
          contentStyle={{
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '0px',
            fontSize: '12px',
            color: '#fff'
          }}
          itemStyle={{ color: '#f97316' }}
        />
        <Bar 
            dataKey="productivity" 
            radius={[0, 0, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
                key={`cell-${index}`} 
                fill={entry.productivity > 70 ? '#f97316' : '#52525b'} 
                fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
