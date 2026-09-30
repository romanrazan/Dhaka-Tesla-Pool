import { api } from '@/lib/api';
import { Vehicle } from '@/types';
export const vehicleService = {
  mine: async () => (await api.get<Vehicle>('/vehicles/me')).data,
  setOnline: async (online: boolean) =>
    (await api.patch<Vehicle>(`/vehicles/me/${online ? 'online' : 'offline'}`)).data,
};

