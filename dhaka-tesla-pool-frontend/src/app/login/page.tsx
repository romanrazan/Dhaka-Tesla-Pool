import { AuthForm } from '@/features/auth/components/auth-form';
import { Zap } from 'lucide-react';
import Link from 'next/link';
export default function LoginPage() { return <main className="auth-page"><section className="auth-story"><Link className="brand brand-light" href="/"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span><strong>Dhaka Tesla</strong><small>POOL</small></span></Link><div><span className="eyebrow light">The city keeps moving</span><h2>Your seat<br />moves with it.</h2><p>Secure access to your rides, live pool, private fare, and complete journey history.</p></div><blockquote>“I spend less, meet the city halfway, and know exactly where my ride stands.”<footer>— Nusrat, Banani</footer></blockquote></section><section className="auth-form-side"><AuthForm mode="login" /></section></main>; }

