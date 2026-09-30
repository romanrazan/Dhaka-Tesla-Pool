'use client';

import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { StatusPill } from '@/components/status-pill';
import { PassengerRideOverviewChart } from '@/features/dashboard/components/passenger-ride-overview-chart';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { formatBDT, formatDate, formatZone } from '@/lib/format';
import { rideService } from '@/services/ride.service';
import { PassengerDashboardSummary } from '@/types';
import { ArrowRight, Armchair, Clock3, MapPinned, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export function PassengerDashboard() {
  const { user, loading: authLoading } = useProtectedRoute('PASSENGER');
  const [summary, setSummary] = useState<PassengerDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSummary(await rideService.dashboardSummary());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [user, load]);

  if (authLoading || !user) return <LoadingState label="Opening your dashboard…" />;

  return <AppShell>
    <header className="page-header"><div><span className="eyebrow">Passenger dashboard</span><h1>Good day, {user.name}.</h1><p>Share the city, not your private fare.</p></div><Link className="button button-primary" href="/passenger/request-ride">Request a ride <ArrowRight size={18} /></Link></header>
    {error ? <section className="panel"><EmptyState title="Could not load ride overview." text="Please try again." action={<button className="button button-primary" onClick={() => void load()}>Try Again</button>} /></section> : <>
      <section className="stat-grid dashboard-stats" aria-label="Ride statistics">
        <article><span className="stat-icon mint"><Armchair /></span><div><small>Total rides</small><strong>{loading ? '—' : summary?.totalRides ?? 0}</strong></div></article>
        <article><span className="stat-icon blue"><Clock3 /></span><div><small>Active rides</small><strong>{loading ? '—' : summary?.activeRides ?? 0}</strong></div></article>
        <article><span className="stat-icon coral"><XCircle /></span><div><small>Cancelled rides</small><strong>{loading ? '—' : summary?.cancelledRides ?? 0}</strong></div></article>
      </section>
      <section className="panel section-block dashboard-panel"><div className="dashboard-panel-title"><span className="eyebrow">My ride overview</span><p>A summary of your ride status.</p></div>
        {loading ? <LoadingState label="Loading ride overview…" /> : summary && summary.totalRides > 0 ? <PassengerRideOverviewChart summary={summary} /> : <EmptyState title="No ride activity yet." text="Your ride overview will appear after your first request." />}
      </section>
      <section className="panel section-block dashboard-panel"><div className="dashboard-panel-title dashboard-title-row"><div><span className="eyebrow">Recent rides</span><p>Your latest journeys.</p></div><Link href="/passenger/rides">View all <ArrowRight size={16} /></Link></div>
        {loading ? <LoadingState label="Loading recent rides…" /> : !summary?.recentRides.length ? <EmptyState title="No recent rides yet." text="Your latest journeys will appear here." /> : <div className="dashboard-ride-list">{summary.recentRides.map((ride) => <article className="dashboard-ride-row" key={ride.id}>
          <span className="ride-icon"><MapPinned size={20} /></span>
          <div className="ride-route"><strong>{formatZone(ride.pickupZone)} <ArrowRight size={14} /> {formatZone(ride.destinationZone)}</strong><span>{formatDate(ride.createdAt)} · {ride.requestedSeats} seat{ride.requestedSeats === 1 ? '' : 's'}</span></div>
          <div className="ride-fare"><strong>{formatBDT(ride.finalFarePoisha ?? ride.estimatedFarePoisha)}</strong><StatusPill status={ride.status} /></div>
        </article>)}</div>}
      </section>
    </>}
  </AppShell>;
}

