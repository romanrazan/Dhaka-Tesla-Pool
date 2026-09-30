import { AuthForm } from '@/features/auth/components/auth-form';
import { Zap } from 'lucide-react';
import Link from 'next/link';
export default function RegisterPage() { return <main className="auth-page"><section className="auth-story register-story"><Link className="brand brand-light" href="/"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span><strong>Dhaka Tesla</strong><small>POOL</small></span></Link><div><span className="eyebrow light">A better route together</span><h2>Three seats.<br />One shared city.</h2><p>Match compatible journeys and keep your price, identity, and ride history under your control.</p></div><blockquote>20% pooled discount · transparent estimates · no surprise seat claims</blockquote></section><section className="auth-form-side"><AuthForm mode="register" /></section></main>; }

