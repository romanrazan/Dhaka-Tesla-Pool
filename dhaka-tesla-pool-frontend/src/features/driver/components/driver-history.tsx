'use client';
import { AppShell } from '@/components/app-shell';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { StatusPill } from '@/components/status-pill';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { apiErrorMessage } from '@/lib/api';
import { formatZone } from '@/lib/format';
import { poolService } from '@/services/pool.service';
import { Pool } from '@/types';
import { CarFront } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function DriverHistory() {
  const { user, loading: authLoading } = useProtectedRoute('DRIVER');
  const [items, setItems] = useState<Pool[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (user) poolService.history().then(setItems).catch((error) => toast.error(apiErrorMessage(error))).finally(() => setLoading(false)); }, [user]);
  if (authLoading || !user || loading) return <LoadingState label="Loading driver history…" />;
  return <AppShell><header className="page-header"><div><span className="eyebrow">Completed work</span><h1>Ride history</h1><p>Every completed or cancelled Bullet pool.</p></div></header>{!items.length ? <EmptyState title="No completed pools" text="Completed trips will settle here." /> : <div className="ride-list">{items.map((pool) => <article className="ride-row" key={pool.id}><div className="ride-icon"><CarFront size={20} /></div><div className="ride-route"><strong>{formatZone(pool.corridor)}</strong><span>{pool.occupiedSeats} occupied seats · capacity {pool.capacity}</span></div><StatusPill status={pool.status} /></article>)}</div>}</AppShell>;
}

