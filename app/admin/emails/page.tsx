"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Mail, 
  Send, 
  Check, 
  Clock, 
  X, 
  Loader2, 
  AlertCircle, 
  Info, 
  FileText,
  CheckCircle2,
  XCircle,
  Paperclip
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { toast } from 'sonner';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'blocked';
  certificateStatus: 'locked' | 'payment_pending' | 'under_review' | 'issued';
  completionEmailSent: number;
  tasksCompleted: number;
  domain: string;
  completedProjects: string | null;
  certificateNumber: string | null;
}

const domainColors: Record<string, string> = {
  'Prompt Engineering': '#8B5CF6',
  'Web Development with AI': '#3B82F6',
  'Python Full Stack': '#10B981',
};

const BRAND_ORANGE = '#FF4D00';

function generateEmailHtml({
  name,
  domain,
  project,
  personalNote,
  portalUrl,
  certificateNumber
}: {
  name: string;
  domain: string;
  project: string;
  personalNote: string;
  portalUrl: string;
  certificateNumber: string;
}) {
  const personalNoteHtml = personalNote.trim()
    ? `<div style="margin: 20px 0; padding: 18px; background-color: #FFF9F5; border-left: 3px solid #ff4d00; border-radius: 6px; font-style: italic; color: #555555; font-size: 14px; line-height: 1.6;">
         "${personalNote.replace(/\n/g, '<br>')}"
       </div>`
    : '';

  // Orderly project list formatting - each on a new line in an ordered list
  const projectsList = project.split(',')
    .map(p => p.trim())
    .filter(Boolean);

  let projectHtml = '';
  if (projectsList.length > 0) {
    projectHtml = `<ol style="margin: 0; padding-left: 20px; color: #111111; font-weight: 600; line-height: 1.65; font-size: 14px;">`;
    projectsList.forEach((proj) => {
      projectHtml += `<li style="margin-bottom: 6px; color: #111111;">${proj}</li>`;
    });
    projectHtml += `</ol>`;
  } else {
    projectHtml = `<span style="color: #888888; font-style: italic; font-size: 14px;">No projects completed yet</span>`;
  }

  // Certificate Verification Section
  let verificationHtml = '';
  if (certificateNumber.trim()) {
    const verifyUrl = `${portalUrl.replace('/login', '')}/verify?cert=${encodeURIComponent(certificateNumber.trim())}`;
    verificationHtml = `
      <div style="margin: 25px 0 10px 0; padding: 20px; border: 1px dashed #d1d5db; border-radius: 8px; background-color: #fafbfc; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #666666;">
          <strong>Internship Certificate ID:</strong> <code style="font-family: monospace; color: #ff4d00; background-color: #f3f4f6; padding: 3px 8px; border-radius: 4px; font-size: 13px; font-weight: 600;">${certificateNumber.trim()}</code>
        </p>
        <p style="margin: 0;">
          <a href="${verifyUrl}" style="color: #ff4d00; font-size: 13px; font-weight: 700; text-decoration: underline;" target="_blank">
            Verify Internship Certificate Authenticity Online
          </a>
        </p>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Internship Completion - ZTOI TECH</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f7;
      color: #333333;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      border: 1px solid #eef0f3;
    }
    .header {
      background-color: #0d0d0d;
      padding: 35px 30px;
      text-align: center;
      border-bottom: 4px solid #ff4d00;
    }
    .brand-title {
      color: #ff4d00;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin: 0;
    }
    .brand-subtitle {
      color: #888888;
      font-size: 11px;
      margin: 6px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    .content {
      padding: 40px 35px;
      line-height: 1.65;
      font-size: 15px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 20px;
    }
    .achievement-card {
      background-color: #fafbfc;
      border: 1px solid #eef0f3;
      border-left: 4px solid #ff4d00;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .detail-row {
      margin-bottom: 12px;
      font-size: 14px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-weight: 700;
      color: #666666;
      display: inline-block;
      width: 100px;
    }
    .detail-value {
      color: #111111;
      font-weight: 600;
    }
    .btn-container {
      text-align: center;
      margin: 35px 0 20px 0;
    }
    .btn {
      background-color: #ff4d00;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 35px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
      display: inline-block;
      box-shadow: 0 4px 10px rgba(255, 77, 0, 0.25);
    }
    .footer {
      background-color: #fafbfc;
      padding: 25px 30px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #eef0f3;
    }
    .footer a {
      color: #ff4d00;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-title">ZTOI TECH</div>
      <div class="brand-subtitle">Empowering Technical Leaders</div>
    </div>
    <div class="content">
      <div class="greeting">Dear ${name},</div>
      <p>Congratulations! We are absolutely thrilled to inform you that you have successfully completed your internship program at <strong>ZTOI TECH</strong>.</p>
      
      <p>Throughout the duration of your internship, you have shown outstanding diligence, problem-solving skills, and a commitment to technical excellence. We deeply appreciate the hard work you put into learning and building.</p>
      
      <div class="achievement-card">
        <div class="detail-row">
          <span class="detail-label">Domain:</span>
          <span class="detail-value">${domain}</span>
        </div>
        <div class="detail-row" style="margin-top: 8px;">
          <span class="detail-label" style="display: block; margin-bottom: 6px;">Project(s):</span>
          <div style="padding-left: 5px;">${projectHtml}</div>
        </div>
        <div class="detail-row" style="margin-top: 12px;">
          <span class="detail-label">Status:</span>
          <span class="detail-value">Successfully Completed</span>
        </div>
      </div>
      
      <p>By completing the program requirements, you have demonstrated hands-on technical proficiency that meets industry standards. We believe this experience has equipped you with valuable skills that will help you excel in your future career endeavors.</p>
      
      ${personalNoteHtml}
      
      <p>Your completion certificate is now available and can be reviewed, shared, or downloaded directly from your student portal.</p>
      
      ${verificationHtml}
      
      <div class="btn-container">
        <a href="${portalUrl}" class="btn" target="_blank">Go to Student Portal</a>
      </div>
      
      <p>On behalf of everyone at ZTOI TECH, we wish you the absolute best in all your future professional achievements. Keep learning, coding, and building!</p>
      
      <p style="margin-top: 35px; line-height: 1.5;">Warm regards,<br>
      <span style="color: #ff4d00; font-weight: 700;">The Team at ZTOI TECH</span></p>
    </div>
    <div class="footer">
      <p>© 2026 ZTOI TECH. All rights reserved.</p>
      <p>Questions? Contact us at <a href="mailto:ztoitech@gmail.com">ztoitech@gmail.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

interface ComposeModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

function ComposeEmailModal({ student, onClose, onSuccess }: ComposeModalProps) {
  const [subject, setSubject] = useState(`ZTOI TECH - Internship Completion & Congratulations!`);
  const [customName, setCustomName] = useState(student.name);
  const [projectName, setProjectName] = useState(student.completedProjects || 'Assigned Internship Tasks');
  const [certId, setCertId] = useState(student.certificateNumber || '');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [personalNote, setPersonalNote] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [sending, setSending] = useState(false);

  const [portalUrl, setPortalUrl] = useState('http://localhost:3001/login');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalUrl(`${window.location.origin}/login`);
    }
  }, []);

  const emailBodyHtml = generateEmailHtml({
    name: customName,
    domain: student.domain,
    project: projectName,
    personalNote,
    portalUrl,
    certificateNumber: certId
  });

  const handleSend = async () => {
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('studentId', String(student.id));
      formData.append('emailSubject', subject);
      formData.append('emailBody', emailBodyHtml);
      if (attachment) {
        formData.append('file', attachment);
      }

      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Completion email sent successfully to ${student.name}!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to send email.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while sending the email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-950 flex items-center gap-2" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.95rem' }}>
              <Mail size={18} className="text-orange-500" />
              Compose Internship Completion Email
            </h3>
            <p className="text-xs text-gray-500 mt-1">Review, personalize, and send a branded email to {student.name}.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 text-gray-400 hover:text-gray-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Content - Side by Side layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Form Fields Section */}
          <div className="md:col-span-5 p-6 border-r border-gray-100 flex flex-col gap-4 overflow-y-auto">
            {/* Nav Tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('edit')} 
                className={`flex-1 py-2 text-center transition-all ${activeTab === 'edit' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                Edit Details
              </button>
              <button 
                onClick={() => setActiveTab('preview')} 
                className={`flex-1 py-2 text-center transition-all ${activeTab === 'preview' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                Live Preview
              </button>
            </div>

            {activeTab === 'edit' ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Recipient Email</label>
                  <input
                    type="text"
                    value={student.email}
                    disabled
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject line"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Student Name (as written in mail)</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Student Name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Project Names (comma-separated)</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project Name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Pre-filled with student's accepted tasks. Editable.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate ID (Optional)</label>
                  <input
                    type="text"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    placeholder="e.g. ZTOI-2026-XXXX"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Loads automatically if certificate is generated. Allows manual verification link inclusion.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Attachment (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachment(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="email-attachment-file"
                    />
                    <label
                      htmlFor="email-attachment-file"
                      className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1.5"
                    >
                      <Paperclip size={13} />
                      {attachment ? 'Change File' : 'Choose File'}
                    </label>
                    {attachment && (
                      <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-600">
                        <span className="max-w-[130px] truncate">{attachment.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="hover:text-orange-800 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Select a document, PDF, or archive to attach to this email.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Personal Note (Optional)</label>
                  <textarea
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="Add a personalized note or feedback here. It will be styled inside a special quote box in the email."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 py-2">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-2">
                  <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-normal">
                    This is the raw data mapped into the email template. Switch to the right panel or use the "Live Preview" tab on mobile to inspect the layout.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Subject</span>
                    <span className="font-semibold text-gray-700 break-all">{subject}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Recipient</span>
                    <span className="font-semibold text-gray-700 break-all">{student.email}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Intern Name</span>
                    <span className="font-semibold text-gray-700">{customName}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Domain</span>
                    <span className="font-semibold text-gray-700">{student.domain}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Certificate ID</span>
                    <span className="font-semibold text-gray-700">{certId || 'None'}</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Project Name</span>
                    <span className="font-semibold text-gray-700">{projectName}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email Preview Section */}
          <div className="md:col-span-7 bg-gray-100 p-4 md:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                <span>Subject: {subject}</span>
                <span className="bg-green-15 border border-green-500/20 text-green-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">HTML Branded</span>
              </div>
              <iframe
                title="Email Live Preview"
                srcDoc={emailBodyHtml}
                className="w-full flex-1 border-0 min-h-[350px] md:min-h-[420px]"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Info size={14} className="text-orange-500" />
            <span>Updates database state to "Sent" once dispatched.</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-95 transition-all flex items-center gap-2"
              style={{ background: BRAND_ORANGE, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              {sending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminEmails() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [emailStatusFilter, setEmailStatusFilter] = useState<'all' | 'sent' | 'pending' | 'not_eligible'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/emails');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      } else {
        toast.error('Failed to load students data.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const getEmailStatus = (s: Student): 'sent' | 'pending' | 'not_eligible' => {
    if (s.completionEmailSent === 1) return 'sent';
    if (s.tasksCompleted >= 2) return 'pending';
    return 'not_eligible';
  };

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    
    const matchDomain = domainFilter === 'all' || s.domain === domainFilter;
    
    const status = getEmailStatus(s);
    const matchStatus = emailStatusFilter === 'all' || status === emailStatusFilter;
    
    return matchSearch && matchDomain && matchStatus;
  });

  // Calculate statistics
  const totalCompleted = students.filter(s => s.tasksCompleted >= 2).length;
  const emailsSent = students.filter(s => s.completionEmailSent === 1).length;
  const emailsPending = students.filter(s => s.tasksCompleted >= 2 && s.completionEmailSent === 0).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Loading students and projects...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3" style={{ fontFamily: 'var(--font-michroma)' }}>
                <span className="p-2 bg-orange-50 rounded-xl text-orange-600 inline-block"><Mail size={22} /></span>
                Internship Completion Emails
              </h1>
              <p className="text-gray-500 text-sm mt-1.5">Compose, personalize, and manually dispatch completion emails to successful interns.</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              {
                title: 'Total Completed Interns',
                value: totalCompleted,
                desc: 'Completed all required projects',
                icon: CheckCircle2,
                color: 'text-blue-600',
                bg: 'bg-blue-50 border-blue-100'
              },
              {
                title: 'Emails Dispatched',
                value: emailsSent,
                desc: 'Sent completion credentials',
                icon: Check,
                color: 'text-green-600',
                bg: 'bg-green-50 border-green-100'
              },
              {
                title: 'Emails Pending Dispatch',
                value: emailsPending,
                desc: 'Eligible for manual notification',
                icon: Clock,
                color: 'text-orange-600',
                bg: 'bg-orange-50 border-orange-100'
              }
            ].map((stat, i) => (
              <div key={i} className={`p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between gap-4 transition-all hover:shadow-md`}>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2" style={{ fontFamily: 'var(--font-michroma)', fontSize: '1.65rem' }}>{stat.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.desc}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-[240px] px-3 py-2 bg-gray-50 rounded-xl border border-gray-150">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students by name or email..."
                className="bg-transparent border-none text-sm w-full focus:outline-none text-gray-800"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Filter size={14} />
                <span>Filters</span>
              </div>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none bg-white font-medium text-gray-700 hover:border-gray-300 transition-colors"
              >
                <option value="all">All Domains</option>
                <option value="Prompt Engineering">Prompt Engineering</option>
                <option value="Web Development with AI">Web Dev with AI</option>
                <option value="Python Full Stack">Python Full Stack</option>
              </select>
              <select
                value={emailStatusFilter}
                onChange={(e) => setEmailStatusFilter(e.target.value as any)}
                className="text-sm border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none bg-white font-medium text-gray-700 hover:border-gray-300 transition-colors"
              >
                <option value="all">All Email Status</option>
                <option value="pending">Pending Send</option>
                <option value="sent">Sent</option>
                <option value="not_eligible">Not Eligible</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-55 border-b border-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Projects (Tasks)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Certificate</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email Notification</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-55">
                  {filtered.map((s) => {
                    const emailStatus = getEmailStatus(s);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        
                        {/* Student Name */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                              {s.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{s.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Domain */}
                        <td className="px-6 py-4.5">
                          <span 
                            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{ 
                              background: `${domainColors[s.domain]}12`, 
                              color: domainColors[s.domain] 
                            }}
                          >
                            {s.domain}
                          </span>
                        </td>

                        {/* Projects completed */}
                        <td className="px-6 py-4.5 max-w-xs">
                          {s.completedProjects ? (
                            <div className="flex items-start gap-1.5">
                              <FileText size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs font-medium text-gray-700 line-clamp-2">
                                {s.completedProjects}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No tasks accepted</span>
                          )}
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            Progress: {s.tasksCompleted}/2 tasks
                          </span>
                        </td>

                        {/* Certificate status */}
                        <td className="px-6 py-4.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border ${
                            s.certificateStatus === 'issued' ? 'bg-green-50 border-green-200 text-green-700' :
                            s.certificateStatus === 'under_review' ? 'bg-yellow-50 border-yellow-250 text-yellow-700' :
                            s.certificateStatus === 'payment_pending' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            'bg-gray-50 border-gray-200 text-gray-500'
                          }`}>
                            {s.certificateStatus.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Email status */}
                        <td className="px-6 py-4.5">
                          {emailStatus === 'sent' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                              <CheckCircle2 size={12} />
                              Sent
                            </span>
                          )}
                          {emailStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 animate-pulse">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                          {emailStatus === 'not_eligible' && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                              <XCircle size={12} />
                              Not Completed
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 text-right">
                          {emailStatus !== 'not_eligible' ? (
                            <button
                              onClick={() => setSelectedStudent(s)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all inline-flex items-center gap-1.5"
                              style={
                                emailStatus === 'sent'
                                  ? { color: '#666', borderColor: '#d1d5db', background: '#fff' }
                                  : { color: '#fff', background: BRAND_ORANGE, borderColor: BRAND_ORANGE }
                              }
                            >
                              <Mail size={13} />
                              {emailStatus === 'sent' ? 'Resend Email' : 'Compose & Send'}
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Intern must complete both projects first"
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed inline-flex items-center gap-1.5"
                            >
                              <Mail size={13} />
                              Compose
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Mail className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-400 text-sm font-medium">No students found matching your filters.</p>
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <ComposeEmailModal 
            student={selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
            onSuccess={fetchStudents} 
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
