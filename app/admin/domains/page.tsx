"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Save, X, BookOpen, Users } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

const BRAND = '#FF4D00';

interface DomainItem {
  id: string;
  name: string;
  description: string;
  student_count?: number;
}



function AddDomainModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: DomainItem) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (response.ok) {
        const data = await response.json();
        onAdd(data.domain);
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add domain');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding domain');
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
            Add New Domain
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Machine Learning"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn..."
              rows={4}
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
              Add Domain
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDomains() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        if (data.domains) setDomains(data.domains);
      })
      .catch(err => console.error('Error fetching domains:', err))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (d: DomainItem) => {
    setEditingId(d.id);
    setEditForm({ name: d.name, description: d.description });
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/domains/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        setDomains((prev) => prev.map((d) => d.id === id ? { ...d, ...editForm } : d));
        setEditingId(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update domain');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating domain');
    }
  };

  const deleteDomain = async (id: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return;
    try {
      const response = await fetch(`/api/admin/domains/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert('Failed to delete domain');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting domain');
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
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)' }}>Manage Domains</h1>
              <p className="text-gray-500 text-sm mt-1">{domains.length} domains available</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
              style={{ background: BRAND, fontFamily: 'var(--font-michroma)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              <Plus size={16} />
              Add Domain
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {domains.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                {editingId === d.id ? (
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2"
                      style={{ fontFamily: 'var(--font-michroma)' }}
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit(d.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90"
                        style={{ background: BRAND }}
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${BRAND}15` }}>
                          <BookOpen size={18} style={{ color: BRAND }} />
                        </div>
                        <h3 className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-michroma)', fontSize: '0.95rem' }}>
                          {d.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <Users size={14} />
                          <span className="font-semibold">{d.student_count || 0}</span>
                          <span className="text-gray-400">students</span>
                        </div>
                        <button
                          onClick={() => startEdit(d)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Edit Domain"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteDomain(d.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Domain"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed ml-13">{d.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {showAdd && (
        <AddDomainModal
          onClose={() => setShowAdd(false)}
          onAdd={(d) => setDomains((prev) => [...prev, d])}
        />
      )}
    </AdminLayout>
  );
}
