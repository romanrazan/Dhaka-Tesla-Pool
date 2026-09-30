import { api } from '@/lib/api';
import { HistoryItem } from '@/types';
export const historyService = {
  mine: async () => (await api.get<HistoryItem[]>('/ride-history/my')).data,
};

