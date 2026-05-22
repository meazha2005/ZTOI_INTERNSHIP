"use client";

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';;
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wifi,
  Code2,
  Award,
  ArrowRight,
  CheckCircle,
  Brain,
  Globe,
  Terminal,
  ChevronDown,
} from 'lucide-react';

const BRAND = '#FF4D00';

// Domains fetched from API

const steps = [
  { num: '01', title: 'Register', desc: 'Sign up with your details and choose your domain of interest.' },
  { num: '02', title: 'Get Tasks', desc: '2 real-world tasks are auto-assigned from your chosen domain.' },
  { num: '03', title: 'Complete Tasks', desc: 'Submit your work as ZIP files. Get reviewed by our mentors.' },
  { num: '04', title: 'Get Certified', desc: 'Pay ₹499 and receive your industry-recognized certificate.' },
];

const benefits = [
  { icon: Wifi, title: 'Online & Flexible', desc: 'Work from anywhere, at your own pace. No fixed schedule required.' },
  { icon: Code2, title: 'Real Projects', desc: 'Hands-on tasks that mirror real industry challenges and workflows.' },
  { icon: Award, title: 'Industry Certificate', desc: 'Earn a recognized certificate to boost your career prospects.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const domainsRef = useRef<HTMLDivElement>(null);
  const [fetchedDomains, setFetchedDomains] = useState<{ id: string; name: string; description: string }[]>([]);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        if (data.domains) setFetchedDomains(data.domains);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,77,0,0.15)' }}>
        <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.08em' }}>
          ZTOI TECH
        </span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-white/70 hover:text-white text-sm transition-colors hidden sm:block">
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            Apply Now
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{ background: '#0A0A0A' }}>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                style={{ borderColor: `${BRAND}40`, color: BRAND, background: `${BRAND}10`, fontFamily: 'var(--font-michroma)', letterSpacing: '0.1em' }}>
                ONLINE INTERNSHIP PROGRAM
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: 'var(--font-michroma)', letterSpacing: '-0.02em' }}
            >
              Launch Your{' '}
              <span style={{ color: BRAND }}>Tech Career</span>
              <br />
              with ZTOI TECH
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Join our online internship program. Work on real projects, get mentored by industry experts,
              and earn a recognized certificate — all from the comfort of your home.
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded text-white font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
                style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
              >
                Apply Now — It's Free
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => domainsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 rounded text-white font-semibold text-sm border border-white/20 hover:border-white/40 transition-all"
                style={{ fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
              >
                Explore Domains
              </button>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-12 flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: BRAND }} />
                <span>100% Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: BRAND }} />
                <span>Online & Flexible</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: BRAND }} />
                <span>Certificate on Completion</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-white/30" />
        </motion.div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: BRAND, fontFamily: 'var(--font-michroma)' }}>
              Why Choose Us
            </motion.p>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>
              Why ZTOI Tech Internship?
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-8 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: `${BRAND}15` }}>
                  <b.icon size={28} style={{ color: BRAND }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>{b.title}</h3>
                <p className="text-gray-500 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section ref={domainsRef} className="py-24 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: BRAND, fontFamily: 'var(--font-michroma)' }}>
              Choose Your Path
            </motion.p>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-michroma)' }}>
              Internship Domains
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-white/50 mt-4 max-w-xl mx-auto">
              Select the domain that aligns with your career goals. Each program is designed with industry-relevant tasks.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {fetchedDomains.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -8, borderColor: BRAND }}
                className="p-8 rounded-xl border border-white/10 transition-all duration-300 group"
                style={{ background: '#161616' }}
              >
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>{d.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">{d.description}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-semibold text-white transition-all hover:opacity-90 w-full justify-center"
                  style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.7rem', letterSpacing: '0.05em' }}
                >
                  Enroll Now
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: BRAND, fontFamily: 'var(--font-michroma)' }}>
              Simple Process
            </motion.p>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>
              How It Works
            </motion.h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5 bg-gray-100" />
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5"
              style={{ background: `linear-gradient(to right, ${BRAND}, ${BRAND}40)` }} />

            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                    style={{ background: i === 0 ? BRAND : '#fff', border: `2px solid ${i === 0 ? BRAND : '#e5e5e5'}` }}>
                    <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-michroma)', color: i === 0 ? '#fff' : BRAND }}>
                      {s.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-michroma)' }}>{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATE PREVIEW ── */}
      <section className="py-24 px-6" style={{ background: '#F8F8F8' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-12"
          >
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: BRAND, fontFamily: 'var(--font-michroma)' }}>
              Your Achievement
            </motion.p>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>
              Earn Your Certificate
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-gray-500 mt-4 max-w-xl mx-auto">
              Complete all tasks and pay ₹499 to unlock your industry-recognized internship certificate.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            {/* Professional Certificate */}
            <div 
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{ aspectRatio: '1.3', maxWidth: '100%', margin: '0 auto' }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                background: '#FDFCFA',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}>
                {/* Top accent bar */}
                <div style={{ height: '2%', background: `linear-gradient(90deg, ${BRAND} 0%, #FF8C00 100%)`, flexShrink: 0 }} />

                {/* Main content area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6% 8% 5%' }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4%' }}>
                    {/* Company branding */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4%' }}>
                      <img src="/assets/logo.png" alt="ZTOI TECH Logo" style={{ height: 'clamp(40px, 6vw, 56px)', width: 'auto' }} />
                      <div>
                        <div style={{
                          fontFamily: "'Michroma', 'Arial Black', Arial, sans-serif",
                          fontWeight: 900,
                          fontSize: 'clamp(16px, 3vw, 24px)',
                          letterSpacing: '0.18em',
                          color: BRAND,
                          lineHeight: 1,
                        }}>
                          ZTOI TECH
                        </div>
                        <div style={{
                          fontSize: 'clamp(7px, 1vw, 9px)',
                          letterSpacing: '0.25em',
                          color: '#999',
                          textTransform: 'uppercase',
                          marginTop: 4,
                          fontFamily: "'Michroma', Arial, sans-serif",
                        }}>
                          Empowering Future Innovators
                        </div>
                      </div>
                    </div>

                    {/* Certificate label */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 'clamp(7px, 1vw, 9px)',
                        letterSpacing: '0.3em',
                        color: '#999',
                        textTransform: 'uppercase',
                        fontFamily: "'Michroma', Arial, sans-serif",
                      }}>
                        Certificate No.
                      </div>
                      <div style={{
                        fontFamily: "'Michroma', monospace",
                        fontSize: 'clamp(8px, 1.2vw, 11px)',
                        color: '#555',
                        marginTop: 2,
                      }}>
                        ZTOI-XXXX-XXXXXX
                      </div>
                    </div>
                  </div>

                  {/* Thin divider */}
                  <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4C5B0, transparent)', marginBottom: '4%' }} />

                  {/* Center body */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'clamp(8px, 1.2vw, 11px)',
                      color: '#888',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontFamily: "'Michroma', Arial, sans-serif",
                      marginBottom: '2%',
                    }}>
                      This is to certify that
                    </div>

                    <div style={{
                      fontSize: 'clamp(18px, 3.5vw, 30px)',
                      color: '#1A1A1A',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      lineHeight: 1.1,
                      marginBottom: '2.5%',
                      fontStyle: 'italic',
                      fontFamily: "'Michroma', serif",
                    }}>
                      Your Name XXX
                    </div>

                    <div style={{
                      width: '8%',
                      height: 2,
                      background: BRAND,
                      marginBottom: '2.5%',
                    }} />

                    <div style={{
                      fontSize: 'clamp(8px, 1.1vw, 11px)',
                      color: '#777',
                      maxWidth: '55%',
                      lineHeight: 1.7,
                      fontFamily: "'Michroma', Arial, sans-serif",
                      marginBottom: '2%',
                    }}>
                      has successfully completed the internship program and demonstrated exceptional skills and dedication in the domain of
                    </div>

                    <div style={{
                      fontFamily: "'Michroma', 'Arial Black', Arial, sans-serif",
                      fontWeight: 900,
                      fontSize: 'clamp(11px, 2vw, 17px)',
                      letterSpacing: '0.25em',
                      color: BRAND,
                      textTransform: 'uppercase',
                    }}>
                      Web Development with AI
                    </div>
                  </div>

                  {/* Thin divider */}
                  <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4C5B0, transparent)', margin: '4% 0 3%' }} />

                  {/* Footer row */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    {/* Left: QR */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        padding: 6,
                        background: '#fff',
                        border: '1px solid #E5DDD0',
                        borderRadius: 4,
                      }}>
                        <QRCodeSVG value="https://ztoitech.com" size={88} level="H" />
                      </div>
                      <div style={{
                        fontSize: 'clamp(6px, 0.9vw, 8px)',
                        letterSpacing: '0.18em',
                        color: '#6e6e6e',
                        textTransform: 'uppercase',
                        fontFamily: "'Michroma', Arial, sans-serif",
                      }}>
                        Scan to Verify
                      </div>
                    </div>

                    {/* Right: Authorized By */}
                    <div style={{ minWidth: '22%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {/* Signature image */}
                      <img src="/assets/signature.png" alt="Signature" style={{ height: 'clamp(28px, 4.5vw, 50px)', width: 'auto', marginBottom: 6 }} />
                      <div style={{
                        fontSize: 'clamp(7px, 1vw, 9px)',
                        letterSpacing: '0.2em',
                        color: '#888',
                        textTransform: 'uppercase',
                        fontFamily: "'Michroma', Arial, sans-serif",
                        marginBottom: 3,
                      }}>
                        Authorized By
                      </div>
                      <div style={{
                        fontSize: 'clamp(9px, 1.3vw, 13px)',
                        color: '#1A1A1A',
                        fontWeight: 600,
                        fontFamily: "'Michroma', Arial, sans-serif",
                      }}>
                        ZTOI TECH Founder
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom accent bar */}
                <div style={{ height: '1.5%', background: `linear-gradient(90deg, ${BRAND} 0%, #FF8C00 100%)`, flexShrink: 0 }} />

                {/* Subtle watermark pattern */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 40px,
                    rgba(255,77,0,0.018) 40px,
                    rgba(255,77,0,0.018) 41px
                  )`,
                  pointerEvents: 'none',
                }} />
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-500 mb-4">Complete 2 tasks + Pay ₹499 to unlock your certificate</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
              >
                Start Your Journey
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6" style={{ background: BRAND }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }} className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-michroma)' }}>
              Ready to Launch Your Career?
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-white/80 text-lg mb-8">
              Join hundreds of students who have already started their tech journey with ZTOI Tech.
            </motion.p>
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded bg-white font-semibold text-sm transition-all hover:bg-gray-100"
                style={{ color: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
              >
                Register Now — Free
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6" style={{ background: '#0A0A0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                ZTOI TECH
              </span>
              <p className="text-white/40 text-sm mt-2 max-w-xs">
                Empowering students with real-world tech skills through our online internship program.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 sm:gap-12">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>Program</p>
                <div className="flex flex-col gap-2">
                  <Link href="/register" className="text-white/40 hover:text-white text-sm transition-colors">Apply Now</Link>
                  <Link href="/login" className="text-white/40 hover:text-white text-sm transition-colors">Student Login</Link>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>Domains</p>
                <div className="flex flex-col gap-2">
                  {fetchedDomains.map(d => (
                    <span key={d.id} className="text-white/40 text-sm">{d.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">© 2026 ZTOI Tech. All rights reserved.</p>
            <p className="text-white/30 text-sm">internship.ztoitech.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
