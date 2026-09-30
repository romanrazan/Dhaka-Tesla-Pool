'use client';
import { AppShell } from '@/components/app-shell';
import { LoadingState } from '@/components/loading-state';
import { HistoryTimeline } from '@/features/rides/components/history-timeline';
import { useProtectedRoute } from '@/hooks/use-protected-route';
export default function Page() { const { user, loading } = useProtectedRoute('PASSENGER'); if (loading || !user) return <LoadingState />; return <AppShell><header className="page-header"><div><span className="eyebrow">Audit trail</span><h1>Ride history</h1><p>Every lifecycle transition, preserved in order.</p></div></header><HistoryTimeline /></AppShell>; }

