'use client';

import { apiErrorMessage } from '@/lib/api';
import { formatBDT, formatZone } from '@/lib/format';
import { rideSchema, RideValues } from '@/schemas/ride.schema';
import { RideInput, rideService } from '@/services/ride.service';
import { DhakaZone, FareEstimate } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BadgePercent, LoaderCircle, MapPin, Navigation, UsersRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const ZONES: DhakaZone[] = ['BANANI','GULSHAN_1','GULSHAN_2','MOHAKHALI','DHANMONDI','MIRPUR','UTTARA','FARMGATE','BASHUNDHARA'];

export function RideRequestForm() {
  const router = useRouter();
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [busy, setBusy] = useState<'estimate' | 'request' | null>(null);
  const form = useForm<RideValues>({ resolver: zodResolver(rideSchema), defaultValues: { pickupZone: 'BANANI', destinationZone: 'MOHAKHALI', requestedSeats: 1 } });

  const input = (values: RideValues): RideInput => ({ ...values, pickupZone: values.pickupZone as DhakaZone, destinationZone: values.destinationZone as DhakaZone });
  const estimateFare = async (values: RideValues) => {
    setBusy('estimate');
    try { setEstimate(await rideService.estimate(input(values))); }
    catch (error) { toast.error(apiErrorMessage(error)); }
    finally { setBusy(null); }
  };
  const requestRide = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setBusy('request');
    try {
      const ride = await rideService.create(input(form.getValues()));
      toast.success(ride.status === 'MATCHED' ? 'Seat matched — Bullet is on the board.' : 'Request saved. Waiting for an online Tesla.');
      router.push('/passenger/rides');
    } catch (error) { toast.error(apiErrorMessage(error)); }
    finally { setBusy(null); }
  };

  return (
    <div className="request-grid">
      <form className="panel route-form" onSubmit={form.handleSubmit(estimateFare)}>
        <div className="panel-heading"><div><span className="eyebrow">Plan a shared ride</span><h2>Where are you going?</h2></div><Navigation /></div>
        <div className="route-line">
          <label><span><MapPin size={15} /> Pickup zone</span><select {...form.register('pickupZone')} onChange={(event) => { form.setValue('pickupZone', event.target.value); setEstimate(null); }}>{ZONES.map((zone) => <option key={zone} value={zone}>{formatZone(zone)}</option>)}</select></label>
          <div className="route-dots" aria-hidden="true"><i /><i /><i /></div>
          <label><span><Navigation size={15} /> Destination</span><select {...form.register('destinationZone')} onChange={(event) => { form.setValue('destinationZone', event.target.value); setEstimate(null); }}>{ZONES.map((zone) => <option key={zone} value={zone}>{formatZone(zone)}</option>)}</select><small>{form.formState.errors.destinationZone?.message}</small></label>
        </div>
        <label><span><UsersRound size={15} /> Seats</span><select {...form.register('requestedSeats', { valueAsNumber: true })} onChange={(event) => { form.setValue('requestedSeats', Number(event.target.value)); setEstimate(null); }}><option value="1">1 seat</option><option value="2">2 seats</option><option value="3">3 seats</option></select></label>
        <button className="button button-secondary button-wide" disabled={busy !== null}>{busy === 'estimate' ? <LoaderCircle className="animate-spin" size={18} /> : 'Calculate fare'}</button>
      </form>
      <section className="fare-card">
        <div className="fare-glow" />
        <span className="icon-bubble dark"><BadgePercent size={21} /></span>
        <span className="eyebrow light">Your pooled estimate</span>
        {estimate ? <>
          <strong className="fare-total">{formatBDT(estimate.estimatedFarePoisha)}</strong>
          <p>{estimate.distanceKm} km estimated route · your fare stays private</p>
          <dl><div><dt>Base fare</dt><dd>{formatBDT(estimate.baseFarePoisha)}</dd></div><div><dt>Distance</dt><dd>{formatBDT(estimate.distanceChargePoisha)}</dd></div><div className="discount"><dt>Pool discount · 20%</dt><dd>− {formatBDT(estimate.poolDiscountPoisha)}</dd></div></dl>
          <button type="button" className="button button-light button-wide" onClick={requestRide} disabled={busy !== null}>{busy === 'request' ? <LoaderCircle className="animate-spin" size={18} /> : <>Claim this seat <ArrowRight size={18} /></>}</button>
        </> : <div className="fare-placeholder"><strong>Transparent. Shared. Fair.</strong><p>Select your route and calculate an estimate. All fares use fixed zone distances and integer poisha.</p></div>}
      </section>
    </div>
  );
}
