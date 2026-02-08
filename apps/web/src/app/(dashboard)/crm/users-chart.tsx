'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ChartDataPoint {
  date: string;
  users: number;
}

interface UsersChartProps {
  data: ChartDataPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function UsersChart({ data }: UsersChartProps) {

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">Dagelijks actieve gebruikers</h3>
          <p className="text-sm text-gray-500">Laatste 30 dagen</p>
        </div>
        <div className="flex h-64 items-center justify-center text-gray-400">
          <p>Geen data beschikbaar</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    formattedDate: formatDate(point.date),
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Dagelijks actieve gebruikers</h3>
        <p className="text-sm text-gray-500">Laatste 30 dagen</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
              }}
              labelFormatter={(label) => {
                const dataPoint = data.find((d) => formatDate(d.date) === label);
                return dataPoint ? formatDateLong(dataPoint.date) : label;
              }}
              formatter={(value: number | undefined) => [`${value ?? 0} gebruikers`, '']}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#colorUsers)"
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
