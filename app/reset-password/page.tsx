"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';;
import { motion } from 'motion/react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const BRAND = '#FF4D00';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/student/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F8F8' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>Invalid Link</h1>
          <p className="text-gray-500 mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-sm font-semibold hover:underline" style={{ color: BRAND }}>
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F8F8' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <Link href="/">
              <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                ZTOI TECH
              </span>
            </Link>
          </div>

          {!success ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>
                  Reset Password
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-michroma)' }}>
                Password Updated!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been changed successfully. You can now log in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
              >
                Go to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8F8F8' }}>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

