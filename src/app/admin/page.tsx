'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { generateWinningNumbers, calculateDrawResults, DrawSummary } from '@/lib/draw-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Dices, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Eye,
  FileText,
  Loader2,
  Trophy,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Settings,
  ExternalLink,
  ShieldCheck,
  Package,
  Calendar,
  Globe
} from 'lucide-react';
import Link from 'next/link';

// TYPES
interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalPool: number;
  charityShares: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  subscription_status: string;
  charity_id: string;
  charity_percentage: number;
  is_admin: boolean;
  created_at: string;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  website_url: string;
  logo_url: string;
  is_featured: boolean;
}

interface Winner {
  id: string;
  user_id: string;
  profiles: { full_name: string };
  match_type: number;
  prize_amount: number;
  verification_status: string;
  payout_status: string;
  proof_url?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // DATA STATES
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeSubscribers: 0, totalPool: 0, charityShares: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  
  // MODALS & ACTIONS
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [showAddCharity, setShowAddCharity] = useState(false);
  
  // DRAW STATES
  const [drawLogic, setDrawLogic] = useState<'algorithmic' | 'random'>('algorithmic');
  const [simulation, setSimulation] = useState<DrawSummary | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch Profiles
    const { data: profileData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const usersList = profileData || [];
    setUsers(usersList);
    
    // Fetch Charities
    const { data: charityData } = await supabase.from('charities').select('*').order('name');
    setCharities(charityData || []);
    
    // Fetch Winners
    const { data: winnerData } = await supabase.from('winners').select('*, profiles(full_name)').order('created_at', { ascending: false });
    setWinners(winnerData || []);

    // Calculate Stats
    const activeCount = usersList.filter(u => u.subscription_status === 'active').length;
    setStats({
      totalUsers: usersList.length,
      activeSubscribers: activeCount,
      totalPool: activeCount * 10,
      charityShares: activeCount * 2
    });

    setLoading(false);
  };

  // --- USER MANAGEMENT ACTIONS ---
  const handleUpdateUserStatus = async (userId: string, status: string) => {
    const { error } = await supabase.from('profiles').update({ subscription_status: status }).eq('id', userId);
    if (!error) fetchAllData();
  };

  // --- CHARITY MANAGEMENT ACTIONS ---
  const handleSaveCharity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      website_url: formData.get('website_url') as string,
      logo_url: formData.get('logo_url') as string,
    };

    if (editingCharity) {
      await supabase.from('charities').update(data).eq('id', editingCharity.id);
    } else {
      await supabase.from('charities').insert([data]);
    }
    
    setShowAddCharity(false);
    setEditingCharity(null);
    fetchAllData();
  };

  const handleDeleteCharity = async (id: string) => {
    if (confirm('Are you sure you want to delete this charity?')) {
      await supabase.from('charities').delete().eq('id', id);
      fetchAllData();
    }
  };

  // --- DRAW ACTIONS ---
  const handleRunSimulation = async () => {
    setSimulating(true);
    const activeUsers = users.filter(u => u.subscription_status === 'active');
    
    if (activeUsers.length === 0) {
      alert('No active subscribers for simulation.');
      setSimulating(false);
      return;
    }

    const { data: allScores } = await supabase.from('scores').select('user_id, score').in('user_id', activeUsers.map(u => u.id));

    const entries = activeUsers.map(u => ({
      user_id: u.id,
      scores: allScores?.filter(s => s.user_id === u.id).map(s => s.score) || []
    }));

    const winningNumbers = generateWinningNumbers(drawLogic);
    const results = calculateDrawResults(winningNumbers, entries, stats.totalPool, 0);

    setSimulation(results);
    setSimulating(false);
  };

  const handlePublishResults = async () => {
    if (!simulation) return;
    setPublishing(true);
    const now = new Date();
    
    const { data: draw, error: drawError } = await supabase.from('draws').insert({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      winning_numbers: simulation.winningNumbers,
      is_published: true,
      logic_type: drawLogic,
      jackpot_rollover: simulation.poolDistribution.jackpotRollover
    }).select().single();

    if (!drawError && simulation.winners.length > 0) {
      const records = simulation.winners.map(w => ({
        draw_id: draw.id,
        user_id: w.user_id,
        match_type: w.matchType,
        prize_amount: w.prize
      }));
      await supabase.from('winners').insert(records);
    }

    alert('Reward results published!');
    setSimulation(null);
    setPublishing(false);
    fetchAllData();
  };

  // --- WINNER ACTIONS ---
  const handleVerifyWinner = async (winnerId: string, status: string) => {
    await supabase.from('winners').update({ verification_status: status }).eq('id', winnerId);
    fetchAllData();
  };

  const handlePayoutWinner = async (winnerId: string, status: string) => {
    await supabase.from('winners').update({ payout_status: status }).eq('id', winnerId);
    fetchAllData();
  };

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--text-primary)', padding: '3rem 2rem', color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div className="flex align-center gap-3" style={{ marginBottom: '4rem' }}>
          <div style={{ background: 'var(--accent-secondary)', width: '36px', height: '36px', borderRadius: '10px' }}></div>
          <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-1px' }}>DH CONTROL</span>
        </div>

        <nav className="flex flex-column gap-2" style={{ flex: 1 }}>
          {[
            { id: 'Overview', icon: <BarChart3 size={20} /> },
            { id: 'Participants', icon: <Users size={20} /> },
            { id: 'Foundations', icon: <Heart size={20} /> },
            { id: 'Reward Logic', icon: <Dices size={20} /> },
            { id: 'Winners', icon: <CheckCircle2 size={20} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex align-center gap-4 transition-all"
              style={{ 
                padding: '1.25rem', 
                borderRadius: '1rem', 
                fontSize: '0.9rem',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                fontWeight: activeTab === tab.id ? 800 : 600
              }}
            >
              {tab.icon} {tab.id}
            </button>
          ))}
        </nav>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Link href="/" className="flex align-center gap-2 text-xs opacity-50 hover:opacity-100 transition-all font-black uppercase tracking-widest">
               <ArrowRight size={14} /> Global Hub
            </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '4rem 6rem', marginLeft: '280px' }}>
        <header className="flex justify-between align-center" style={{ marginBottom: '5rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-2px' }}>{activeTab}</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              Secure Administrator Access • {mounted ? new Date().toLocaleDateString() : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-4">
             <button onClick={fetchAllData} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>Refresh Feed</button>
             <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e2e8f0', border: '3px solid #fff', boxShadow: 'var(--shadow-sm)' }}></div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'Overview' && (
                <div className="flex flex-column gap-12">
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem' }}>
                      {[
                        { label: 'Total Heroes', value: stats.totalUsers, icon: <Users />, color: '#10b981' },
                        { label: 'Active Subs', value: stats.activeSubscribers, icon: <Package />, color: '#3b82f6' },
                        { label: 'Draw Pool', value: `£${stats.totalPool}`, icon: <Trophy />, color: '#f59e0b' },
                        { label: 'Impact Shares', value: `£${stats.charityShares}`, icon: <Heart />, color: '#ec4899' },
                      ].map((s, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none' }}>
                           <div style={{ color: s.color, marginBottom: '1.5rem', opacity: 0.8 }}>{s.icon}</div>
                           <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{s.value}</div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                        </div>
                      ))}
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                      <div className="glass-panel" style={{ padding: '3rem', background: '#fff', border: 'none' }}>
                         <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem' }}>Engagement Trends</h3>
                         <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent-primary)', borderRadius: '8px', opacity: 0.1 + (i * 0.1) }}></div>
                            ))}
                         </div>
                         <div className="flex justify-between mt-6" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                         </div>
                      </div>
                      <div className="glass-panel" style={{ padding: '3rem', background: 'var(--text-primary)', border: 'none', color: '#fff' }}>
                         <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem' }}>System Health</h3>
                         <div className="flex flex-column gap-6">
                            {[
                              { label: 'Database Auth', status: 'Optimal' },
                              { label: 'Stripe Listeners', status: 'Active' },
                              { label: 'RLS Policies', status: 'Secure' },
                              { label: 'Draw Engine', status: 'Standby' }
                            ].map((s, i) => (
                              <div key={i} className="flex justify-between align-center p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                                 <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</span>
                                 <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>{s.status}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* --- PARTICIPANTS TAB --- */}
              {activeTab === 'Participants' && (
                <div className="glass-panel" style={{ padding: '3rem', background: '#fff', border: 'none' }}>
                   <div className="flex justify-between align-center" style={{ marginBottom: '3rem' }}>
                      <h3 style={{ fontSize: '1.5rem' }}>Hero Directory ({users.length})</h3>
                      <div className="flex gap-4">
                         <div className="flex align-center px-4 bg-slate-50 rounded-xl border border-slate-200">
                            <Search size={18} className="text-slate-400 mr-2" />
                            <input type="text" placeholder="Search heroes..." style={{ background: 'transparent', border: 'none', padding: '0.75rem', outline: 'none', fontSize: '0.9rem' }} />
                         </div>
                         <button className="btn-secondary flex align-center gap-2"><Filter size={18} /> Filters</button>
                      </div>
                   </div>

                   <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
                      <thead>
                         <tr style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <th style={{ padding: '0 1.5rem' }}>Profile</th>
                            <th>Status</th>
                            <th>Sub Type</th>
                            <th>Impact</th>
                            <th style={{ textAlign: 'right', padding: '0 1.5rem' }}>Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                         {users.map(u => (
                           <tr key={u.id} className="hover:bg-slate-50 transition-all">
                              <td style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '1.5rem 0 0 1.5rem' }}>
                                 <div className="flex align-center gap-4">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e2e8f0' }}></div>
                                    <div style={{ fontWeight: 800 }}>{u.full_name}</div>
                                 </div>
                              </td>
                              <td style={{ background: 'var(--bg-secondary)' }}>
                                 <div style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, background: u.subscription_status === 'active' ? 'rgba(16,185,129,0.1)' : '#f1f5f9', color: u.subscription_status === 'active' ? '#059669' : '#64748b' }}>
                                    {u.subscription_status.toUpperCase()}
                                 </div>
                              </td>
                              <td style={{ background: 'var(--bg-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Monthly Hero</td>
                              <td style={{ background: 'var(--bg-secondary)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{u.charity_percentage}% Share</td>
                              <td style={{ textAlign: 'right', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0 1.5rem 1.5rem 0' }}>
                                 <button onClick={() => setSelectedUser(u)} style={{ color: 'var(--text-muted)' }}><Edit2 size={18} /></button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}

              {/* --- FOUNDATIONS TAB --- */}
              {activeTab === 'Foundations' && (
                <div className="flex flex-column gap-8">
                   <div className="flex justify-between align-center">
                      <h3 style={{ fontSize: '1.5rem' }}>Charity Ecosystem ({charities.length})</h3>
                      <button onClick={() => setShowAddCharity(true)} className="btn-primary flex align-center gap-2"><Plus size={20} /> Add Foundation</button>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
                      {charities.map(c => (
                        <div key={c.id} className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none', position: 'relative' }}>
                           <div className="flex justify-between align-center mb-6">
                              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f8fafc', padding: '0.75rem' }}>
                                 <img src={c.logo_url || 'https://via.placeholder.com/64'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => { setEditingCharity(c); setShowAddCharity(true); }} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                                 <button onClick={() => handleDeleteCharity(c.id)} style={{ padding: '0.5rem', color: '#ef4444' }}><Trash2 size={16} /></button>
                              </div>
                           </div>
                           <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>{c.name}</h4>
                           <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', minHeight: '60px' }}>{c.description?.slice(0, 100)}...</p>
                           <a href={c.website_url} target="_blank" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignCenter: 'center', gap: '0.4rem' }}>
                              Visit Portal <ExternalLink size={12} />
                           </a>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* --- REWARD LOGIC TAB --- */}
              {activeTab === 'Reward Logic' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                   <div className="glass-panel" style={{ padding: '3.5rem', background: '#fff', border: 'none' }}>
                      <h3 style={{ fontSize: '1.75rem', marginBottom: '2.5rem' }}>Draw Execution Engine</h3>
                      
                      <div className="flex flex-column gap-8">
                         <div className="flex flex-column gap-4">
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Selection Algorithm</label>
                            <div className="flex gap-4">
                               <button 
                                 onClick={() => setDrawLogic('algorithmic')}
                                 className="flex-1 p-5 rounded-2xl border-2 transition-all text-left"
                                 style={{ borderColor: drawLogic === 'algorithmic' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', background: drawLogic === 'algorithmic' ? 'rgba(16,185,129,0.05)' : 'transparent' }}
                               >
                                  <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>DH Weighted Engine</div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Fair-weighting based on Stableford history</div>
                               </button>
                               <button 
                                 onClick={() => setDrawLogic('random')}
                                 className="flex-1 p-5 rounded-2xl border-2 transition-all text-left"
                                 style={{ borderColor: drawLogic === 'random' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', background: drawLogic === 'random' ? 'rgba(16,185,129,0.05)' : 'transparent' }}
                               >
                                  <div style={{ fontWeight: 800, marginBottom: '0.25rem' }}>True Randomization</div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Standard probabilistic number set</div>
                               </button>
                            </div>
                         </div>

                         <div className="flex gap-4 pt-4">
                             <button 
                               onClick={handleRunSimulation} 
                               disabled={simulating}
                               className="btn-secondary" 
                               style={{ flex: 1, height: '64px', fontWeight: 800 }}
                             >
                                {simulating ? <Loader2 className="animate-spin" /> : 'INITIATE SIMULATION'}
                             </button>
                             {simulation && (
                               <button 
                                 onClick={handlePublishResults}
                                 disabled={publishing}
                                 className="btn-primary" 
                                 style={{ flex: 1, height: '64px', fontWeight: 800, background: 'var(--accent-secondary)' }}
                               >
                                  {publishing ? <Loader2 className="animate-spin" /> : 'PUBLISH REWARDS'}
                               </button>
                             )}
                         </div>

                         {simulation && (
                           <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '2px dashed var(--border)' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.5rem' }}>Sequence Result:</div>
                              <div className="flex gap-3 mb-8">
                                {simulation.winningNumbers.map(n => (
                                  <div key={n} style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--text-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>{n}</div>
                                ))}
                              </div>
                              <div className="flex flex-column gap-3">
                                 <div className="flex justify-between p-4 bg-slate-50 rounded-xl text-sm font-bold"><span>Total Winners:</span> <span>{simulation.winners.length} Heroes</span></div>
                                 <div className="flex justify-between p-5 bg-emerald-50 rounded-xl text-xl font-black text-emerald-700"><span>Pool Payout:</span> <span>£{simulation.winners.reduce((acc, w) => acc + w.prize, 0).toFixed(0)}</span></div>
                              </div>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="glass-panel" style={{ padding: '3rem', background: '#fff', border: 'none' }}>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>Draw Protocol</h3>
                      <div className="flex flex-column gap-6">
                         {[
                           { icon: <ShieldCheck />, title: 'Verifiable Fairness', desc: 'Results are cryptographically unique.' },
                           { icon: <Globe />, title: 'Global Sync', desc: 'Publishing triggers emails worldwide.' },
                           { icon: <Package />, title: 'Ledger Entry', desc: 'Charity shares are locked upon publish.' }
                         ].map((item, i) => (
                           <div key={i} className="flex gap-4">
                              <div style={{ color: 'var(--accent-primary)' }}>{item.icon}</div>
                              <div>
                                 <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.title}</div>
                                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.desc}</div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* --- WINNERS TAB --- */}
              {activeTab === 'Winners' && (
                <div className="glass-panel" style={{ padding: '3rem', background: '#fff', border: 'none' }}>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>Reward Ledger ({winners.length})</h3>
                   <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
                      <thead>
                         <tr style={{ textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <th style={{ padding: '0 1.5rem' }}>Hero</th>
                            <th>Sequence</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right', padding: '0 1.5rem' }}>Management</th>
                         </tr>
                      </thead>
                      <tbody>
                         {winners.map(w => (
                           <tr key={w.id}>
                              <td style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '1.5rem 0 0 1.5rem' }}>
                                 <div style={{ fontWeight: 800 }}>{w.profiles?.full_name}</div>
                              </td>
                              <td style={{ background: 'var(--bg-secondary)', fontWeight: 700 }}>Match {w.match_type}</td>
                              <td style={{ background: 'var(--bg-secondary)', fontWeight: 900, color: 'var(--accent-primary)' }}>£{Number(w.prize_amount).toFixed(2)}</td>
                              <td style={{ background: 'var(--bg-secondary)' }}>
                                 <div style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 900, background: w.payout_status === 'completed' ? '#ecfdf5' : '#fff7ed', color: w.payout_status === 'completed' ? '#059669' : '#c2410c' }}>
                                    {w.payout_status.toUpperCase()}
                                 </div>
                              </td>
                              <td style={{ textAlign: 'right', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0 1.5rem 1.5rem 0' }}>
                                 <button onClick={() => handlePayoutWinner(w.id, 'completed')} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Payout Completed</button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* --- ADD CHARITY MODAL --- */}
      {showAddCharity && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', zize: 100, display: 'flex', alignCenter: 'center', justifyCenter: 'center', padding: '2rem', zIndex: 100 }}>
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="glass-panel" 
             style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '3.5rem', border: 'none' }}
           >
              <h3 style={{ fontSize: '1.75rem', marginBottom: '2.5rem' }}>{editingCharity ? 'Edit Foundation' : 'Add New Foundation'}</h3>
              <form onSubmit={handleSaveCharity} className="flex flex-column gap-6">
                 <div className="flex flex-column gap-2">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>FOUNDATION NAME</label>
                    <input name="name" defaultValue={editingCharity?.name} required className="focus-emerald" style={{ padding: '1rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: 'none', fontWeight: 700 }} />
                 </div>
                 <div className="flex flex-column gap-2">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>DESCRIPTION</label>
                    <textarea name="description" defaultValue={editingCharity?.description} rows={4} className="focus-emerald" style={{ padding: '1rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: 'none', fontWeight: 600, resize: 'none' }} />
                 </div>
                 <div className="flex flex-column gap-2">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>WEBSITE URL</label>
                    <input name="website_url" defaultValue={editingCharity?.website_url} className="focus-emerald" style={{ padding: '1rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: 'none', fontWeight: 700 }} />
                 </div>
                 <div className="flex flex-column gap-2">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>LOGO URL (EXTERNAL)</label>
                    <input name="logo_url" defaultValue={editingCharity?.logo_url} className="focus-emerald" style={{ padding: '1rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: 'none', fontWeight: 700 }} />
                 </div>
                 
                 <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => { setShowAddCharity(false); setEditingCharity(null); }} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn-primary flex-1">Save Foundation</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignCenter: 'center', justifyCenter: 'center', padding: '2rem', zIndex: 100 }}>
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="glass-panel" 
             style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '3.5rem', border: 'none' }}
           >
              <h3 style={{ fontSize: '1.75rem', marginBottom: '2.5rem' }}>Hero Management: {selectedUser.full_name}</h3>
              <div className="flex flex-column gap-8">
                 <div className="flex flex-column gap-4">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>SUBSCRIPTION STATUS</label>
                    <div className="flex gap-3">
                       {['active', 'inactive', 'cancelled'].map(s => (
                         <button 
                           key={s} 
                           onClick={() => handleUpdateUserStatus(selectedUser.id, s)}
                           className="flex-1 p-3 rounded-xl border-2 transition-all font-bold text-xs uppercase"
                           style={{ borderColor: selectedUser.subscription_status === s ? 'var(--accent-primary)' : 'var(--bg-tertiary)', background: selectedUser.subscription_status === s ? 'rgba(16,185,129,0.05)' : 'transparent', color: selectedUser.subscription_status === s ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-column gap-4">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>IMPACT LIMITS</label>
                    <div className="p-4 bg-slate-50 rounded-xl flex justify-between align-center">
                       <span style={{ fontWeight: 700 }}>Charity Share:</span>
                       <span style={{ fontWeight: 900, color: 'var(--accent-secondary)' }}>{selectedUser.charity_percentage}% Monthly</span>
                    </div>
                 </div>

                 <button onClick={() => setSelectedUser(null)} className="btn-primary w-full mt-6">Return to Directory</button>
              </div>
           </motion.div>
        </div>
      )}

      <style jsx>{`
        .focus-emerald:focus {
           border: 2px solid var(--accent-primary) !important;
           outline: none;
           background: #fff !important;
        }
        th, td { text-align: left; vertical-align: middle; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-6 { margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
