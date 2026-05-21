"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';;
import { CheckSquare, Clock, Award, MessageCircle, ArrowRight, Activity } from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import { useAuth } from '@/lib/auth-context';

const BRAND = '#FF4D00';

interface DashboardData {
  stats: {
    tasksAssigned: number;
    tasksCompleted: number;
    tasksPending: number;
    certificateStatus: string;
  };
  activities: { text: string; time: string; type: 'success' | 'error' | 'info' }[];
  quickActions: {
    resubmissionCount: number;
    unreadCount: number;
  };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Tasks Assigned', value: data?.stats.tasksAssigned ?? '-', icon: CheckSquare, color: '#3B82F6' },
    { label: 'Tasks Completed', value: data?.stats.tasksCompleted ?? '-', icon: CheckSquare, color: '#10B981' },
    { label: 'Tasks Pending', value: data?.stats.tasksPending ?? '-', icon: Clock, color: '#F59E0B' },
    { label: 'Certificate', value: data?.stats.certificateStatus ? data.stats.certificateStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-', icon: Award, color: BRAND },
  ];

  const activities = data?.activities || [];
  const qa = data?.quickActions;

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
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #111 0%, #1a1a1a 100%)` }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
            style={{ background: BRAND }} />
          <div className="relative z-10">
            <p className="text-white/50 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-michroma)' }}>
              {user?.name || 'Student'}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: `${BRAND}25`, color: BRAND, border: `1px solid ${BRAND}40` }}>
              {user?.domain || 'Web Development with AI'}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-michroma)' }}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} style={{ color: BRAND }} />
              <h2 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.85rem' }}>Recent Activity</h2>
            </div>
            <div className="flex flex-col gap-4">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.type === 'success' ? 'bg-green-500' : a.type === 'error' ? 'bg-red-500' : 'bg-blue-400'
                  }`} />
                  <div>
                    <p className="text-sm text-gray-700">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="font-bold text-gray-900 mb-5" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.85rem' }}>Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/student/tasks"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${BRAND}15` }}>
                    <CheckSquare size={16} style={{ color: BRAND }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">View My Tasks</p>
                    <p className="text-xs text-gray-400">{qa?.resubmissionCount ? `${qa.resubmissionCount} task(s) needs resubmission` : 'Check task status'}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
              </Link>

              <Link
                href="/student/chat"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
                    <MessageCircle size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Chat with Mentor</p>
                    <p className="text-xs text-gray-400">{qa?.unreadCount ? `${qa.unreadCount} unread message(s)` : 'No new messages'}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
              </Link>

              <Link
                href="/student/certificate"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-yellow-50">
                    <Award size={16} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Certificate Status</p>
                    <p className="text-xs text-gray-400">Complete tasks to unlock</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
}
