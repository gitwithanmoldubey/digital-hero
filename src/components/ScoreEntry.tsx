'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, Save, Edit2, Loader2, Sparkles } from 'lucide-react';

interface Score {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

export default function ScoreEntry() {
  const [scores, setScores] = useState<Score[]>([]);
  const [newScore, setNewScore] = useState<number | ''>('');
  const [newDate, setNewDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching scores:', error);
    } else {
      setScores(data || []);
    }
    setLoading(false);
  };

  const handleAddScore = async () => {
    if (newScore === '' || !newDate) return;
    if (newScore < 1 || newScore > 45) {
      alert('Score must be between 1 and 45.');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Session required to save entries.');
      setSaving(false);
      return;
    }

    const { count } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 5) {
      const { data: oldest } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (oldest) {
        await supabase.from('scores').delete().eq('id', oldest.id);
      }
    }

    const { error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: user.id,
        score: newScore,
        date: newDate
      });

    if (insertError) {
      if (insertError.code === '23505') {
        alert('An entry already exists for this date.');
      } else {
        alert('Error saving score: ' + insertError.message);
      }
    } else {
      setNewScore('');
      setNewDate('');
      await fetchScores();
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-column gap-6">
      <div className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none' }}>
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
          <Edit2 size={24} color="var(--accent-primary)" />
          New Performance Entry
        </h3>
        
        <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stableford Score</label>
            <input 
              type="number" 
              value={newScore}
              onChange={(e) => setNewScore(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="36"
              style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '2px solid transparent', color: 'var(--text-primary)', fontWeight: 600, transition: '0.3s' }}
              className="focus-emerald"
            />
          </div>
          <div className="flex flex-column gap-2" style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Played</label>
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '1rem', background: 'var(--bg-secondary)', border: '2px solid transparent', color: 'var(--text-primary)', fontWeight: 600, transition: '0.3s' }}
              className="focus-emerald"
            />
          </div>
          <button 
            disabled={saving}
            onClick={handleAddScore}
            className="btn-primary" 
            style={{ alignSelf: 'flex-end', height: '56px', minWidth: '180px', borderRadius: '1rem' }}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Score</>}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', background: '#fff', border: 'none' }}>
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
          <Calendar size={24} color="var(--accent-primary)" />
          Verified Sequence
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : (
          <div className="flex flex-column gap-3">
            {scores.length === 0 ? (
              <div className="flex flex-column align-center gap-3 p-10" style={{ background: 'var(--bg-secondary)', borderRadius: '1.5rem', border: '2px dashed var(--border)' }}>
                 <Sparkles size={40} color="var(--text-muted)" />
                 <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Your hero journey starts here. Add your first score.</p>
              </div>
            ) : (
              scores.map((s, idx) => (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex justify-between align-center" 
                  style={{ 
                    padding: '1.25rem 2rem', 
                    background: idx === 0 ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-secondary)', 
                    borderRadius: '1rem',
                    border: '1px solid',
                    borderColor: idx === 0 ? 'rgba(16, 185, 129, 0.2)' : 'transparent'
                  }}
                >
                  <div className="flex align-center gap-5">
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: idx === 0 ? 'var(--accent-primary)' : '#fff', 
                      color: idx === 0 ? '#fff' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      boxShadow: idx === 0 ? '0 4px 12px var(--accent-glow)' : 'var(--shadow-sm)'
                    }}>
                      {s.score}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Verification Pending</div>
                    </div>
                  </div>
                  {idx === 0 && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: 'var(--accent-primary)', 
                      color: '#fff', 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '100px', 
                      fontWeight: 800,
                      letterSpacing: '0.05em'
                    }}>
                      LATEST
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .focus-emerald:focus {
           border-color: var(--accent-primary) !important;
           outline: none;
           background: #fff !important;
           box-shadow: 0 0 0 4px var(--accent-glow);
        }
      `}</style>
    </div>
  );
}
