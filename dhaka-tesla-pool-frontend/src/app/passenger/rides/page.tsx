'use client';
import { AppShell } from '@/components/app-shell';
import { LoadingState } from '@/components/loading-state';
import { RidesList } from '@/features/rides/components/rides-list';
import { useProtectedRoute } from '@/hooks/use-protected-route';
export default function Page() { const { user, loading } = useProtectedRoute('PASSENGER'); if (loading || !user) return <LoadingState />; return <AppShell><header className="page-header"><div><span className="eyebrow">Your journeys</span><h1>My rides</h1><p>Current status, private fare, and valid ride actions.</p></div></header><RidesList /></AppShell>; }

