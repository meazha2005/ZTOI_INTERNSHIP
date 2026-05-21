"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, X, CheckCircle, XCircle, Clock, FileArchive, Info, Search, Filter } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { type TaskStatus } from '@/lib/mock-data';

export interface TaskSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  domain: string;
  taskTitle: string;
  status: TaskStatus;
  filePath: string;
  rejectionReason?: string;
  submittedAt: string;
}

const BRAND = '#FF4D00';

interface DomainItem { id: string; name: string; }
interface TaskItem { id: string; domain_id: string; title: string; description: string; domain_name: string; }

function AddTaskModal({ domain, onClose, onAdd }: { domain: DomainItem; onClose: () => void; onAdd: (t: TaskItem) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_id: domain.id, title, description })
      });
      if (response.ok) {
        const data = await response.json();
        onAdd({ ...data.task, domain_name: domain.name });
        onClose();
      } else {
        alert('Failed to add task');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding task');
    }
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
            Add Task — {domain.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a Chatbot UI"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task requirements in detail..."
              rows={5}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90"
              style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EditTaskModal({ task, onClose, onEdit }: { task: TaskItem; onClose: () => void; onEdit: (t: TaskItem) => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      const response = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (response.ok) {
        onEdit({ ...task, title, description });
        onClose();
      } else {
        alert('Failed to update task');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating task');
    }
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
            Edit Task — {task.domain_name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a Chatbot UI"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task requirements in detail..."
              rows={5}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90"
              style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function RejectModal({ submission, onClose, onReject }: {
  submission: TaskSubmission;
  onClose: () => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.9rem' }}>
            Reject Submission
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Rejecting <strong>{submission.studentName}</strong>'s submission for <strong>{submission.taskTitle}</strong>.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Rejection Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what needs to be fixed..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => { onReject(submission.id, reason); onClose(); }}
            disabled={!reason.trim()}
            className="flex-1 py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            style={{ background: '#EF4444' }}
          >
            Reject
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminTasks() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<DomainItem | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<TaskItem | null>(null);
  const [rejectModal, setRejectModal] = useState<TaskSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/domains').then(r => r.json()),
      fetch('/api/admin/tasks').then(r => r.json()),
      fetch('/api/admin/submissions').then(r => r.json())
    ]).then(([domainsData, tasksData, submissionsData]) => {
      if (domainsData.domains) {
        setDomains(domainsData.domains);
        if (domainsData.domains.length > 0) setActiveTab(domainsData.domains[0]);
      }
      if (tasksData.tasks) setTasks(tasksData.tasks);
      if (submissionsData.submissions) setSubmissions(submissionsData.submissions);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const domainTasks = tasks.filter((t) => activeTab && t.domain_id == activeTab.id);
  const domainSubmissions = submissions.filter((s) => {
    if (activeTab && s.domain !== activeTab.name) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.studentName.toLowerCase().includes(q) && !s.taskTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('Failed to delete task');
      }
    } catch(err) {
      console.error(err);
      alert('Error deleting task');
    }
  };

  const acceptSubmission = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}/accept`, { method: 'POST' });
      if (res.ok) {
        setSubmissions((prev) => prev.map((s) => String(s.id) === String(id) ? { ...s, status: 'accepted' as TaskStatus } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rejectSubmission = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setSubmissions((prev) => prev.map((s) => String(s.id) === String(id) ? { ...s, status: 'rejected' as TaskStatus, rejectionReason: reason } : s));
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
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>Task Assignment</h1>
            <p className="text-gray-500 text-sm mt-1">Manage tasks per domain and review student submissions.</p>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100 mb-6">
            <Info size={16} style={{ color: BRAND }} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              <strong>Auto-assignment:</strong> When a student registers, 2 random tasks from their selected domain are automatically assigned to them.
            </p>
          </div>

          {/* Domain Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveTab(d)}
                className="px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all"
                style={activeTab?.id === d.id
                  ? { background: BRAND, color: '#fff', fontFamily: 'var(--font-michroma)', letterSpacing: '0.03em' }
                  : { background: '#fff', color: '#666', border: '1px solid #e5e5e5' }
                }
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>
                Tasks ({domainTasks.length})
              </h2>
              {activeTab && (
                <button
                  onClick={() => setAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-90"
                  style={{ background: BRAND, fontFamily: 'var(--font-michroma)', letterSpacing: '0.05em' }}
                >
                  <Plus size={14} />
                  Add Task
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {domainTasks.map((task) => (
                <div key={task.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{task.title}</p>
                    <p className="text-xs text-gray-400 whitespace-pre-wrap">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditModal(task)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                      title="Edit Task"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Delete Task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {domainTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No tasks yet for this domain. Add your first task.</div>
              )}
            </div>
          </div>

          {/* Submissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>
                Submissions ({domainSubmissions.length})
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{ focusRingColor: BRAND } as React.CSSProperties}
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
                    <option value="submitted">Pending Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {domainSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{sub.studentName}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-[180px] truncate">{sub.taskTitle}</td>
                      <td className="px-5 py-4">
                        <a href={sub.filePath.startsWith('http') ? sub.filePath : `/${sub.filePath}`} target="_blank" className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-xs font-medium">
                          <FileArchive size={14} />
                          Download
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${
                          sub.status === 'accepted' ? 'bg-green-50 text-green-600' :
                          sub.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {sub.status === 'accepted' ? <CheckCircle size={11} /> :
                           sub.status === 'rejected' ? <XCircle size={11} /> :
                           <Clock size={11} />}
                          {sub.status === 'submitted' ? 'Pending Review' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {sub.status === 'submitted' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptSubmission(sub.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle size={12} />
                              Accept
                            </button>
                            <button
                              onClick={() => setRejectModal(sub)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </div>
                        )}
                        {sub.status !== 'submitted' && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {domainSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No submissions yet for this domain.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {addModal && activeTab && (
        <AddTaskModal
          domain={activeTab}
          onClose={() => setAddModal(false)}
          onAdd={(t) => setTasks((prev) => [...prev, t])}
        />
      )}
      {editModal && (
        <EditTaskModal
          task={editModal}
          onClose={() => setEditModal(null)}
          onEdit={(updatedTask) => setTasks((prev) => prev.map(t => t.id === updatedTask.id ? updatedTask : t))}
        />
      )}
      {rejectModal && (
        <RejectModal
          submission={rejectModal}
          onClose={() => setRejectModal(null)}
          onReject={rejectSubmission}
        />
      )}
    </AdminLayout>
  );
}
