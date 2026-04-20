'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, Loader2, ArrowRight, User, AlertTriangle, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    setError(null);
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      if (error.status === 429) {
        setCooldown(60);
      }
    } else if (data.user) {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex align-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      
      {/* Premium Animated Background Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
          y: [0, 80, 0]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '-10%', right: '-5%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }}
      />
      <motion.div 
        animate={{ 
          scale: [1.3, 1, 1.3],
          x: [0, 100, 0],
          y: [0, -80, 0]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }}
      />

      {/* Floating Back Link */}
      <Link href="/" className="absolute top-10 left-10 flex align-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-extrabold text-sm tracking-widest uppercase z-10">
         <ChevronLeft size={20} /> Hub Entrance
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full p-12 relative z-10"
        style={{ maxWidth: '650px', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 40px 80px -20px rgba(15,23,42,0.18)', borderRadius: '3rem' }}
      >
        <div className="text-center mb-12">
           <motion.div 
             whileHover={{ scale: 1.1, rotate: -5 }}
             className="bg-emerald-500 w-16 h-16 rounded-2xl mx-auto flex align-center justify-center mb-8 shadow-2xl shadow-emerald-500/40"
           >
              <UserPlus color="#fff" size={32} />
           </motion.div>
           <h1 className="text-4xl mb-3 tracking-tighter" style={{ color: 'var(--text-primary)', fontWeight: 900 }}>Create Identity</h1>
           <p className="text-slate-500 text-sm font-bold tracking-wide">Start your journey of golf and social impact.</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="bg-emerald-50 text-emerald-800 p-8 rounded-3xl mb-10 border-2 border-emerald-100 font-extrabold shadow-lg shadow-emerald-500/5">
                 <CheckCircle2 size={48} className="mx-auto mb-6 text-emerald-500" />
                 <h3 className="text-2xl mb-3">Check Your Inbox</h3>
                 <p className="text-sm opacity-80 leading-relaxed font-bold">We've dispatched a verification link to **{email}**. Activate your pass to proceed.</p>
              </div>
              <Link href="/login" className="btn-primary w-full py-5 block shadow-xl" style={{ borderRadius: '1.25rem', fontSize: '1.1rem', fontWeight: 900 }}>Finalize & Sign In</Link>
            </motion.div>
          ) : (
            <form key="form" onSubmit={handleSignup} className="flex flex-column gap-6">
              <div className="flex flex-column gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Full Profile Name</label>
                <div className="flex align-center px-6 py-5 bg-white rounded-2xl border-2 border-slate-100 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/5 transition-all">
                  <User size={20} className="text-slate-300 mr-4" />
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-transparent border-none text-slate-900 w-full outline-none font-bold text-lg"
                  />
                </div>
              </div>

              <div className="flex flex-column gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Hero Email</label>
                <div className="flex align-center px-6 py-5 bg-white rounded-2xl border-2 border-slate-100 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/5 transition-all">
                  <Mail size={20} className="text-slate-300 mr-4" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hero@platform.com"
                    className="bg-transparent border-none text-slate-900 w-full outline-none font-bold text-lg"
                  />
                </div>
              </div>

              <div className="flex flex-column gap-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Secure Password</label>
                <div className="flex align-center px-6 py-5 bg-white rounded-2xl border-2 border-slate-100 focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/5 transition-all">
                  <Lock size={20} className="text-slate-300 mr-4" />
                  <input 
                    type="password" 
                    required 
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent border-none text-slate-900 w-full outline-none font-bold text-lg"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-red-50 text-red-500 text-sm rounded-2xl flex align-center gap-4 border border-red-100 font-bold"
                  >
                    <AlertTriangle size={20} />
                    <div style={{ flex: 1 }}>{error}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading || cooldown > 0}
                className="btn-primary w-full py-6 flex align-center justify-center gap-4 shadow-2xl mt-4"
                style={{ borderRadius: '1.25rem', fontSize: '1.1rem', fontWeight: 900 }}
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : 
                 cooldown > 0 ? `Please Wait ${cooldown}s` : <>Create Hero Identity <ArrowRight size={24} /></>}
              </motion.button>
              
              {cooldown > 0 && (
                 <p className="text-[10px] text-center text-slate-400 font-extrabold uppercase tracking-widest mt-2 animate-pulse">
                   Platform Cool-down Active
                 </p>
              )}
            </form>
          )}
        </AnimatePresence>

        <div className="mt-14 pt-10 border-t border-slate-50 text-center text-sm text-slate-400 font-bold">
          Already verified? <Link href="/login" className="text-emerald-600 font-black hover:scale-105 inline-block ml-2 transition-transform">Sign in here</Link>
        </div>
      </motion.div>

      <style jsx>{`
        .text-4xl { font-size: 2.5rem; }
        .text-sm { font-size: 0.875rem; }
        .w-full { width: 100%; }
        .mr-3 { margin-right: 0.75rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
