'use client';

import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { StatusPill } from '@/components/status-pill';
import { apiErrorMessage } from '@/lib/api';
import { formatBDT, formatDate, formatZone } from '@/lib/format';
import { paymentService } from '@/services/payment.service';
import { rideService } from '@/services/ride.service';
import { RideRequest } from '@/types';
import { ArrowRight, CreditCard, MapPinned, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function RidesList({ compact = false }: { compact?: boolean }) {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try { setRides(await rideService.mine()); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  if (loading) return <LoadingState />;
  if (error) return <EmptyState title="Could not load your rides." text="Please try again." action={<button className="button button-primary" onClick={() => void load()}>Try Again</button>} />;
  const shown = compact ? rides.slice(0, 3) : rides;
  if (!shown.length) return <EmptyState title="No rides found." text="Your shared journeys will appear here." action={<Link className="button button-primary" href="/passenger/request-ride">Request a ride</Link>} />;
  const cancel = async (id: string) => { try { await rideService.cancel(id); toast.success('Ride cancelled'); await load(); } catch (error) { toast.error(apiErrorMessage(error)); } };
  const pay = async (id: string) => { try { await paymentService.create(id, 'TESLA_PAY'); toast.success('TeslaPay payment recorded'); } catch (error) { toast.error(apiErrorMessage(error)); } };
  return <div className="ride-list">{shown.map((ride) => <article className="ride-row" key={ride.id}>
    <div className="ride-icon"><MapPinned size={20} /></div>
    <div className="ride-route"><strong>{formatZone(ride.pickupZone)} <ArrowRight size={14} /> {formatZone(ride.destinationZone)}</strong><span>{formatDate(ride.createdAt)} · {ride.requestedSeats} seat{ride.requestedSeats > 1 ? 's' : ''}</span>{ride.poolAssociation && <span>Shared Pool · Tesla: {ride.poolAssociation.vehicleName} · {formatZone(ride.poolAssociation.status)} · {ride.poolAssociation.bookedSeats} seat{ride.poolAssociation.bookedSeats === 1 ? '' : 's'} booked</span>}</div>
    <div className="ride-fare"><strong>{formatBDT(ride.finalFarePoisha ?? ride.estimatedFarePoisha)}</strong><StatusPill status={ride.status} /></div>
    {!compact && <div className="ride-actions">{['REQUESTED','MATCHED','ACCEPTED'].includes(ride.status) && <button className="icon-button danger" onClick={() => cancel(ride.id)} title="Cancel ride"><X size={17} /></button>}{ride.status === 'COMPLETED' && <button className="icon-button" onClick={() => pay(ride.id)} title="Pay with TeslaPay"><CreditCard size={17} /></button>}</div>}
  </article>)}</div>;
}

