"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, School, Calendar, Upload, Loader2, Copy, Check } from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import { useAuth } from '@/lib/auth-context';

const BRAND = '#FF4D00';

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  college: string;
  address: string;
  photo_path: string | null;
  domain_id: number;
  certificate_status: string;
  status: string;
  registered_at: string;
  referral_code: string;
}

interface Referral {
  name: string;
  email: string;
  email_verified: number;
  registered_at: string;
}

export default function StudentProfile() {
  useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const copyToClipboard = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.student);
      setReferrals(data.referrals || []);
      if (data.student.photo_path) {
        setPhotoPreview(data.student.photo_path);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setUploadMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('/api/student/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setProfile(prev => prev ? { ...prev, photo_path: data.photo_path } : null);
      setUploadMessage({ type: 'success', text: 'Profile photo updated successfully!' });

      // Clear message after 3 seconds
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload photo' });
      // Reset preview on error
      setPhotoPreview(profile?.photo_path || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <p className="text-red-700">Failed to load profile. Please try again.</p>
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>My Profile</h1>
          <p className="text-gray-600 text-sm mt-1">View your details and manage your profile photo</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Summary and Status Cards */}
          <div className="space-y-6 lg:col-span-1">
            {/* Photo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>Profile Photo</h2>
              
              {/* Photo Display */}
              <div className="relative mb-6">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <User size={48} className="text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">No photo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: uploading ? '#E5E7EB' : BRAND,
                  color: uploading ? '#6B7280' : 'white',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Change Photo
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={uploading}
              />

              <p className="text-xs text-gray-500 mt-3 text-center">
                JPG, PNG, GIF or WebP • Max 5MB
              </p>

              {/* Upload Message */}
              {uploadMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    uploadMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {uploadMessage.text}
                </motion.div>
              )}
            </motion.div>

            {/* Referral Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
            >
              <div>
                <h2 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
                  Refer & Earn
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Invite friends to register! Once their email is verified, both of you earn a <strong>₹30 discount</strong> off the certificate fee (max ₹150 for 5 refers).
                </p>
              </div>
              
              {/* Referral Code Box */}
              <div>
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-mono font-bold text-sm tracking-wider text-gray-800 select-all flex-1 pl-1">
                    {profile.referral_code || '—'}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0 text-gray-500 hover:text-gray-800"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} className="text-green-600 animate-pulse" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-xxs mt-1 font-semibold text-center animate-bounce">
                    ✓ Referral code copied!
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Main Profile Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ProfileField icon={User} label="Full Name" value={profile.name} />
                <ProfileField icon={Mail} label="Email Address" value={profile.email} />
                <ProfileField icon={Phone} label="Phone Number" value={profile.phone} />
                <ProfileField icon={Calendar} label="Date of Birth" value={formatDate(profile.dob)} />
              </div>
            </motion.div>

            {/* Education & Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>Education & Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ProfileField icon={School} label="College/University" value={profile.college} />
                <ProfileField icon={MapPin} label="Address" value={profile.address} />
              </div>
            </motion.div>

            {/* Account Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>Account Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-600 text-sm">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    profile.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="text-gray-600 text-sm">Certificate Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    profile.certificate_status === 'issued'
                      ? 'bg-green-50 text-green-700'
                      : profile.certificate_status === 'locked'
                        ? 'bg-gray-50 text-gray-700'
                        : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {profile.certificate_status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-600 text-sm">Member Since</span>
                  <span className="text-gray-900 font-medium text-sm">{formatDate(profile.registered_at)}</span>
                </div>
              </div>
            </motion.div>

            {/* Referrals List Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.26 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
                My Referrals List
              </h2>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No referrals yet. Share your code to start earning rewards!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {referrals.map((ref, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-gray-900">{ref.name}</td>
                          <td className="px-4 py-3.5 text-gray-600">{ref.email}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-xxs font-semibold inline-flex items-center gap-1 ${
                              ref.email_verified === 1
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              {ref.email_verified === 1 ? '✓ Verified' : '⌛ Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500">{formatDate(ref.registered_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

interface ProfileFieldProps {
  icon: React.ComponentType<{ size: number; className?: string; color?: string }>;
  label: string;
  value: string;
}

function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND}15` }}>
        <Icon size={18} color={BRAND} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}
