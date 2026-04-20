'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Trophy, 
  Heart, 
  Settings, 
  LogOut, 
  Calendar,
  Search,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function DrawsPage() {
  const [loading, setLoading] = useState(true);
  const [draws, setDraws] = useState<any[]>([]);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('draws')
      .select('*, winners(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error) {
      setDraws(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar (Duplicate for speed, should be componentized) */}
      <aside style={{ width: '280px', background: 'var(--bg-primary)', padding: '2.5rem 2rem', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <Link href="/" className="flex align-center gap-3" style={{ marginBottom: '4rem' }}>
          <div style={{ background: 'var(--accent-primary)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Trophy size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-1px' }}>DIGITAL HEROES</span>
        </Link>
        <nav className="flex flex-column gap-2" style={{ flex: 1 }}>
          {[
            { icon: <BarChart3 size={20} />, label: 'Overview', active: false, href: '/dashboard' },
            { icon: <Heart size={20} />, label: 'Charity Center', active: false, href: '/charity' },
            { icon: <Trophy size={20} />, label: 'Draw History', active: true, href: '/dashboard/draws' },
            { icon: <Settings size={20} />, label: 'Management', active: false, href: '/dashboard/settings' },
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className="flex align-center gap-3 transition-all" 
              style={{ 
                padding: '1rem 1.25rem', 
                borderRadius: '0.75rem', 
                color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: item.active ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                fontWeight: item.active ? 700 : 600,
                fontSize: '0.95rem'
              }}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="flex align-center gap-3 transition-all hover:bg-red-50" style={{ color: '#ef4444', padding: '1rem', width: '100%', borderRadius: '0.75rem', fontWeight: 600 }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '3rem 4rem 4rem', marginLeft: '280px' }}>
        <header className="flex justify-between align-center" style={{ marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Draw Records</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Transparent history of all hero reward sequences.</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : (
          <div className="flex flex-column gap-6">
             {draws.length === 0 ? (
               <div className="glass-panel text-center" style={{ padding: '8rem', background: '#fff', border: 'none' }}>
                  <Calendar size={64} className="mx-auto mb-6 opacity-10" />
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>No Draws Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>The first reward draw for this period is scheduled soon.</p>
               </div>
             ) : (
               draws.map((draw, i) => (
                 <motion.div 
                   key={draw.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="glass-panel" 
                   style={{ padding: '3rem', background: '#fff', border: 'none', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '4rem', alignItems: 'center' }}
                 >
                   <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sequence {draw.id.slice(0, 8)}</div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{new Date(draw.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                   </div>
                   
                   <div className="flex gap-4 align-center justify-center">
                      {draw.winning_numbers.map((n: number, idx: number) => (
                        <div key={idx} style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--bg-secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 900 }}>
                          {n}
                        </div>
                      ))}
                   </div>

                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>TOTAL WINNERS:</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-secondary)' }}>{draw.winners?.length || 0} Participants</div>
                   </div>
                 </motion.div>
               ))
             )}
          </div>
        )}
      </main>
    </div>
  );
}
