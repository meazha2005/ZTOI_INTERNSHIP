"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';;
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Award, ShieldCheck, ShieldX, Loader } from 'lucide-react';

const BRAND = '#FF4D00';

interface VerifyResult {
  valid: boolean;
  cert_number?: string;
  student_name?: string;
  student_email?: string;
  domain?: string;
  issued_at?: string;
  error?: string;
}

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const certNumber = searchParams.get('cert') || '';
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certNumber) {
      setResult({ valid: false, error: 'No certificate number provided.' });
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/public/verify-certificate?cert=${encodeURIComponent(certNumber)}`);
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({ valid: false, error: 'Failed to reach verification server. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [certNumber]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#F4F4F4' }}>
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.15em' }}>
            ZTOI TECH
          </span>
        </Link>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-[0.3em]">Certificate Verification</p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${BRAND}, #ff8c00)` }} />

        <div className="p-8 md:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader size={36} className="animate-spin" style={{ color: BRAND }} />
              <p className="text-gray-500 text-sm">Verifying certificate <strong className="text-gray-700">{certNumber}</strong>…</p>
            </div>
          ) : result?.valid ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
              {/* Valid badge */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: `${BRAND}15` }}>
                <ShieldCheck size={40} style={{ color: BRAND }} />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] mb-2" style={{ color: BRAND }}>Verified & Authentic</span>
              <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-michroma)' }}>
                Valid Certificate
              </h1>
              <p className="text-gray-500 text-sm mb-8">This certificate is genuine and has been issued by ZTOI TECH.</p>

              {/* Details */}
              <div className="w-full bg-gray-50 rounded-xl p-6 text-left space-y-4 border border-gray-100">
                <DetailRow label="Student Name" value={result.student_name!} />
                <DetailRow label="Domain / Programme" value={result.domain!} />
                <DetailRow label="Certificate ID" value={result.cert_number!} mono />
                <DetailRow label="Date of Issue" value={result.issued_at!} />
              </div>

              <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-2.5 text-sm font-medium w-full justify-center">
                <CheckCircle size={16} />
                Certificate successfully verified
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-red-50">
                <ShieldX size={40} className="text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-michroma)' }}>
                Invalid Certificate
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                {result?.error || 'This certificate could not be verified. It may be invalid, expired, or the ID is incorrect.'}
              </p>
              {certNumber && (
                <div className="w-full bg-gray-50 rounded-xl p-4 text-left border border-gray-100 mb-6">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Queried Certificate ID</p>
                  <p className="font-mono text-sm text-gray-700">{certNumber}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-2.5 text-sm font-medium w-full justify-center">
                <XCircle size={16} />
                Certificate not found or not valid
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 md:px-10 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            For queries, contact +91 8525020012
          </p>
        </div>
      </motion.div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} ZTOI TECH · All rights reserved
      </p>
    </div>
  );
}

function DetailRow({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold flex items-center gap-1">
        {icon}{label}
      </p>
      <p className={`text-sm font-semibold text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

export default function VerifyCertificate() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F4F4F4' }}>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <VerifyCertificateContent />
    </Suspense>
  );
}

