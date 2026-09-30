import { CarFront } from 'lucide-react';
import { ReactNode } from 'react';
export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="state-card"><span className="icon-bubble"><CarFront size={22} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

