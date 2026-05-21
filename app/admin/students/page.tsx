"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Eye, UserX, UserCheck, X } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { type Domain } from '@/lib/mock-data';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  college: string;
  address: string;
  domain: string;
  photo: string | null;
  status: 'active' | 'blocked';
  tasksCompleted: number;
  certificateStatus: 'locked' | 'payment_pending' | 'under_review' | 'issued';
  registeredAt: string;
}

const domainColors: Record<string, string> = {
  'Prompt Engineering': '#8B5CF6',
  'Web Development with AI': '#3B82F6',
  'Python Full Stack': '#10B981',
};

function StudentDetailModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
              Student Details
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="w-16 h-16 rounded-full bg-gray-200 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                {student.name[0]}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'var(--font-michroma)', fontSize: '1rem' }}>{student.name}</p>
              <p className="text-gray-500 text-sm">{student.email}</p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
                style={{ background: `${domainColors[student.domain]}15`, color: domainColors[student.domain] }}>
                {student.domain}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Phone', value: student.phone },
              { label: 'Date of Birth', value: student.dob ? new Date(student.dob).toLocaleDateString() : '-' },
              { label: 'College', value: student.college },
              { label: 'Registered', value: new Date(student.registeredAt).toLocaleDateString() },
              { label: 'Tasks Completed', value: `${student.tasksCompleted}/2` },
              { label: 'Certificate', value: student.certificateStatus.replace('_', ' ') },
            ].map((item) => (
              <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Address</p>
            <p className="text-sm text-gray-800">{student.address}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<Domain | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domainFilter === 'all' || s.domain === domainFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchDomain && matchStatus;
  });

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/admin/students/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => s.id === id ? { ...s, status: newStatus as 'active'|'blocked' } : s)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>Manage Students</h1>
            <p className="text-gray-500 text-sm mt-1">{students.length} total students registered</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5 flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="flex-1 text-sm focus:outline-none min-w-0"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-gray-400" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value as Domain | 'all')}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white"
              >
                <option value="all">All Domains</option>
                <option value="Prompt Engineering">Prompt Engineering</option>
                <option value="Web Development with AI">Web Dev with AI</option>
                <option value="Python Full Stack">Python Full Stack</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tasks</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificate</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {s.photo ? (
                            <img src={s.photo} alt={s.name} className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0 object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
                              {s.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.phone}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: `${domainColors[s.domain]}15`, color: domainColors[s.domain] }}>
                          {s.domain}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-800" style={{ fontFamily: 'var(--font-michroma)' }}>
                          {s.tasksCompleted}/2
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          s.certificateStatus === 'issued' ? 'bg-green-50 text-green-600' :
                          s.certificateStatus === 'under_review' ? 'bg-yellow-50 text-yellow-600' :
                          s.certificateStatus === 'payment_pending' ? 'bg-orange-50 text-orange-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {s.certificateStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          s.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => toggleStatus(s.id, s.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              s.status === 'active'
                                ? 'hover:bg-red-50 text-red-400'
                                : 'hover:bg-green-50 text-green-500'
                            }`}
                            title={s.status === 'active' ? 'Block Student' : 'Activate Student'}
                          >
                            {s.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">No students found matching your filters.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </AdminLayout>
  );
}
