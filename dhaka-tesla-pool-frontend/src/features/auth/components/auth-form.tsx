'use client';

import { useAuth } from '@/contexts/auth-context';
import { apiErrorMessage } from '@/lib/api';
import { loginSchema, LoginValues, registerSchema, RegisterValues } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register: registerUser } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', phone: '', password: '' } });
  const submit = async (raw: LoginValues | RegisterValues) => {
    setSubmitting(true);
    try {
      const user = isLogin
        ? await login(raw as LoginValues)
        : await registerUser({ ...(raw as RegisterValues), phone: (raw as RegisterValues).phone || undefined });
      toast.success(isLogin ? `Welcome back, ${user.name}` : 'Your account is ready');
      router.push(user.role === 'DRIVER' ? '/driver/dashboard' : '/passenger/dashboard');
    } catch (error) { toast.error(apiErrorMessage(error)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="auth-card">
      <div className="auth-heading"><span className="eyebrow">{isLogin ? 'Welcome back' : 'Join the pool'}</span><h1>{isLogin ? 'Move through Dhaka, together.' : 'Your next seat is closer.'}</h1><p>{isLogin ? 'Sign in to continue your pooled journey.' : 'Create a passenger account in under a minute.'}</p></div>
      {isLogin ? <form onSubmit={loginForm.handleSubmit(submit)} className="form-stack">
        <label><span>Email</span><div className="input-wrap"><Mail size={17} /><input type="email" placeholder="you@example.com" {...loginForm.register('email')} /></div><small>{loginForm.formState.errors.email?.message}</small></label>
        <label><span>Password</span><div className="input-wrap"><LockKeyhole size={17} /><input type="password" placeholder="Minimum 8 characters" {...loginForm.register('password')} /></div><small>{loginForm.formState.errors.password?.message}</small></label>
        <button className="button button-primary button-wide" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={18} /> : <>Sign in<ArrowRight size={18} /></>}</button>
      </form> : <form onSubmit={registerForm.handleSubmit(submit)} className="form-stack">
        <label><span>Name</span><div className="input-wrap"><UserRound size={17} /><input placeholder="Your full name" {...registerForm.register('name')} /></div><small>{registerForm.formState.errors.name?.message}</small></label>
        <label><span>Email</span><div className="input-wrap"><Mail size={17} /><input type="email" placeholder="you@example.com" {...registerForm.register('email')} /></div><small>{registerForm.formState.errors.email?.message}</small></label>
        <label><span>Phone</span><div className="input-wrap"><span className="phone-prefix">+88</span><input placeholder="01711000000" {...registerForm.register('phone')} /></div><small>{registerForm.formState.errors.phone?.message}</small></label>
        <label><span>Password</span><div className="input-wrap"><LockKeyhole size={17} /><input type="password" placeholder="Minimum 8 characters" {...registerForm.register('password')} /></div><small>{registerForm.formState.errors.password?.message}</small></label>
        <button className="button button-primary button-wide" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={18} /> : <>Create account<ArrowRight size={18} /></>}</button>
      </form>}
      <p className="auth-switch">{isLogin ? 'New to the pool?' : 'Already riding with us?'} <Link href={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Sign in'}</Link></p>
      {isLogin && <div className="demo-note"><strong>Demo:</strong> nusrat@dhakapool.local or jashim@dhakapool.local · Pool123!</div>}
    </div>
  );
}
