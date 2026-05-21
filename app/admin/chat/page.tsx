"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Paperclip, MessageSquare, X, ArrowLeft } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  content: string;
  timestamp: string;
  attachment?: { name: string; url: string };
  is_read?: number;
}

const BRAND = '#FF4D00';

export default function AdminChat() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const activeMessages = selectedStudentId ? (conversations[selectedStudentId] || []) : [];
  const selectedStudent = students.find((s) => String(s.id) === String(selectedStudentId));

  const fetchSync = async () => {
    try {
      const res = await fetch('/api/admin/chat/sync');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSync();
    const interval = setInterval(fetchSync, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetch('/api/admin/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudentId })
      }).then(() => fetchSync());
    }
  }, [selectedStudentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, selectedStudentId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;
    if (!selectedStudentId) return;

    const tempId = `admin-${Date.now()}`;
    const msg: ChatMessage = {
      id: tempId,
      senderId: 'admin',
      senderName: 'ZTOI Mentor',
      senderRole: 'admin',
      content: input.trim() || (attachment ? `Sent attachment: ${attachment.name}` : ''),
      timestamp: new Date().toISOString(),
      attachment: attachment ? { name: attachment.name, url: '#' } : undefined,
    };

    setConversations((prev) => ({
      ...prev,
      [selectedStudentId]: [...(prev[selectedStudentId] || []), msg],
    }));

    const formData = new FormData();
    formData.append('student_id', selectedStudentId);
    if (input.trim()) formData.append('content', input.trim());
    if (attachment) formData.append('file', attachment);

    setInput('');
    setAttachment(null);

    try {
      await fetch('/api/admin/chat/messages', {
        method: 'POST',
        body: formData
      });
      fetchSync();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getLastMessage = (studentId: string) => {
    const msgs = conversations[studentId] || [];
    return msgs[msgs.length - 1];
  };

  const getUnreadCount = (studentId: string) => {
    const msgs = conversations[studentId] || [];
    return msgs.filter((m) => m.senderRole === 'student' && !m.is_read).length;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
          <div className="w-8 h-8 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex gap-4">

        {/* Student List — hidden on mobile when chat is open */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${selectedStudentId ? 'hidden md:flex' : 'flex'} w-full md:w-72 md:flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex-col overflow-hidden`}
        >
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {students
              .slice()
              .sort((a, b) => {
                const unreadA = getUnreadCount(a.id);
                const unreadB = getUnreadCount(b.id);
                if ((unreadA > 0) !== (unreadB > 0)) {
                  return unreadA > 0 ? -1 : 1;
                }
                const lastA = getLastMessage(a.id);
                const lastB = getLastMessage(b.id);
                const timeA = lastA ? new Date(lastA.timestamp).getTime() : 0;
                const timeB = lastB ? new Date(lastB.timestamp).getTime() : 0;
                return timeB - timeA;
              })
              .map((student) => {
              const lastMsg = getLastMessage(student.id);
              const unread = getUnreadCount(student.id);
              const isActive = selectedStudentId === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors border-b border-gray-50 ${
                    isActive ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full bg-gray-100" />
                    {unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: BRAND }}>
                        {unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {student.name}
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-1">
                          {formatTime(lastMsg.timestamp)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {lastMsg ? lastMsg.content : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Chat Window — full width on mobile when student selected */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${selectedStudentId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}
        >
          {selectedStudentId ? (
            <>
              {/* Header */}
              <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg mr-1 flex-shrink-0"
                >
                  <ArrowLeft size={18} className="text-gray-600" />
                </button>
                {selectedStudent && (
                  <>
                    <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: 'var(--font-michroma)' }}>
                        {selectedStudent.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{selectedStudent.domain}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 flex flex-col gap-2">
                {activeMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">No messages yet. Start the conversation.</p>
                  </div>
                )}
                {activeMessages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {!isAdmin && (
                        <img
                          src={selectedStudent?.photo}
                          alt=""
                          className="w-7 h-7 rounded-full mr-2 self-end mb-1 flex-shrink-0"
                        />
                      )}
                      <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div
                          className="px-4 py-2.5 rounded-2xl text-sm"
                          style={isAdmin
                            ? { background: BRAND, color: '#fff', borderBottomRightRadius: '4px' }
                            : { background: '#fff', color: '#374151', borderBottomLeftRadius: '4px', border: '1px solid #e5e5e5' }
                          }
                        >
                          {msg.content}
                          {msg.attachment && (
                                <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs opacity-80 hover:underline">
                                  <Paperclip size={11} />
                                  {msg.attachment.name}
                                </a>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Attachment preview */}
              {attachment && (
                <div className="px-4 py-2 bg-orange-50 border-t border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Paperclip size={14} style={{ color: BRAND }} />
                    <span className="truncate max-w-[200px]">{attachment.name}</span>
                  </div>
                  <button onClick={() => setAttachment(null)} className="p-1 hover:bg-orange-100 rounded">
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
              )}

              {/* Input */}
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <Paperclip size={18} />
                </button>
                <input ref={fileRef} type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="hidden" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-gray-50 min-w-0"
                />
                <button
                  type="submit"
                  disabled={!input.trim() && !attachment}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 flex-shrink-0"
                  style={{ background: BRAND }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            /* Desktop empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={40} className="mb-3 opacity-20" />
              <p className="text-sm">Select a student to start chatting</p>
            </div>
          )}
        </motion.div>

      </div>
    </AdminLayout>
  );
}
