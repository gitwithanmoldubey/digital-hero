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
  User,
  Shield,
  CreditCard,
  ChevronRight,
  Loader2,
  Save
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [charityPercent, setCharityPercent] = useState(10);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setCharityPercent(data.charity_percentage || 10);
    }
    setLoading(false);
  };

  const handleUpdatePercentage = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ charity_percentage: charityPercent })
      .eq('id', user.id);

    if (!error) {
       alert('Contribution strategy updated!');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar (Duplicate for speed) */}
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
            { icon: <Trophy size={20} />, label: 'Draw History', active: false, href: '/dashboard/draws' },
            { icon: <Settings size={20} />, label: 'Management', active: true, href: '/dashboard/settings' },
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Management & Privacy</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Control your hero profile and contribution strategy.</p>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : (
          <div className="flex flex-column gap-10">
            {/* Identity Card */}
            <div className="glass-panel" style={{ padding: '3rem', background: '#fff', border: 'none' }}>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <User size={24} color="var(--accent-primary)" /> Identity Details
               </h3>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4rem' }}>
                  <div>
                     <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>Full Profile Name</label>
                     <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>{profile?.full_name}</div>
                  </div>
                  <div>
                     <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>Registered Email</label>
                     <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '1rem', fontWeight: 700, fontSize: '1.1rem', opacity: 0.8 }}>{profile?.email || 'hero@platform.com'}</div>
                  </div>
               </div>
            </div>

            {/* Contribution Strategy */}
            <div className="glass-panel" style={{ padding: '3rem', background: '#fff', border: 'none' }}>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <Heart size={24} color="#ec4899" /> Impact Strategy
               </h3>
               <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontWeight: 500 }}>Adjust how much of your monthly membership value is directed to your chosen charity.</p>
               
               <div style={{ maxWidth: '600px' }}>
                  <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
                     <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>Current Contribution: {charityPercent}%</span>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Min 10% Required</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="50" 
                    step="5"
                    value={charityPercent}
                    onChange={(e) => setCharityPercent(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', height: '8px', cursor: 'pointer' }} 
                  />
                  <div className="flex justify-between mt-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                     <span>10% (STANDARD)</span>
                     <span>50% (ULTIMATE HERO)</span>
                  </div>

                  <button 
                    onClick={handleUpdatePercentage}
                    disabled={saving}
                    className="btn-primary" 
                    style={{ marginTop: '3rem', width: '100%', justifyContent: 'center', height: '64px', borderRadius: '1rem', fontWeight: 800 }}
                  >
                    {saving ? <Loader2 className="animate-spin" size={22} /> : <><Save size={20} /> Update Strategy</>}
                  </button>
               </div>
            </div>

            {/* Security & Subs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
               <div className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={22} color="var(--accent-secondary)" /> Security
                  </h3>
                  <button className="btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>Reset Password</button>
               </div>
               <div className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={22} color="var(--accent-primary)" /> Billing
                  </h3>
                  <button className="btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>Manage Subscription</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
