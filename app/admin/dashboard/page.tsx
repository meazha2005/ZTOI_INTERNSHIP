"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, UserCheck, CreditCard, Award, TrendingUp } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

const BRAND = '#FF4D00';

const domainColors: Record<string, string> = {
  'Prompt Engineering': '#8B5CF6',
  'Web Development with AI': '#3B82F6',
  'Python Full Stack': '#10B981',
};

interface DashboardData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    certIssued: number;
    pendingPayments: number;
  };
  domainCounts: Record<string, number>;
  taskStats: {
    acceptedTasks: number;
    pendingTasks: number;
    rejectedTasks: number;
  };
  recentPayments: any[];
  recentStudents: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const { totalStudents, activeStudents, certIssued, pendingPayments } = data.stats;
  const maxCount = Object.keys(data.domainCounts).length > 0 ? Math.max(...Object.values(data.domainCounts)) : 1;

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: '#3B82F6', change: 'Total registered' },
    { label: 'Active Students', value: activeStudents, icon: UserCheck, color: '#10B981', change: `${activeStudents}/${totalStudents} active` },
    { label: 'Pending Payments', value: pendingPayments, icon: CreditCard, color: BRAND, change: 'Needs review' },
    { label: 'Certificates Issued', value: certIssued, icon: Award, color: '#8B5CF6', change: 'All time' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
          </div>

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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <TrendingUp size={14} className="text-gray-300" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-michroma)' }}>{s.value}</p>
                <p className="text-xs font-semibold text-gray-700 mb-0.5">{s.label}</p>
                <p className="text-xs text-gray-400">{s.change}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Domain Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>Domain Enrollment</h2>
              <div className="flex flex-col gap-4">
                {Object.entries(data.domainCounts).map(([domain, count]) => (
                  <div key={domain}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-gray-600 font-medium truncate max-w-[160px]">{domain}</span>
                      <span className="text-xs font-bold text-gray-800">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: domainColors[domain] || BRAND }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Task Submissions Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>Task Overview</h2>
              {[
                { label: 'Accepted', count: data.taskStats.acceptedTasks, color: '#10B981' },
                { label: 'Pending Review', count: data.taskStats.pendingTasks, color: '#3B82F6' },
                { label: 'Rejected', count: data.taskStats.rejectedTasks, color: '#EF4444' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>{item.count}</span>
                </div>
              ))}
            </motion.div>

            {/* Recent Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="font-bold text-gray-900 mb-5 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>Recent Payments</h2>
              <div className="flex flex-col gap-3">
                {data.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.studentName}</p>
                      <p className="text-xs text-gray-400">{new Date(p.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: BRAND }}>₹{p.amount}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.status === 'verified' ? 'bg-green-50 text-green-600' :
                        p.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Registrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>Recent Registrations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {s.photo ? (
                            <img src={s.photo} alt={s.name} className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                              {s.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: `${domainColors[s.domain]}15`, color: domainColors[s.domain] }}>
                          {s.domain}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.registeredAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          s.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
