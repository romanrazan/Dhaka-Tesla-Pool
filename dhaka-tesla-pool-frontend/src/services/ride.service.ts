import { api } from '@/lib/api';
import { DhakaZone, FareEstimate, PassengerDashboardSummary, RideRequest } from '@/types';

export interface RideInput { pickupZone: DhakaZone; destinationZone: DhakaZone; requestedSeats: number }
export const rideService = {
  estimate: async (input: RideInput) => (await api.post<FareEstimate>('/fares/estimate', input)).data,
  create: async (input: RideInput) => (await api.post<RideRequest>('/ride-requests', input)).data,
  mine: async () => (await api.get<RideRequest[]>('/ride-requests/my')).data,
  dashboardSummary: async () => (await api.get<PassengerDashboardSummary>('/ride-requests/dashboard/summary')).data,
  cancel: async (id: string) => (await api.patch<RideRequest>(`/ride-requests/${id}/cancel`)).data,
};

