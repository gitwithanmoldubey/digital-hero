'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2, ArrowRight, Wand2, UserCheck, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setMagicLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard',
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('A magic link has been sent to your inbox!');
    }
    setMagicLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    
    // Using a predefined guest account (user should create this in Supabase)
    const demoEmail = 'guest@digitalheroes.co';
    const demoPass = 'digitalheroes2026';

    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPass,
    });

    if (error) {
      setError('Guest session is initializing. Please ensure project setup is complete.');
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex align-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      
      {/* Premium Animated Background Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }}
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -100, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }}
      />

      {/* Floating Back Link */}
      <Link href="/" className="absolute top-10 left-10 flex align-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-bold text-sm tracking-widest uppercase z-10">
         <ChevronLeft size={20} /> Back to Hub
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full p-12 relative z-10"
        style={{ maxWidth: '650px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 32px 64px -16px rgba(15,23,42,0.15)', borderRadius: '2.5rem' }}
      >
        <div className="text-center mb-12">
           <motion.div 
             whileHover={{ scale: 1.05, rotate: 5 }}
             className="bg-emerald-500 w-16 h-16 rounded-2xl mx-auto flex align-center justify-center mb-8 shadow-xl shadow-emerald-500/30 cursor-pointer"
           >
              <LogIn color="#fff" size={32} />
           </motion.div>
           <h1 className="text-4xl mb-3 tracking-tighter" style={{ color: 'var(--text-primary)', fontWeight: 900 }}>Welcome Back</h1>
           <p className="text-slate-500 text-sm font-semibold tracking-wide">Enter the elite golf performance circle.</p>
        </div>

        <div className="flex flex-column gap-12">
           {/* Guest Login Section - More Styled */}
           <motion.button 
             whileHover={{ y: -4, borderColor: '#10b981' }}
             whileTap={{ scale: 0.98 }}
             onClick={handleGuestLogin}
             className="flex align-center justify-between p-6 transition-all group rounded-2xl border-2 border-slate-100 bg-white/50 backdrop-blur-sm"
           >
              <div className="flex align-center gap-5">
                 <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                    <UserCheck size={28} />
                 </div>
                 <div style={{ textAlign: 'left' }}>
                    <div className="font-extrabold text-slate-900 text-xl tracking-tight">Instant Pass</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">One-click guest entry</div>
                 </div>
              </div>
              <ArrowRight size={22} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-2 transition-all" />
           </motion.button>

           <div className="flex align-center gap-4">
              <div style={{ flex: 1, height: '2px', background: 'rgba(15,23,42,0.05)' }}></div>
              <span className="text-[10px] text-slate-300 uppercase tracking-[0.3em] font-extrabold">Authenticated Connection</span>
              <div style={{ flex: 1, height: '2px', background: 'rgba(15,23,42,0.05)' }}></div>
           </div>

           <form onSubmit={handleLogin} className="flex flex-column gap-8">
             <div className="flex flex-column gap-3">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hero Email</label>
               <motion.div 
                 whileFocus={{ scale: 1.01 }}
                 className="flex align-center px-6 py-5 bg-white rounded-2xl border-2 border-slate-50 hover:border-slate-100 focus-within:!border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/5 transition-all"
               >
                 <Mail size={20} className="text-slate-300 mr-4" />
                 <input 
                   type="email" 
                   required 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="hero@example.com"
                   className="bg-transparent border-none text-slate-900 w-full outline-none font-bold placeholder:text-slate-300 text-lg"
                 />
               </motion.div>
             </div>

             <div className="flex flex-column gap-3">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
               <motion.div 
                 whileFocus={{ scale: 1.01 }}
                 className="flex align-center px-6 py-5 bg-white rounded-2xl border-2 border-slate-50 hover:border-slate-100 focus-within:!border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/5 transition-all"
               >
                 <Lock size={20} className="text-slate-300 mr-4" />
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="bg-transparent border-none text-slate-900 w-full outline-none font-bold placeholder:text-slate-300 text-lg"
                 />
               </motion.div>
             </div>

             <AnimatePresence>
               {error && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0, y: -10 }}
                   animate={{ opacity: 1, height: 'auto', y: 0 }}
                   exit={{ opacity: 0, height: 0 }}
                   className="p-5 bg-red-50 text-red-500 text-sm rounded-2xl flex align-center gap-4 border border-red-100 font-bold"
                 >
                   <AlertCircle size={20} /> {error}
                 </motion.div>
               )}

               {message && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="p-5 bg-emerald-50 text-emerald-700 text-sm rounded-2xl flex align-center gap-4 border border-emerald-100 font-bold"
                 >
                   <UserCheck size={20} /> {message}
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="flex gap-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || !password}
                  className="btn-primary flex-1 py-5 flex align-center justify-center gap-4 shadow-2xl"
                  style={{ borderRadius: '1.25rem', fontSize: '1.1rem', fontWeight: 900 }}
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <>Sign In Now <ArrowRight size={24} /></>}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleMagicLink}
                  disabled={magicLoading || !email}
                  className="flex align-center justify-center bg-white text-slate-400 hover:text-emerald-500 transition-all p-5 rounded-2xl border-2 border-slate-50 shadow-sm"
                  title="Sign in with Magic Link"
                >
                  {magicLoading ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                </motion.button>
             </div>
           </form>
        </div>

        <div className="mt-14 pt-10 border-t border-slate-50 text-center text-sm text-slate-400 font-bold">
          New to the movement? <Link href="/signup" className="text-emerald-600 font-black hover:scale-105 inline-block ml-2 transition-transform">Create Account</Link>
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
