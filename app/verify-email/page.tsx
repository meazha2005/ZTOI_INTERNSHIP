"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';;
import { motion } from 'motion/react';
import { Mail, RefreshCw, CheckCircle, XCircle, Edit2, Send } from 'lucide-react';

const BRAND = '#FF4D00';

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'pending'
  );
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeError, setChangeError] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('verify_email');
      const storedPassword = sessionStorage.getItem('verify_password');
      if (storedEmail) setCurrentEmail(storedEmail);
      if (storedPassword) setPassword(storedPassword);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetch('/api/student/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) setStatus('success');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
    }
  }, [token]);

  const handleResend = async () => {
    if (!currentEmail) return;
    setResending(true);
    try {
      await fetch('/api/student/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail })
      });
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    if (!newEmail || !password) return;
    
    setUpdating(true);
    try {
      const res = await fetch('/api/student/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail,
          password: location.state.password,
          newEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentEmail(newEmail);
        setChangingEmail(false);
        setNewEmail('');
      } else {
        setChangeError(data.error || 'Failed to update email');
      }
    } catch (err) {
      setChangeError('An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F8F8' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
          <Link href="/" className="block mb-8">
            <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.08em' }}>
              ZTOI TECH
            </span>
          </Link>

          {status === 'verifying' && (
            <div className="py-8">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>Verifying your email...</h1>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50"
              >
                <CheckCircle size={36} className="text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>
                Email Verified!
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Your account is now fully active. You can log in to access your student dashboard.
              </p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50"
              >
                <XCircle size={36} className="text-red-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>
                Verification Failed
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                The verification link is invalid or has expired.
              </p>
            </div>
          )}

          {status === 'pending' && (
            <>
              {changingEmail ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>
                    Change Email
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Enter your new email address. We will send a verification link to the new address.
                  </p>

                  <form onSubmit={handleChangeEmail} className="flex flex-col gap-4 text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">New Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new@example.com"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ '--tw-ring-color': BRAND } as React.CSSProperties}
                      />
                    </div>
                    
                    {changeError && (
                      <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
                        {changeError}
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => { setChangingEmail(false); setChangeError(''); }}
                        className="flex-1 py-3 rounded-lg text-gray-600 font-semibold text-sm bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 py-3 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: BRAND, fontFamily: 'var(--font-michroma)' }}
                      >
                        {updating ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><Send size={14} /> Update</>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: `${BRAND}15` }}
                  >
                    <Mail size={36} style={{ color: BRAND }} />
                  </motion.div>

                  <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>
                    Check Your Email
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    We've sent a confirmation link to your email address. Please click the link to verify your account and get started.
                  </p>

                  {currentEmail && (
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 mb-6 text-left">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sent to</p>
                      <p className="font-semibold text-gray-800 text-sm flex items-center justify-between">
                        {currentEmail}
                        {password && (
                          <button
                            onClick={() => setChangingEmail(true)}
                            className="text-xs flex items-center gap-1 hover:underline"
                            style={{ color: BRAND }}
                          >
                            <Edit2 size={12} /> Change
                          </button>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleResend}
                      disabled={!currentEmail || resending || resent}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ borderColor: BRAND, color: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em', fontSize: '0.75rem' }}
                    >
                      {resending ? (
                        <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                      ) : resent ? (
                        <CheckCircle size={14} />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {resending ? 'Sending...' : resent ? 'Email Sent!' : 'Resend Email'}
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Already verified?{' '}
                      <Link href="/login" className="font-semibold hover:underline" style={{ color: BRAND }}>
                        Login here
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F8F8' }}>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

