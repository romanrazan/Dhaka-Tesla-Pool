import { api } from '@/lib/api';
import { AvailableRideRequest, DriverDashboardSummary, Manifest, Pool } from '@/types';
export const poolService = {
  active: async () => (await api.get<Pool | null>('/driver/pools/active')).data,
  manifest: async (id: string) => (await api.get<Manifest>(`/pools/${id}/passengers`)).data,
  requests: async () => (await api.get<AvailableRideRequest[]>('/driver/requests')).data,
  acceptRequest: async (id: string) =>
    (await api.post<Pool>(`/driver/requests/${id}/accept`)).data,
  transition: async (id: string, action: 'accept' | 'arrived' | 'start' | 'complete') =>
    (await api.request<Pool>({ method: action === 'accept' ? 'POST' : 'PATCH', url: `/pools/${id}/${action}` })).data,
  history: async () => (await api.get<Pool[]>('/driver/history')).data,
  dashboardSummary: async () => (await api.get<DriverDashboardSummary>('/driver/dashboard/summary')).data,
};

