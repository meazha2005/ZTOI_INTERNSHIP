"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, XCircle, Upload, X, AlertCircle } from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import { type TaskStatus } from '@/lib/mock-data';

export interface TaskSubmission {
  id: string;
  taskTitle: string;
  taskDescription?: string;
  status: TaskStatus;
  rejectionReason?: string;
  submittedAt?: string;
}

const BRAND = '#FF4D00';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
  submitted: { label: 'Under Review', color: '#3B82F6', bg: '#EFF6FF', icon: Clock },
  accepted: { label: 'Accepted', color: '#10B981', bg: '#D1FAE5', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
};

function SubmitModal({ task, onClose, onSubmit }: {
  task: TaskSubmission;
  onClose: () => void;
  onSubmit: (taskId: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/student/tasks/${task.id}/submit`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        onSubmit(String(task.id));
        onClose();
      }
    } catch (err) {
      console.error('Submission failed', err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
            Submit Task
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-3 rounded-lg bg-gray-50 mb-5">
          <p className="text-sm font-semibold text-gray-800">{task.taskTitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 transition-colors mb-5"
            style={{ borderColor: file ? BRAND : '#e5e5e5' }}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND}15` }}>
                  <Upload size={20} style={{ color: BRAND }} />
                </div>
                <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs" style={{ color: BRAND }}>Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">Upload ZIP File</p>
                <p className="text-xs text-gray-400">Click to browse or drag & drop</p>
                <p className="text-xs text-gray-400">Only .zip files accepted</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="flex-1 py-3 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Submit Task'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function StudentTasks() {
  const [tasks, setTasks] = useState<TaskSubmission[]>([]);
  const [submitModal, setSubmitModal] = useState<TaskSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/tasks')
      .then((r) => r.json())
      .then((data) => {
        if (data.tasks) setTasks(data.tasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completed = tasks.filter((t) => t.status === 'accepted').length;
  const progress = (completed / tasks.length) * 100;

  const handleSubmit = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (String(t.id) === taskId ? { ...t, status: 'submitted' as TaskStatus } : t))
    );
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

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-michroma)' }}>
            My Tasks
          </h1>
          <p className="text-gray-500 text-sm mb-6">Complete all assigned tasks to unlock your certificate.</p>

          {/* Progress */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold" style={{ color: BRAND, fontFamily: 'var(--font-michroma)' }}>
                {completed}/{tasks.length} Tasks
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: BRAND }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {completed === tasks.length
                ? '🎉 All tasks complete! Proceed to unlock your certificate.'
                : `${tasks.length - completed} task(s) remaining`}
            </p>
          </div>

          {/* Task Cards */}
          <div className="flex flex-col gap-4">
            {tasks.map((task, i) => {
              const cfg = statusConfig[task.status];
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Task {i + 1}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.95rem' }}>
                        {task.taskTitle}
                      </h3>
                      {task.taskDescription && (
                        <p className="text-gray-500 text-sm mt-2 whitespace-pre-wrap">{task.taskDescription}</p>
                      )}
                    </div>
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Rejection reason */}
                  {task.status === 'rejected' && task.rejectionReason && (
                    <div className="flex gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-600">{task.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      {task.submittedAt ? `Submitted: ${task.submittedAt}` : 'Not yet submitted'}
                    </p>
                    {(task.status === 'pending' || task.status === 'rejected') && (
                      <button
                        onClick={() => setSubmitModal(task)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
                      >
                        <Upload size={14} />
                        {task.status === 'rejected' ? 'Resubmit' : 'Submit Task'}
                      </button>
                    )}
                    {task.status === 'accepted' && (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                        <CheckCircle size={16} />
                        Accepted
                      </div>
                    )}
                    {task.status === 'submitted' && (
                      <p className="text-xs text-blue-500 font-semibold">Awaiting review...</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {submitModal && (
        <SubmitModal
          task={submitModal}
          onClose={() => setSubmitModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </StudentLayout>
  );
}
