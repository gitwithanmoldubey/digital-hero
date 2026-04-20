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
  TrendingUp, 
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import ScoreEntry from '@/components/ScoreEntry';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    avgScore: '0',
    totalWins: '£0',
    charityImpact: '£0',
  });
  const [charity, setCharity] = useState<any>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*, charities(*)')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setCharity(profileData.charities);
    }

    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id);
    
    if (scores && scores.length > 0) {
      const avg = scores.reduce((acc, s) => acc + s.score, 0) / scores.length;
      setStats(prev => ({ ...prev, avgScore: avg.toFixed(1) }));
    }

    const { data: wins } = await supabase
      .from('winners')
      .select('prize_amount')
      .eq('user_id', user.id);
    
    if (wins && wins.length > 0) {
      const total = wins.reduce((acc, w) => acc + Number(w.prize_amount), 0);
      setStats(prev => ({ ...prev, totalWins: `£${total.toFixed(0)}` }));
    }

    if (profileData?.subscription_status === 'active') {
       setStats(prev => ({ ...prev, charityImpact: '£24.50' })); 
    }

    setLoading(false);
  };

  const handleSubscribeSimulation = async () => {
    setSubscribing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    if (!error) {
      await fetchData();
    }
    setSubscribing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen flex align-center justify-center bg-white"><Loader2 className="animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--bg-primary)', padding: '2.5rem 2rem', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <Link href="/" className="flex align-center gap-3" style={{ marginBottom: '4rem' }}>
          <div style={{ background: 'var(--accent-primary)', width: '36px', height: '36px', borderRadius: '10px', boxShadow: '0 4px 12px var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Trophy size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-1px' }}>DIGITAL HEROES</span>
        </Link>

        <nav className="flex flex-column gap-2" style={{ flex: 1 }}>
          {[
            { icon: <BarChart3 size={20} />, label: 'Overview', active: true, href: '/dashboard' },
            { icon: <Heart size={20} />, label: 'Charity Center', active: false, href: '/charity' },
            { icon: <Trophy size={20} />, label: 'Draw History', active: false, href: '/dashboard/draws' },
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

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem 4rem 4rem', marginLeft: '280px' }}>
        <header className="flex justify-between align-center" style={{ marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hero View: {profile?.full_name?.split(' ')[0] || 'Hero'}</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Global ranking and performance analytics.</p>
          </div>
          <div className="flex align-center gap-4">
            <div className="flex align-center gap-2" style={{ 
              padding: '0.6rem 1.2rem', 
              background: profile?.subscription_status === 'active' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-tertiary)',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: profile?.subscription_status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: profile?.subscription_status === 'active' ? '#10b981' : '#94a3b8' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: profile?.subscription_status === 'active' ? '#059669' : '#64748b' }}>
                {profile?.subscription_status || 'INACTIVE'}
              </span>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e2e8f0', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)' }}></div>
          </div>
        </header>

        {profile?.subscription_status !== 'active' && (
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass-panel flex justify-between align-center" 
             style={{ padding: '2rem 3rem', marginBottom: '3rem', border: 'none', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', color: '#fff' }}
           >
              <div className="flex align-center gap-5">
                 <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem' }}>
                    <AlertCircle size={32} color="#fff" />
                 </div>
                 <div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Subscription Inactive</div>
                    <p style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: 500 }}>Activate your Hero status to qualify for rewards and trigger charity donations.</p>
                 </div>
              </div>
              <button 
                onClick={handleSubscribeSimulation}
                disabled={subscribing}
                className="btn-secondary" 
                style={{ background: '#fff', border: 'none', color: '#059669', padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: 700 }}
              >
                {subscribing ? <Loader2 className="animate-spin" size={20} /> : "Activat Now"}
              </button>
           </motion.div>
        )}

        <div className="flex flex-column gap-6">
          {/* Stats Grid */}
          <div className="flex gap-6">
            {[
              { label: 'Platform Avg.', value: `${stats.avgScore}`, icon: <TrendingUp size={24} />, color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.05)' },
              { label: 'Total Rewards', value: stats.totalWins, icon: <Trophy size={24} />, color: 'var(--accent-secondary)', bg: 'rgba(180, 83, 9, 0.05)' },
              { label: 'Verified Impact', value: stats.charityImpact, icon: <Heart size={24} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.05)' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className="glass-panel" 
                style={{ flex: 1, padding: '2rem', border: 'none', background: '#fff' }}
              >
                <div style={{ color: stat.color, background: stat.bg, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-6">
            <div style={{ flex: '2' }}>
              <ScoreEntry />
            </div>
            
            <div style={{ flex: '1' }} className="flex flex-column gap-6">
               {/* Charity Selection */}
               <div className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Active Charity</h3>
                  {charity ? (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                       <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{charity.name}</div>
                       <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Receiving {profile?.charity_percentage}% of your membership value monthly.</p>
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, border: '2px dashed var(--border)', borderRadius: '1rem', marginBottom: '2rem' }}>
                      No charity selected.
                    </div>
                  )}
                  <Link href="/charity" className="btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {charity ? 'Change Cause' : 'Select Cause'} <ChevronRight size={18} />
                  </Link>
               </div>

               {/* Drawing Status */}
               <div className="glass-panel" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #fff 0%, #f1f5f9 100%)', border: 'none' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Next Reward Draw</h3>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2rem' }}>POOL CLOSES IN:</div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>14d 12h</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Trophy size={18} /> Est. £12,500
                  </div>
                  <div style={{ marginTop: '2.5rem', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '65%' }}
                       transition={{ duration: 1.5, ease: 'easeOut' }}
                       style={{ height: '100%', background: 'var(--accent-primary)' }}
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
