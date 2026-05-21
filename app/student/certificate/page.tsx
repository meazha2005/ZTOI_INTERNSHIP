"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Award, CheckCircle, XCircle, Clock, AlertCircle, Download, Laptop } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import StudentLayout from '@/layouts/StudentLayout';
import { useAuth } from '@/lib/auth-context';

const BRAND = '#FF4D00';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
}

interface Payment {
  id: number;
  amount: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: 'pending' | 'verified' | 'rejected';
  certificate_generated: number;
  submitted_at: string;
}

interface Certificate {
  cert_number: string;
  issued_at: string;
}

interface CertificateData {
  student: {
    id: number;
    name: string;
    email: string;
    phone: string;
    domain: string;
    tasksCompleted: number;
    certificateStatus: 'locked' | 'payment_pending' | 'under_review' | 'issued';
    referralCode?: string;
    referredById?: number | null;
    verifiedReferralsCount?: number;
  };
  tasks: Task[];
  payment: Payment | null;
  certificate: Certificate | null;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ----------- Name font-size helper -----------
function getNameFontSize(name: string, forPrint: boolean): string {
  const len = name.length;
  if (forPrint) {
    // print sizes (px)
    if (len <= 12) return '28px';
    if (len <= 18) return '23px';
    if (len <= 24) return '18px';
    return '15px';
  } else {
    // responsive clamp sizes
    if (len <= 12) return 'clamp(18px, 3.5vw, 30px)';
    if (len <= 18) return 'clamp(15px, 2.8vw, 24px)';
    if (len <= 24) return 'clamp(13px, 2.2vw, 20px)';
    return 'clamp(11px, 1.8vw, 17px)';
  }
}

// ----------- Certificate Component (used for both preview & PDF) -----------
function CertificateCard({
  student,
  certificate,
  forPrint = false,
}: {
  student: CertificateData['student'];
  certificate: Certificate | null;
  forPrint?: boolean;
}) {
  const verifyUrl = certificate
    ? `${window.location.origin}/verify?cert=${certificate.cert_number}`
    : '';

  return (
    <div
      style={{
        width: forPrint ? '297mm' : '100%',
        height: forPrint ? '210mm' : undefined,
        aspectRatio: forPrint ? undefined : '1.414',
        background: '#FDFCFA',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${BRAND} 0%, #FF8C00 100%)`, flexShrink: 0 }} />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: forPrint ? '28px 48px 24px' : '6% 8% 5%' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: forPrint ? 20 : '4%' }}>
          {/* Company branding with logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: forPrint ? 16 : '4%' }}>
            <img 
              src="/assets/logo.png" 
              alt="ZTOI TECH Logo" 
              style={{ 
                height: forPrint ? '67px' : 'clamp(48px, 7.5vw, 67px)', 
                width: 'auto',
                paddingTop: '12px'
              }} 
            />
          <div>
              <div style={{
                fontFamily: "'Michroma', 'Arial Black', Arial, sans-serif",
                fontWeight: 900,
                fontSize: forPrint ? '22px' : 'clamp(16px, 3vw, 24px)',
                letterSpacing: '0.18em',
                color: BRAND,
                lineHeight: 1,
              }}>
                ZTOI TECH
              </div>
              <div style={{
                fontSize: forPrint ? '8px' : 'clamp(7px, 1vw, 9px)',
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
              fontSize: forPrint ? '8px' : 'clamp(7px, 1vw, 9px)',
              letterSpacing: '0.3em',
              color: '#999',
              textTransform: 'uppercase',
              fontFamily: "'Michroma', Arial, sans-serif",
            }}>
              Certificate No.
            </div>
            <div style={{
              fontFamily: "'Michroma', monospace",
              fontSize: forPrint ? '10px' : 'clamp(8px, 1.2vw, 11px)',
              color: '#555',
              marginTop: 2,
            }}>
              {certificate?.cert_number || '—'}
            </div>
          </div>
        </div>

        {/* Thin divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4C5B0, transparent)', marginBottom: forPrint ? 20 : '4%' }} />

        {/* Center body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{
            fontSize: forPrint ? '9px' : 'clamp(8px, 1.2vw, 11px)',
            color: '#888',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: "'Michroma', Arial, sans-serif",
            marginBottom: forPrint ? 10 : '2%',
          }}>
            This is to certify that
          </div>

          <div style={{
            fontSize: getNameFontSize(student.name, forPrint),
            color: '#1A1A1A',
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: forPrint ? 16 : '2.5%',
            fontStyle: 'italic',
            fontFamily: "'Michroma', serif",
          }}>
            {student.name}
          </div>

          <div style={{
            width: forPrint ? 60 : '8%',
            height: 2,
            background: BRAND,
            marginBottom: forPrint ? 16 : '2.5%',
          }} />

          <div style={{
            fontSize: forPrint ? '9px' : 'clamp(8px, 1.1vw, 11px)',
            color: '#777',
            maxWidth: forPrint ? 340 : '55%',
            lineHeight: 1.7,
            fontFamily: "'Michroma', Arial, sans-serif",
            marginBottom: forPrint ? 14 : '2%',
          }}>
            has successfully completed the internship program and demonstrated
            exceptional skills and dedication in the domain of
          </div>

          <div style={{
            fontFamily: "'Michroma', 'Arial Black', Arial, sans-serif",
            fontWeight: 900,
            fontSize: forPrint ? '15px' : 'clamp(11px, 2vw, 17px)',
            letterSpacing: '0.25em',
            color: BRAND,
            textTransform: 'uppercase',
          }}>
            {student.domain}
          </div>
        </div>

        {/* Thin divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4C5B0, transparent)', margin: `${forPrint ? '20px' : '4%'} 0 ${forPrint ? '16px' : '3%'}` }} />

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>

          {/* Left: QR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {certificate ? (
              <div style={{
                padding: 6,
                background: '#fff',
                border: '1px solid #E5DDD0',
                borderRadius: 4,
              }}>
                <QRCodeSVG value={verifyUrl} size={forPrint ? 100 : 88} level="H" />
              </div>
            ) : (
              <div style={{ width: 112, height: 112, background: '#EEE', borderRadius: 4 }} />
            )}
            <div style={{
              fontSize: forPrint ? '7px' : 'clamp(6px, 0.9vw, 8px)',
              letterSpacing: '0.18em',
              color: '#6e6e6e',
              textTransform: 'uppercase',
              fontFamily: "'Michroma', Arial, sans-serif",
            }}>
              Scan to Verify
            </div>
          </div>

          {/* Right: Authorized By */}
          <div style={{ minWidth: forPrint ? 110 : '22%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Signature image */}
            <img src="/assets/signature.png" alt="Signature" style={{ height: forPrint ? '40px' : 'clamp(28px, 4.5vw, 50px)', width: 'auto', marginBottom: 6 }} />
            <div style={{
              fontSize: forPrint ? '8px' : 'clamp(7px, 1vw, 9px)',
              letterSpacing: '0.2em',
              color: '#888',
              textTransform: 'uppercase',
              fontFamily: "'Michroma', Arial, sans-serif",
              marginBottom: 3,
            }}>
              Authorized By
            </div>
            <div style={{
              fontSize: forPrint ? '11px' : 'clamp(9px, 1.3vw, 13px)',
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
      <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND} 0%, #FF8C00 100%)`, flexShrink: 0 }} />

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
  );
}

// ----------- PDF Download Helper -----------
async function downloadCertificateAsPDF(student: CertificateData['student'], _certificate: Certificate | null) {
  const element = document.getElementById('certificate-capture-root');
  if (!element) {
    alert('Certificate element not found in DOM.');
    return;
  }

  // Dynamically import html2canvas + jsPDF
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // Capture the already rendered, perfectly-sized certificate card from the DOM
  const canvas = await canvasCaptureWithFonts(element, html2canvas);

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const A4_W_MM = 297;
  const A4_H_MM = 210;

  pdf.addImage(imgData, 'PNG', 0, 0, A4_W_MM, A4_H_MM);
  pdf.save(`ZTOI_Certificate_${student.name.replace(/\s+/g, '_')}.pdf`);
}

// Robust helper to capture DOM with scroll offsets and custom scale
async function canvasCaptureWithFonts(element: HTMLElement, html2canvas: any) {
  return html2canvas(element, {
    scale: 3.5, // Ultra-high DPI capture for crisp, print-ready text quality
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FDFCFA',
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY, // Prevent scroll offset displacement clipping
  });
}

// ----------- Main Page -----------
export default function StudentCertificate() {
  const { user } = useAuth();
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/student/certificate/status');
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching certificate status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePayment = async () => {
    setPaymentError('');
    setPaymentLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Failed to load payment gateway. Please check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      const orderRes = await fetch('/api/student/create-order', { method: 'POST' });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setPaymentError(orderData.error || 'Failed to initiate payment. Please try again.');
        setPaymentLoading(false);
        return;
      }

      const studentPhone = data?.student?.phone || '';
      const normalisePhone = (p: string) => {
        const digits = p.replace(/\D/g, '');
        if (digits.length === 10) return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
        return p;
      };

      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ZTOI TECH',
        description: 'Internship Certificate Fee',
        order_id: orderData.order_id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: normalisePhone(studentPhone),
        },
        theme: { color: BRAND },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/student/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPaymentSuccess(true);
              await fetchStatus();
            } else {
              setPaymentError(verifyData.error || 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setPaymentError('Payment verification failed. Contact support with payment ID: ' + response.razorpay_payment_id);
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: { ondismiss: () => setPaymentLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setPaymentError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('An unexpected error occurred. Please try again.');
      setPaymentLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      await downloadCertificateAsPDF(data.student, data.certificate);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (!isDesktop) {
    return (
      <StudentLayout>
        <div className="max-w-xl mx-auto my-12 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${BRAND}15` }}>
              <Laptop size={40} style={{ color: BRAND }} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-michroma)' }}>
              Desktop Only
            </h1>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              For security, verification accuracy, and high-fidelity rendering/downloading of your official digital certificate, this section is restricted to laptop and desktop devices only.
            </p>
            
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND }} />
            <p className="text-gray-500 text-sm">Loading certificate status…</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!data) {
    return (
      <StudentLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">Failed to load certificate information. Please refresh the page.</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { student, tasks, payment, certificate } = data;
  const allTasksAccepted = tasks.length > 0 && tasks.every((t) => t.status === 'accepted');
  const certStatus = student.certificateStatus;

  // Calculate dynamic price based on referrals
  const hasReferrer = student.referredById !== undefined && student.referredById !== null;
  const verifiedRefCount = student.verifiedReferralsCount || 0;
  const discount = (hasReferrer ? 30 : 0) + Math.min(5, verifiedRefCount) * 30;
  const finalPrice = Math.max(0, 499 - discount);

  const statusBanner = () => {
    if (certStatus === 'issued' && certificate) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border border-green-200 bg-green-50 flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Award size={16} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-800 text-sm">Certificate Issued! 🎉</p>
            <p className="text-green-700 text-sm mt-1">
              Certificate No: <strong>{certificate.cert_number}</strong> · Issued on {certificate.issued_at}
            </p>
          </div>
        </motion.div>
      );
    }
    if (certStatus === 'under_review') {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border border-yellow-200 bg-yellow-50 flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Payment Verified — Certificate Pending</p>
            <p className="text-yellow-700 text-sm mt-1">Your payment has been verified. Certificate will be issued within 24 hours.</p>
          </div>
        </motion.div>
      );
    }
    if (payment && payment.status === 'rejected') {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle size={16} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-red-800 text-sm">Payment Rejected</p>
            <p className="text-red-700 text-sm mt-1">Your previous payment was rejected. Please try again below.</p>
          </div>
        </motion.div>
      );
    }
    if (paymentSuccess) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border border-blue-200 bg-blue-50 flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-800 text-sm">Payment Successful!</p>
            <p className="text-blue-700 text-sm mt-1">Certificate will be issued within 24 hours.</p>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-michroma)' }}>
            Certificate
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Complete all tasks and pay {discount > 0 ? (<span><s>₹499</s> <strong className="text-orange-600 font-semibold">₹{finalPrice}</strong></span>) : '₹499'} to unlock your internship certificate.
          </p>

          {statusBanner()}

          {/* Error */}
          <AnimatePresence>
            {paymentError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3 mb-5">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{paymentError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Checklist */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-800 mb-4 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>
              Requirements
            </h2>
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  {task.status === 'accepted' ? (
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  ) : task.status === 'rejected' ? (
                    <XCircle size={20} className="text-red-400 flex-shrink-0" />
                  ) : (
                    <Lock size={20} className="text-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${task.status === 'accepted' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {task.title}
                  </span>
                  {task.status === 'accepted' && (
                    <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Accepted</span>
                  )}
                  {task.status === 'rejected' && (
                    <span className="ml-auto text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Rejected</span>
                  )}
                  {task.status === 'submitted' && (
                    <span className="ml-auto text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Under Review</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                {certStatus === 'under_review' || certStatus === 'issued' ? (
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Lock size={20} className="text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${certStatus === 'under_review' || certStatus === 'issued' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  Certificate Fee Payment — {discount > 0 ? (<span><s>₹499</s> <span className="text-orange-600 font-bold ml-1">₹{finalPrice}</span></span>) : '₹499'}
                </span>
                {(certStatus === 'under_review' || certStatus === 'issued') && (
                  <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Paid</span>
                )}
              </div>
              
              {discount > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-100 flex flex-col gap-1 text-xs text-orange-800">
                  <div className="font-semibold">Referral Discount Applied: ₹{discount} Off</div>
                  <ul className="list-disc list-inside text-orange-700 space-y-0.5 ml-1">
                    {hasReferrer && <li>Referee registration bonus: -₹30</li>}
                    {verifiedRefCount > 0 && (
                      <li>
                        Referred {verifiedRefCount} verified {verifiedRefCount === 1 ? 'student' : 'students'} (max 5): -₹{Math.min(5, verifiedRefCount) * 30}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Certificate Preview */}
          <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-3xl mx-auto">
            {/* Lock overlay */}
            {certStatus !== 'issued' && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl"
                style={{ background: 'rgba(10,10,10,0.62)', backdropFilter: 'blur(6px)' }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-white/10 border border-white/20">
                  <Lock size={24} className="text-white" />
                </div>
                <p className="text-white font-bold text-base mb-1" style={{ fontFamily: 'var(--font-michroma)' }}>
                  Certificate Locked
                </p>
                <p className="text-white/60 text-xs text-center max-w-xs px-4 mb-5">
                  {!allTasksAccepted
                    ? 'Complete all tasks first to unlock your certificate.'
                    : certStatus === 'under_review'
                      ? 'Certificate is being prepared. Check back soon!'
                      : `Pay ₹${finalPrice} to unlock and receive your certificate.`}
                </p>
                {allTasksAccepted && (certStatus === 'payment_pending' || (payment && payment.status === 'rejected')) && !paymentSuccess && (
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="px-7 py-3 rounded-lg text-white font-semibold text-xs transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                    style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing…
                      </>
                    ) : (
                      `Pay ₹${finalPrice} — Unlock Certificate`
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Actual certificate */}
            <div id="certificate-capture-root" className={certStatus !== 'issued' ? 'opacity-20 pointer-events-none select-none' : ''}>
              <CertificateCard student={student} certificate={certificate} />
            </div>
          </div>

          {/* Download button */}
          {certStatus === 'issued' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-7 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
                style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.8rem' }}
              >
                {pdfLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download Certificate (PDF)
                  </>
                )}
              </button>
            </motion.div>
          )}

          {!allTasksAccepted && certStatus === 'locked' && tasks.length > 0 && (
            <div className="text-center mt-2">
              <p className="text-gray-500 text-sm">Complete all assigned tasks to unlock the payment option.</p>
            </div>
          )}
        </motion.div>
      </div>
    </StudentLayout>
  );
}