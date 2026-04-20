'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Heart, Target, ArrowRight, ShieldCheck, Zap, Globe, MessageSquare, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do the monthly draws work?", a: "Every month, we run an automated draw. If your last 5 golf scores match the winning numbers (3, 4, or 5 matches), you win a share of the prize pool!" },
    { q: "Which charities can I support?", a: "You can choose from our verified directory of charities. 10% of your subscription goes directly to them, and you can increase this percentage in your dashboard." },
    { q: "Can I enter more than 5 scores?", a: "The platform only retains your latest 5 scores. Adding a new score automatically replaces the oldest entry to keep your profile current." },
    { q: "How are winners verified?", a: "Winners must upload a screenshot of their scores from their official golf platform. Our admins verify the proof before processing the payout." }
  ];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Mesh Gradient Background - Simplified for White Theme */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '120%',
        height: '120%',
        background: `
          radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.05) 0%, transparent 40%)
        `,
        zIndex: 0,
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* Navigation */}
      <nav className="container flex justify-between align-center p-8" style={{ position: 'relative', zIndex: 10 }}>
        <div className="flex align-center gap-3">
          <div style={{ background: 'var(--accent-primary)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px var(--accent-glow)' }}>
            <Target size={24} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>DIGITAL HEROES</span>
        </div>
        <div className="flex gap-8 align-center">
          <div className="hidden-mobile flex gap-6">
            <Link href="/charity" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Charities</Link>
            <Link href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Mechanics</Link>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>Login</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '0.6rem 1.8rem', fontSize: '0.9rem' }}>Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container flex flex-column align-center" style={{ minHeight: '85vh', textAlign: 'center', paddingTop: '8rem', position: 'relative', zIndex: 1 }}>
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           style={{ marginBottom: '2rem' }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(16, 185, 129, 0.05)', 
            padding: '0.6rem 1.2rem', 
            borderRadius: '100px', 
            border: '1px solid rgba(16, 185, 129, 0.1)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            marginBottom: '2.5rem'
          }}>
            <Zap size={14} fill="currentColor" /> PREMIUM GOLF PERFORMANCE PLATFORM
          </div>
          <h1 style={{ marginBottom: '1.5rem', fontSize: 'clamp(3.5rem, 9vw, 6.5rem)', fontWeight: 900, letterSpacing: '-3.5px', color: 'var(--text-primary)' }}>
            SWING FOR <span style={{ color: 'var(--accent-primary)' }}>CHANGE</span><br />
            PLAY FOR <span style={{ color: 'var(--accent-secondary)' }}>PURPOSE</span>
          </h1>
          <p style={{ maxWidth: '750px', margin: '0 auto 3.5rem', fontSize: '1.35rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
            The exclusive community where golfers track their game to fuel verifiable charity projects. 
            Impact hundreds of lives with every scorecard.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/signup" className="btn-primary" style={{ padding: '1.3rem 3.5rem', fontSize: '1.1rem', borderRadius: '14px' }}>
              ACTIVATE HERO PASS <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: '1.3rem 3.5rem', fontSize: '1.1rem', borderRadius: '14px' }}>
              INSTANT PASS
            </Link>
          </div>
        </motion.div>

        {/* Global Impact Counter */}
        <div style={{ marginTop: '5rem', display: 'flex', gap: '6rem', justifyContent: 'center' }}>
           <div className="stat-item">
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)' }}>£1.2M+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Total Impact</div>
           </div>
           <div className="stat-item">
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)' }}>14,200</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Active Players</div>
           </div>
           <div className="stat-item">
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)' }}>£450K</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Reward Pool</div>
           </div>
        </div>
      </section>

      {/* Trust Ticker */}
      <div style={{ background: 'var(--bg-secondary)', padding: '2.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
         <div className="flex gap-16 align-center justify-center opacity-40" style={{ whiteSpace: 'nowrap' }}>
            {['UNICEF', 'RED CROSS', 'GOLF FOUNDATION', 'GREEN PEACE', 'VETERANS AID', 'WILDLIFE TRUST'].map(partner => (
               <div key={partner} style={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: '6px', color: 'var(--text-primary)' }}>{partner}</div>
            ))}
         </div>
      </div>

      {/* Mechanics Section */}
      <section id="how-it-works" className="container" style={{ padding: '12rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '7rem' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>How It Works</h2>
          <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.2rem', fontWeight: 500 }}>A seamless fusion of performance tracking and altruism.</p>
        </div>

        <div className="grid-3 gap-6">
          {[
            {
              icon: <Zap size={36} color="var(--accent-primary)" />,
              title: "Proprietary Algorithm",
              desc: "Our engine uses your rolling 5-score average to create personalized participation draws."
            },
            {
              icon: <ShieldCheck size={36} color="var(--accent-primary)" />,
              title: "Transparent Giving",
              desc: "100% verifiable impact. Track every pound from your subscription to the final charity ledger."
            },
            {
              icon: <Globe size={36} color="var(--accent-secondary)" />,
              title: "Global Projects",
              desc: "Contribute to humanitarian aid, environmental restoration, and social golf initiatives worldwide."
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -12, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel"
              style={{ padding: '3.5rem', textAlign: 'left', background: '#fff' }}
            >
              <div style={{ marginBottom: '2.5rem' }}>{item.icon}</div>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.6rem', color: 'var(--text-primary)' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container" style={{ padding: '0 2rem 12rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '6rem' }}>
          <div>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '2rem', textAlign: 'left', color: 'var(--text-primary)' }}>Common<br />Concerns</h2>
            <div className="flex align-center gap-3 text-muted" style={{ fontWeight: 600 }}>
              <MessageSquare size={20} />
              <span>Have more questions? <Link href="/contact" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Talk to us</Link></span>
            </div>
          </div>
          <div className="flex flex-column gap-5">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="glass-panel" 
                style={{ cursor: 'pointer', overflow: 'hidden', background: activeFaq === i ? 'var(--bg-secondary)' : '#fff' }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex justify-between align-center" style={{ padding: '1.75rem 2.5rem' }}>
                   <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{faq.q}</span>
                   <ChevronDown size={22} color="var(--text-muted)" style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: '0.4s' }} />
                </div>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ padding: '0 2.5rem 2rem', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '0 0 10rem' }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: '7rem 4rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)', borderRadius: '48px', border: 'none' }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '2rem', color: 'var(--text-primary)' }}>Become a Hero Today.</h2>
            <p style={{ marginBottom: '3.5rem', maxWidth: '650px', margin: '0 auto 3.5rem', color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>
              Join the elite league of golfers who measure their success by the lives they touch.
            </p>
            <Link href="/signup" className="btn-primary" style={{ padding: '1.6rem 5.5rem', fontSize: '1.25rem', borderRadius: '16px' }}>
              START YOUR SUBSCRIPTION
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container" style={{ padding: '5rem 2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>
        <div className="flex justify-between align-center">
          <div className="flex align-center gap-3">
             <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
             <span>© 2026 DIGITAL HEROES WORLDWIDE.</span>
          </div>
          <div className="flex gap-10">
            <Link href="/terms" className="hover-primary transition-all">Terms of Service</Link>
            <Link href="/privacy" className="hover-primary transition-all">Privacy Policy</Link>
            <Link href="/contact" className="hover-primary transition-all">Support</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); }
        .hover-primary:hover { color: var(--accent-primary); }
        @media (max-width: 968px) {
           .grid-3 { grid-template-columns: 1fr; }
           .hidden-mobile { display: none; }
        }
      `}</style>
    </main>
  );
}
