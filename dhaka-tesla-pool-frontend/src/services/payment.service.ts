import { api } from '@/lib/api';
export const paymentService = {
  create: async (rideRequestId: string, method: 'CASH' | 'TESLA_PAY') =>
    (await api.post('/payments', { rideRequestId, method })).data,
  mine: async () => (await api.get('/payments/my')).data,
};

