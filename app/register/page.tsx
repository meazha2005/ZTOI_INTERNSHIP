"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';;
import { motion } from 'motion/react';
import { Upload, Eye, EyeOff, UserPlus } from 'lucide-react';

const BRAND = '#FF4D00';

const Field = ({
  label, name, type = 'text', placeholder, required = true,
  value, onChange, error,
  children,
}: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
  value?: string; onChange?: (val: string) => void; error?: string;
  children?: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span style={{ color: BRAND }}>*</span>}
    </label>
    {children || (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
        style={{ borderColor: error ? '#ef4444' : '#e5e5e5' }}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function RegisterPage() {
  const [domains, setDomains] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        if (data.domains) setDomains(data.domains);
      })
      .catch(console.error);
  }, []);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [referralStatus, setReferralStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (!referralCode.trim()) {
      setReferrerName('');
      setReferralStatus('idle');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setCheckingReferral(true);
      try {
        const response = await fetch(`/api/student/verify-referral?code=${encodeURIComponent(referralCode.trim())}`);
        const data = await response.json();
        if (response.ok && data.name) {
          setReferrerName(data.name);
          setReferralStatus('valid');
        } else {
          setReferrerName('');
          setReferralStatus('invalid');
        }
      } catch (err) {
        console.error(err);
        setReferrerName('');
        setReferralStatus('invalid');
      } finally {
        setCheckingReferral(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [referralCode]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    college: '',
    address: '',
    domain: '',
    password: '',
    confirmPassword: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.dob) errs.dob = 'Date of birth is required';
    if (!form.college.trim()) errs.college = 'College name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.domain) errs.domain = 'Please select a domain';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (!fileRef.current?.files?.[0]) errs.photo = 'Profile photo is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('dob', form.dob);
    formData.append('college', form.college);
    formData.append('address', form.address);
    formData.append('domain', form.domain);
    formData.append('password', form.password);
    
    if (referralCode.trim()) {
      formData.append('referral_code', referralCode.trim().toUpperCase());
    }
    
    if (fileRef.current?.files?.[0]) {
      formData.append('photo', fileRef.current.files[0]);
    }

    try {
      const response = await fetch('/api/student/register', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        { if (typeof window !== 'undefined') { sessionStorage.setItem('verify_email', form.email); sessionStorage.setItem('verify_password', form.password); } router.push('/verify-email'); };
      } else {
        setErrors({ email: data.error || 'Registration failed' });
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: 'Error connecting to server' });
    }
    setLoading(false);
  };



  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#F8F8F8' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <span style={{ fontFamily: 'var(--font-michroma)', color: BRAND, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.08em' }}>
              ZTOI TECH
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3" style={{ fontFamily: 'var(--font-michroma)' }}>
            Create Your Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">Join the ZTOI Tech Internship Program — it's free!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="flex flex-col gap-5">
                <Field label="Student Name" name="name" placeholder="Full name" value={form.name} onChange={(v) => set('name', v)} error={errors.name} />
                <Field label="Email Address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={(v) => set('email', v)} error={errors.email} />

                {/* Phone with +91 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span style={{ color: BRAND }}>*</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="9876543210"
                      className="flex-1 px-4 py-3 rounded-r-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: errors.phone ? '#ef4444' : '#e5e5e5' }}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <Field label="Date of Birth" name="dob" type="date" value={form.dob} onChange={(v) => set('dob', v)} error={errors.dob} />
                <Field label="College Name" name="college" placeholder="Your college / university" value={form.college} onChange={(v) => set('college', v)} error={errors.college} />

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Internship Domain <span style={{ color: BRAND }}>*</span>
                  </label>
                  <select
                    value={form.domain}
                    onChange={(e) => set('domain', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all bg-white"
                    style={{ borderColor: errors.domain ? '#ef4444' : '#e5e5e5' }}
                  >
                    <option value="">Select a domain</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  {errors.domain && <p className="text-red-500 text-xs mt-1">{errors.domain}</p>}
                </div>

                {/* Referral Code (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Referral Code <span className="text-gray-400 text-xs font-normal">(Optional)</span></span>
                    {checkingReferral && <span className="text-xs text-gray-400 animate-pulse">Checking…</span>}
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. ZTOI-XXXXXX"
                    className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all uppercase"
                    style={{ 
                      borderColor: referralStatus === 'valid' ? '#22c55e' : referralStatus === 'invalid' ? '#ef4444' : '#e5e5e5',
                      boxShadow: referralStatus === 'valid' ? '0 0 0 2px rgba(34,197,94,0.1)' : referralStatus === 'invalid' ? '0 0 0 2px rgba(239,68,68,0.1)' : undefined
                    }}
                  />
                  {referralStatus === 'valid' && (
                    <p className="text-green-600 text-xs mt-1.5 font-medium flex items-center gap-1">
                      ✓ Referred by: <span className="underline">{referrerName}</span>
                    </p>
                  )}
                  {referralStatus === 'invalid' && (
                    <p className="text-red-500 text-xs mt-1.5">
                      ✗ Invalid referral code
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-5">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Profile Photo <span style={{ color: BRAND }}>*</span>
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-colors"
                    style={{ borderColor: photoPreview ? BRAND : '#e5e5e5' }}
                  >
                    {photoPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: BRAND }} />
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={28} className="text-gray-300" />
                        <p className="text-sm text-gray-500">Click to upload photo</p>
                        <p className="text-xs text-gray-400">JPG, PNG up to 2MB</p>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  </div>
                  {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span style={{ color: BRAND }}>*</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    placeholder="Your full address"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: errors.address ? '#ef4444' : '#e5e5e5' }}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span style={{ color: BRAND }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: errors.password ? '#ef4444' : '#e5e5e5' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password <span style={{ color: BRAND }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: errors.confirmPassword ? '#ef4444' : '#e5e5e5' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 p-4 rounded-lg bg-orange-50 border border-orange-100">
              <p className="text-sm text-gray-600">
                By registering, you agree to our terms. Upon registration, 2 random tasks from your selected domain will be assigned to you.
                Certificate requires completing all tasks + paying <strong>₹499</strong>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: BRAND }}>
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
