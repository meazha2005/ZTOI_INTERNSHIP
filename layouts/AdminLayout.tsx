"use client";

import { type ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  MessageSquare,
  CreditCard,
  Mail,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import DeviceWarningModal from '@/components/DeviceWarningModal';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Domains', icon: BookOpen, path: '/admin/domains' },
  { label: 'Tasks', icon: ClipboardList, path: '/admin/tasks' },
  { label: 'Chat', icon: MessageSquare, path: '/admin/chat' },
  { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
  { label: 'Emails', icon: Mail, path: '/admin/emails' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F4F4' }}>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 min-w-[256px]" style={{ background: '#0D0D0D' }}>
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/" className="block">
          <span style={{ fontFamily: 'var(--font-michroma)', color: '#FF4D00', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            ZTOI TECH
          </span>
          <p className="text-white/40 text-xs mt-1">Admin Portal</p>
        </Link>
      </div>

      {/* Admin Badge */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FF4D00' }}>
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{user?.name || 'Admin'}</p>
            <p className="text-white/40 text-xs">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                active ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
              style={active ? { background: '#FF4D00' } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F4F4F4' }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border">
          <span style={{ fontFamily: 'var(--font-michroma)', color: '#FF4D00', fontSize: '1rem', fontWeight: 700 }}>
            ZTOI TECH
          </span>
          <button onClick={() => setMobileOpen(true)} className="p-2">
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      <DeviceWarningModal />
    </div>
  );
}
