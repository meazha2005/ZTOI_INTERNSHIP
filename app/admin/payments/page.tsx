"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Award, X, ExternalLink, RefreshCw, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

const BRAND = '#FF4D00';

interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  photo_path: string | null;
  domain: string;
  amount: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: 'pending' | 'verified' | 'rejected';
  certificate_generated: number;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  cert_number: string | null;
  cert_issued_at: string | null;
}

function RejectModal({ payment, onClose, onConfirm }: {
  payment: Payment;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
            Reject Payment
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="font-bold text-gray-900 text-sm">{payment.student_name}</p>
          <p className="text-xs text-gray-500">{payment.domain}</p>
          <p className="text-xs text-gray-500 mt-1">Order: <span className="font-mono">{payment.razorpay_order_id}</span></p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Rejection Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Payment amount mismatch, suspicious transaction…"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
            style={{ focusRingColor: BRAND } as React.CSSProperties}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <><XCircle size={14} /> Reject Payment</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function GenerateCertModal({ payment, onClose, onGenerate }: {
  payment: Payment;
  onClose: () => void;
  onGenerate: (id: number) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [certNumber, setCertNumber] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}/generate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenerated(true);
        setCertNumber(data.certNumber);
        onGenerate(payment.id);
      } else {
        alert(data.error || 'Failed to generate certificate.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
            Generate Certificate
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {!generated ? (
          <>
            <div className="p-4 bg-gray-50 rounded-xl mb-5">
              <div className="flex items-center gap-3 mb-3">
                {payment.photo_path ? (
                  <img src={payment.photo_path} alt={payment.student_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">
                    {payment.student_name[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{payment.student_name}</p>
                  <p className="text-sm text-gray-500">{payment.student_email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Domain</p>
                  <p className="font-semibold text-gray-800">{payment.domain}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Amount Paid</p>
                  <p className="font-semibold" style={{ color: BRAND }}>₹{payment.amount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Razorpay Order</p>
                  <p className="font-mono text-xs text-gray-700">{payment.razorpay_order_id}</p>
                </div>
                {payment.razorpay_payment_id && (
                  <div>
                    <p className="text-gray-400 text-xs">Payment ID</p>
                    <p className="font-mono text-xs text-gray-700">{payment.razorpay_payment_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="border-2 rounded-xl p-5 mb-5" style={{ borderColor: BRAND }}>
              <div className="text-center">
                <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1rem', fontWeight: 700 }}>
                  ZTOI TECH
                </span>
                <p className="text-gray-400 text-xs mt-1 mb-3">Certificate of Completion</p>
                <p className="text-gray-500 text-xs mb-1">This certifies that</p>
                <p className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
                  {payment.student_name}
                </p>
                <p className="text-gray-500 text-xs mt-1">has completed the internship in</p>
                <p className="font-bold mt-1" style={{ color: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.8rem' }}>
                  {payment.domain}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
              >
                {generating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Award size={14} /> Generate Certificate</>
                )}
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2" style={{ fontFamily: 'var(--font-michroma)' }}>
              Certificate Generated!
            </h3>
            <p className="text-gray-500 text-sm mb-2">
              The certificate for <strong>{payment.student_name}</strong> has been generated.
            </p>
            <p className="text-xs text-gray-400 font-mono mb-6">{certNumber}</p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90"
              style={{ background: BRAND }}
            >
              Done
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectModal, setRejectModal] = useState<Payment | null>(null);
  const [certModal, setCertModal] = useState<Payment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/payments');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load payments. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleReject = async (paymentId: number, reason: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        await fetchPayments();
        setRejectModal(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject payment.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCertGenerated = async (_id: number) => {
    await fetchPayments();
  };

  const stats = [
    { label: 'Total Payments', value: payments.length, color: '#3B82F6' },
    { label: 'Pending Review', value: payments.filter((p) => p.status === 'pending').length, color: BRAND },
    { label: 'Verified (Razorpay)', value: payments.filter((p) => p.status === 'verified').length, color: '#10B981' },
    { label: 'Certificates Issued', value: payments.filter((p) => p.certificate_generated).length, color: '#8B5CF6' },
  ];

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.student_name.toLowerCase().includes(q) && !p.student_email.toLowerCase().includes(q) && !p.domain.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>
                Payments &amp; Certificates
              </h1>
              <p className="text-gray-500 text-sm mt-1">Review Razorpay payments and issue completion certificates.</p>
            </div>
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-michroma)', color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Error state */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-center gap-3 mb-5">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payments Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>
                  Payment Submissions ({filteredPayments.length})
                </h2>
                {loading && (
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{ width: '220px', focusRingColor: BRAND } as React.CSSProperties}
                  />
                </div>
                <div className="relative">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && payments.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND }} />
                  <p className="text-gray-400 text-sm">Loading payments…</p>
                </div>
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Award size={32} className="text-gray-200" />
                <p className="text-gray-400 text-sm">No payments submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Razorpay IDs</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            {p.photo_path ? (
                              <img src={p.photo_path} alt={p.student_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0">
                                {p.student_name[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{p.student_name}</p>
                              <p className="text-xs text-gray-400">{p.student_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 max-w-[120px] truncate">{p.domain}</td>
                        <td className="px-5 py-4 text-sm font-bold" style={{ color: BRAND, fontFamily: 'var(--font-michroma)' }}>
                          ₹{p.amount}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="text-gray-300">Order:</span>
                              <span className="font-mono text-gray-600">{p.razorpay_order_id.slice(0, 18)}…</span>
                              <a
                                href={`https://dashboard.razorpay.com/app/orders/${p.razorpay_order_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-600"
                              >
                                <ExternalLink size={10} />
                              </a>
                            </div>
                            {p.razorpay_payment_id && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="text-gray-300">Pay:</span>
                                <span className="font-mono text-gray-600">{p.razorpay_payment_id.slice(0, 16)}…</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{p.submitted_at}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                              p.status === 'verified' ? 'bg-green-50 text-green-600' :
                              p.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-yellow-50 text-yellow-600'
                            }`}>
                              {p.status === 'pending' ? 'Pending' : p.status === 'verified' ? 'Verified ✓' : 'Rejected'}
                            </span>
                            {p.certificate_generated ? (
                              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                                <Award size={10} /> Cert Issued
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            {/* Pending: payment verified by Razorpay but admin hasn't acted yet (shouldn't happen with auto-verify) */}
                            {p.status === 'pending' && (
                              <div className="flex items-center gap-1 text-xs text-yellow-600">
                                <Clock size={12} />
                                Awaiting payment
                              </div>
                            )}

                            {/* Verified: generate cert or reject */}
                            {p.status === 'verified' && !p.certificate_generated && (
                              <div className="flex flex-col gap-1.5">
                                <button
                                  onClick={() => setCertModal(p)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-all"
                                  style={{ background: BRAND }}
                                >
                                  <Award size={12} />
                                  Generate Cert
                                </button>
                                <button
                                  onClick={() => setRejectModal(p)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                                >
                                  <XCircle size={12} />
                                  Reject
                                </button>
                              </div>
                            )}

                            {/* Certificate issued */}
                            {p.certificate_generated && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                <CheckCircle size={12} />
                                {p.cert_number || 'Issued'}
                              </span>
                            )}

                            {/* Rejected */}
                            {p.status === 'rejected' && !p.certificate_generated && (
                              <span className="text-xs text-gray-400">Rejected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <RejectModal
            payment={rejectModal}
            onClose={() => setRejectModal(null)}
            onConfirm={(reason) => handleReject(rejectModal.id, reason)}
          />
        )}
      </AnimatePresence>

      {/* Generate Certificate Modal */}
      <AnimatePresence>
        {certModal && (
          <GenerateCertModal
            payment={certModal}
            onClose={() => setCertModal(null)}
            onGenerate={handleCertGenerated}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
