"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, MessageCircle, Paperclip, X } from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import { type ChatMessage } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';

const BRAND = '#FF4D00';

export default function StudentChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/student/chat/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;
    
    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const msg: ChatMessage = {
      id: tempId,
      senderId: user?.id || 'current',
      senderName: user?.name || 'You',
      senderRole: 'student',
      content: input.trim() || (attachment ? `Sent attachment: ${attachment.name}` : ''),
      timestamp: new Date().toISOString(),
      attachment: attachment ? { name: attachment.name, url: '#' } : undefined,
    };
    setMessages((prev) => [...prev, msg]);
    
    const formData = new FormData();
    if (input.trim()) formData.append('content', input.trim());
    if (attachment) formData.append('file', attachment);

    setInput('');
    setAttachment(null);

    try {
      await fetch('/api/student/chat/messages', {
        method: 'POST',
        body: formData
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
      // Revert on failure could be handled here
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach((m) => {
    const date = formatDate(m.timestamp);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.msgs.push(m);
    } else {
      grouped.push({ date, msgs: [m] });
    }
  });

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
          <div className="w-8 h-8 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-xl border border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: BRAND }}>
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'var(--font-michroma)' }}>ZTOI Mentor</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 border-x border-gray-100 px-4 py-4 flex flex-col gap-1">
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="flex justify-center my-3">
                <span className="px-3 py-1 rounded-full text-xs text-gray-400 bg-gray-200">{group.date}</span>
              </div>
              {group.msgs.map((msg) => {
                const isMe = msg.senderRole === 'student';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1"
                        style={{ background: BRAND }}>
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div
                        className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                        style={isMe
                          ? { background: BRAND, color: '#fff', borderBottomRightRadius: '4px' }
                          : { background: '#fff', color: '#374151', borderBottomLeftRadius: '4px', border: '1px solid #e5e5e5' }
                        }
                      >
                        {msg.content}
                        {msg.attachment && (
                          <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 text-xs opacity-80 hover:underline">
                            <Paperclip size={11} />
                            {msg.attachment.name}
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 mx-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
        <form
          onSubmit={sendMessage}
          className="bg-white rounded-b-xl border border-t-0 border-gray-100 px-4 py-3 flex items-center gap-2 shadow-sm"
        >
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
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 min-w-0"
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
      </div>
    </StudentLayout>
  );
}
