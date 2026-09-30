'use client';

import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/cn';
import { CarFront, Clock3, Gauge, LogOut, Plus, Route, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const passenger = user?.role === 'PASSENGER';
  const links = passenger
    ? [
        { href: '/passenger/dashboard', label: 'Overview', icon: Gauge },
        { href: '/passenger/request-ride', label: 'Request ride', icon: Plus },
        { href: '/passenger/rides', label: 'My rides', icon: Route },
        { href: '/passenger/history', label: 'History', icon: Clock3 },
      ]
    : [
        { href: '/driver/dashboard', label: 'Driver desk', icon: Gauge },
        { href: '/driver/history', label: 'Ride history', icon: Clock3 },
      ];
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href={passenger ? '/passenger/dashboard' : '/driver/dashboard'}>
          <span className="brand-mark"><Zap size={20} fill="currentColor" /></span>
          <span><strong>Dhaka Tesla</strong><small>POOL</small></span>
        </Link>
        <nav>{links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn('nav-link', pathname === href && 'nav-active')}>
            <Icon size={18} />{label}
          </Link>
        ))}</nav>
        <div className="sidebar-foot">
          <div className="avatar">{user?.name?.[0] ?? <CarFront size={16} />}</div>
          <div className="user-mini"><strong>{user?.name}</strong><span>{user?.role.toLowerCase()}</span></div>
          <button onClick={logout} aria-label="Log out"><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}

