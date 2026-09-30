import { cn } from '@/lib/cn';
export function StatusPill({ status }: { status: string }) {
  const done = status === 'COMPLETED';
  const danger = status === 'CANCELLED';
  const active = ['ACCEPTED', 'DRIVER_ARRIVED', 'STARTED'].includes(status);
  return <span className={cn('status-pill', done && 'status-done', danger && 'status-danger', active && 'status-active')}>{status.replaceAll('_', ' ')}</span>;
}

