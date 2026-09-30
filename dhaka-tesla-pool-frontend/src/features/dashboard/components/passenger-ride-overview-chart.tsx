'use client';

import { PassengerDashboardSummary } from '@/types';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORIES = [
  { name: 'Completed', key: 'completedRides', color: '#209b6c' },
  { name: 'Active', key: 'activeRides', color: '#348de2' },
  { name: 'Cancelled', key: 'cancelledRides', color: '#f35e60' },
] as const;

export function PassengerRideOverviewChart({ summary }: { summary: PassengerDashboardSummary }) {
  const data = CATEGORIES.map(({ name, key, color }) => ({ name, value: summary[key], color }));
  return <div className="ride-overview-content">
    <div className="donut-wrap" role="img" aria-label={`Ride overview: ${data.map((item) => `${item.name} ${item.value}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="95%" stroke="none" isAnimationActive={false}>
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} rides`, name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>{summary.totalRides}</strong><span>Total rides</span></div>
    </div>
    <div className="ride-overview-legend">
      {data.map((item) => <div key={item.name} className="ride-overview-legend-row">
        <span className="legend-name"><i style={{ backgroundColor: item.color }} />{item.name}</span>
        <strong>{item.value}</strong>
        <span>{summary.totalRides ? `${((item.value / summary.totalRides) * 100).toFixed(1)}%` : '0.0%'}</span>
      </div>)}
    </div>
  </div>;
}
