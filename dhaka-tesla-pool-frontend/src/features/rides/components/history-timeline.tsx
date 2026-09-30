'use client';

import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { StatusPill } from '@/components/status-pill';
import { formatDate } from '@/lib/format';
import { historyService } from '@/services/history.service';
import { HistoryItem } from '@/types';
import { Clock3 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function HistoryTimeline() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try { setItems(await historyService.mine()); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  if (loading) return <LoadingState label="Loading ride history…" />;
  if (error) return <EmptyState title="Could not load ride history." text="Please try again." action={<button className="button button-primary" onClick={() => void load()}>Try Again</button>} />;
  if (!items.length) return <EmptyState title="No ride history yet." text="Every ride transition will be recorded here." />;
  return <div className="timeline">{items.map((item) => <article key={item.id}><span className="timeline-dot"><Clock3 size={14} /></span><div><StatusPill status={item.newStatus} /><p>{item.previousStatus ? `${item.previousStatus.replaceAll('_', ' ')} → ` : 'Ride created as '}{item.newStatus.replaceAll('_', ' ')}</p><small>{formatDate(item.changedAt)}</small></div></article>)}</div>;
}

