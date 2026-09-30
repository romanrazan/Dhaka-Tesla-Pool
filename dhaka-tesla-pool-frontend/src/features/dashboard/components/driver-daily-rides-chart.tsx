'use client';

import { DriverDashboardSummary } from '@/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function DriverDailyRidesChart({ days }: { days: DriverDashboardSummary['dailyRides'] }) {
  return <div className="daily-chart" role="img" aria-label={`Completed pools: ${days.map((day) => `${day.date}: ${day.rides}`).join(', ')}`}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={days} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e7ebe5" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64706b', fontSize: 11 }} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64706b', fontSize: 11 }} />
        <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''} formatter={(value) => [`${value} rides`, 'Completed']} />
        <Bar dataKey="rides" fill="#85ca8f" radius={[5, 5, 0, 0]} maxBarSize={38} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
