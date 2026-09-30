import { LoaderCircle } from 'lucide-react';
export function LoadingState({ label = 'Loading your ride…' }: { label?: string }) {
  return <div className="state-card"><LoaderCircle className="animate-spin" size={24} /><p>{label}</p></div>;
}

