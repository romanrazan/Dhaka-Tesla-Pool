'use client';

import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { StatusPill } from '@/components/status-pill';
import { DriverDailyRidesChart } from '@/features/dashboard/components/driver-daily-rides-chart';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { apiErrorMessage } from '@/lib/api';
import { formatDate, formatZone } from '@/lib/format';
import { poolService } from '@/services/pool.service';
import { vehicleService } from '@/services/vehicle.service';
import { AvailableRideRequest, DriverDashboardSummary, Manifest, Pool, Vehicle } from '@/types';
import { Armchair, CalendarDays, CarFront, ChartNoAxesColumn, CirclePower, Gauge, LoaderCircle, MapPin, Play, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const NEXT_ACTION: Partial<Record<Pool['status'], { label: string; action: 'accept' | 'arrived' | 'start' | 'complete'; icon: typeof Play }>> = {
  MATCHING: { label: 'Accept this pool', action: 'accept', icon: Play },
  ACCEPTED: { label: 'Mark driver arrived', action: 'arrived', icon: MapPin },
  DRIVER_ARRIVED: { label: 'Start the ride', action: 'start', icon: Play },
  STARTED: { label: 'Complete ride', action: 'complete', icon: Gauge },
};

export function DriverDashboard() {
  const { user, loading: authLoading } = useProtectedRoute('DRIVER');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [pool, setPool] = useState<Pool | null>(null);
  const [manifest, setManifest] = useState<Manifest>({ passengers: [] });
  const [requests, setRequests] = useState<AvailableRideRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(false);
  const [performance, setPerformance] = useState<DriverDashboardSummary | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const loadRequests = useCallback(async () => {
    try {
      setRequests(await poolService.requests());
      setRequestsError(false);
    } catch {
      setRequestsError(true);
    } finally {
      setRequestsLoading(false);
    }
  }, []);
  const loadPerformance = useCallback(async () => {
    try {
      setPerformance(await poolService.dashboardSummary());
      setPerformanceError(false);
    } catch {
      setPerformanceError(true);
    } finally {
      setPerformanceLoading(false);
    }
  }, []);
  const load = useCallback(async () => {
    const requestsPromise = loadRequests();
    const performancePromise = loadPerformance();
    try {
      const [myVehicle, active] = await Promise.all([vehicleService.mine(), poolService.active()]);
      setVehicle(myVehicle); setPool(active);
      setManifest(active ? await poolService.manifest(active.id) : { passengers: [] });
    } catch (error) { toast.error(apiErrorMessage(error)); }
    finally { setLoading(false); }
    await requestsPromise;
    await performancePromise;
  }, [loadRequests, loadPerformance]);
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => void load(), 0);
    const refresh = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 10000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(refresh);
    };
  }, [user, load]);
  if (authLoading || !user || loading) return <LoadingState label="Preparing the driver desk…" />;
  const toggle = async () => { if (!vehicle) return; setBusy(true); try { setVehicle(await vehicleService.setOnline(!vehicle.isOnline)); await load(); toast.success(`Bullet is now ${vehicle.isOnline ? 'offline' : 'online'}`); } catch (error) { toast.error(apiErrorMessage(error)); } finally { setBusy(false); } };
  const advance = async () => { if (!pool) return; const next = NEXT_ACTION[pool.status]; if (!next) return; setBusy(true); try { await poolService.transition(pool.id, next.action); toast.success('Pool status updated'); await load(); } catch (error) { toast.error(apiErrorMessage(error)); } finally { setBusy(false); } };
  const accept = async (id: string) => {
    setAcceptingId(id);
    try {
      await poolService.acceptRequest(id);
      await load();
      toast.success('Ride request accepted');
    } catch (error) {
      toast.error(apiErrorMessage(error));
      await load();
    } finally {
      setAcceptingId(null);
    }
  };
  const next = pool ? NEXT_ACTION[pool.status] : undefined;
  const ActionIcon = next?.icon;
  return <AppShell><header className="page-header"><div><span className="eyebrow">Driver command</span><h1>Ready, {user.name}?</h1><p>Bullet’s live seat board and ride controls.</p></div><button className={`button ${vehicle?.isOnline ? 'button-secondary' : 'button-primary'}`} onClick={toggle} disabled={busy}><CirclePower size={18} /> {vehicle?.isOnline ? 'Go offline' : 'Go online'}</button></header>
    <section className="driver-grid"><article className="vehicle-card"><div className="vehicle-visual"><CarFront size={54} /><span className={vehicle?.isOnline ? 'live-dot' : 'offline-dot'} /></div><div><span className="eyebrow">Your Tesla</span><h2>{vehicle?.name}</h2><p>{vehicle?.registrationNumber}</p></div><div className="capacity-meter"><div><Armchair size={18} /><span>{pool?.occupiedSeats ?? 0} occupied</span></div><div className="seat-bar">{Array.from({ length: vehicle?.capacity ?? 0 }).map((_, i) => <i key={i} className={i < (pool?.occupiedSeats ?? 0) ? 'filled' : ''} />)}</div><small>{vehicle ? Math.max(0, vehicle.capacity - (pool?.occupiedSeats ?? 0)) : '—'} seats available</small></div></article>
      <article className="panel pool-control"><div className="panel-heading"><div><span className="eyebrow">Active pool</span><h2>{pool ? formatZone(pool.corridor) : 'No active route'}</h2></div>{pool && <StatusPill status={pool.status} />}</div>{pool ? <><div className="manifest"><div className="manifest-head"><UsersRound size={18} /><strong>Passenger manifest</strong><span>{manifest.passengers.length} riders</span></div>{manifest.passengers.map((passenger) => <div className="manifest-row" key={passenger.passengerId}><span className="avatar small">{passenger.name[0]}</span><div><strong>{passenger.name}</strong><small>{formatZone(passenger.pickupZone)} → {formatZone(passenger.destinationZone)}</small></div><span>{passenger.seatsBooked} seat</span></div>)}</div>{next && ActionIcon && <button className="button button-primary button-wide" onClick={advance} disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={18} /> : <><ActionIcon size={18} />{next.label}</>}</button>}</> : <EmptyState title="Bullet is waiting" text={vehicle?.isOnline ? 'Choose a request below to start a pool.' : 'Go online to receive passenger requests.'} />}</article>
    </section>
    <section className="stat-grid dashboard-stats driver-stats" aria-label="Driver performance">
      <article><span className="stat-icon mint"><ChartNoAxesColumn /></span><div><small>Today&apos;s rides</small><strong>{performanceLoading ? '—' : performanceError ? '—' : performance?.todayRides ?? 0}</strong></div></article>
      <article><span className="stat-icon blue"><CalendarDays /></span><div><small>Total completed</small><strong>{performanceLoading ? '—' : performanceError ? '—' : performance?.totalCompleted ?? 0}</strong></div></article>
      <article><span className="stat-icon blue"><UsersRound /></span><div><small>Passengers served</small><strong>{performanceLoading ? '—' : performanceError ? '—' : performance?.passengersServed ?? 0}</strong></div></article>
    </section>
    <section className="driver-insights section-block">
      <article className="panel dashboard-panel"><div className="dashboard-panel-title"><span className="eyebrow">Daily rides — last 7 days</span><p>Completed rides per day.</p></div>
        {performanceLoading ? <LoadingState label="Loading driver performance…" /> : performanceError ? <EmptyState title="Could not load driver performance." text="Please try again." action={<button className="button button-primary" onClick={() => { setPerformanceLoading(true); void loadPerformance(); }}>Try Again</button>} /> : performance && performance.dailyRides.some((day) => day.rides > 0) ? <DriverDailyRidesChart days={performance.dailyRides} /> : <EmptyState title="No completed rides in the last 7 days." text="Your completed trips will appear here." />}
      </article>
      <article className="panel dashboard-panel"><div className="dashboard-panel-title"><span className="eyebrow">Available ride requests</span><p>Waiting passengers you can accept.</p></div>
        {requestsLoading ? <LoadingState label="Loading ride requests..." /> : requestsError ? <EmptyState title="Could not load ride requests." text="Please try again." action={<button className="button button-primary" onClick={() => { setRequestsLoading(true); void loadRequests(); }}>Try Again</button>} /> : requests.length === 0 ? <EmptyState title="No ride requests available right now." text="New passenger requests will appear here." /> : <div className="dashboard-requests">{requests.map((request) => <article className="dashboard-request-row" key={request.id}><span className="request-avatar">{request.passengerName[0]}</span><div className="ride-route"><strong>{request.passengerName}</strong><span>{formatZone(request.pickupZone)} → {formatZone(request.destinationZone)}</span><span>{request.requestedSeats} seat{request.requestedSeats > 1 ? 's' : ''} · {formatDate(request.createdAt)}</span>{request.unavailableReason && <span>{request.unavailableReason}</span>}</div><button className="button button-primary" onClick={() => void accept(request.id)} disabled={busy || acceptingId !== null || !request.canAccept}>{acceptingId === request.id ? <LoaderCircle className="animate-spin" size={18} /> : 'Accept'}</button></article>)}</div>}
      </article>
    </section>
  </AppShell>;
}
