'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Search, Heart, ArrowLeft, ExternalLink, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website_url: string;
  is_featured: boolean;
}

export default function CharityDirectory() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCharities();
    fetchUserProfile();
  }, []);

  const fetchCharities = async () => {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching charities:', error);
    } else {
      setCharities(data || []);
    }
    setLoading(false);
  };

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('charity_id')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setSelectedCharityId(data.charity_id);
    }
  };

  const handleSelectCharity = async (charityId: string) => {
    setUpdating(charityId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to select a charity.');
      setUpdating(null);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id);

    if (error) {
      alert('Error updating charity: ' + error.message);
    } else {
      setSelectedCharityId(charityId);
    }
    setUpdating(null);
  };

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
         <div className="container">
            <div className="flex justify-between align-center" style={{ marginBottom: '3rem' }}>
              <Link href="/dashboard" className="flex align-center gap-2 group" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-all" /> Return to Dashboard
              </Link>
              <div className="flex align-center gap-3">
                <Heart size={24} color="var(--accent-primary)" fill="var(--accent-primary)" />
                <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>GLOBAL IMPACT CENTER</span>
              </div>
            </div>

            <div style={{ maxWidth: '800px' }}>
               <h1 style={{ marginBottom: '1.5rem', fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>Support Your <span style={{ color: 'var(--accent-primary)' }}>Heroes</span></h1>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>
                 Every point you score and every month you play contributes to verifiable, world-changing projects. 
                 Select the cause you want to champion today.
               </p>
            </div>

            {/* Search */}
            <div className="flex gap-4" style={{ marginTop: '3.5rem' }}>
              <div className="flex-1 glass-panel flex align-center" style={{ padding: '0 2rem', background: 'var(--bg-secondary)', border: 'none', borderRadius: '1.25rem' }}>
                <Search size={22} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
                <input 
                  type="text" 
                  placeholder="Browse charities and foundations..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', padding: '1.25rem 0', color: 'var(--text-primary)', width: '100%', outline: 'none', fontWeight: 600, fontSize: '1rem' }}
                />
              </div>
            </div>
         </div>
      </header>

      {/* Grid */}
      <section className="container" style={{ padding: '6rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '3rem' }}>
        {loading ? (
          <div className="flex justify-center p-20" style={{ gridColumn: '1/-1' }}><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : filteredCharities.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10rem', background: '#fff', borderRadius: '2rem' }}>
             <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.2rem' }}>No charities found matching your search.</p>
          </div>
        ) : (
          filteredCharities.map((charity, i) => (
            <motion.div 
              key={charity.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', border: 'none', boxShadow: 'var(--shadow-md)' }}
            >
              <div style={{ height: '240px', background: '#f1f5f9', position: 'relative' }}>
                {charity.image_url ? (
                  <img src={charity.image_url} alt={charity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0' }}>
                    <Heart size={64} fill="currentColor" opacity={0.5} />
                  </div>
                )}
                {charity.is_featured && (
                  <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'var(--accent-secondary)', color: '#fff', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>VERIFIED CHAMPION</div>
                )}
              </div>

              <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{charity.name}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1, lineHeight: 1.6, fontWeight: 500 }}>
                  {charity.description}
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleSelectCharity(charity.id)}
                    disabled={updating !== null}
                    className={selectedCharityId === charity.id ? "btn-secondary" : "btn-primary"} 
                    style={{ 
                      flex: 1, 
                      borderRadius: '1rem', 
                      background: selectedCharityId === charity.id ? 'rgba(16, 185, 129, 0.08)' : 'var(--accent-primary)',
                      color: selectedCharityId === charity.id ? 'var(--accent-primary)' : '#fff',
                      borderColor: selectedCharityId === charity.id ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      pointerEvents: selectedCharityId === charity.id ? 'none' : 'auto'
                    }}
                  >
                    {updating === charity.id ? <Loader2 className="animate-spin" size={20} /> : 
                     selectedCharityId === charity.id ? <><Check size={20} /> Active Cause</> : "Support Cause"}
                  </button>
                  <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '1rem', borderRadius: '1rem' }}>
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>
    </main>
  );
}
