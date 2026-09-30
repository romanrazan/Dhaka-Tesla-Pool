'use client';
import { AppShell } from '@/components/app-shell';
import { LoadingState } from '@/components/loading-state';
import { RideRequestForm } from '@/features/rides/components/ride-request-form';
import { useProtectedRoute } from '@/hooks/use-protected-route';
export default function Page() { const { user, loading } = useProtectedRoute('PASSENGER'); if (loading || !user) return <LoadingState />; return <AppShell><header className="page-header"><div><span className="eyebrow">New journey</span><h1>Find your seat.</h1><p>Choose two Dhaka zones. We’ll handle compatibility and capacity.</p></div></header><RideRequestForm /></AppShell>; }

