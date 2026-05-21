"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'student' | 'admin' }) {
  const { isLoggedIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn || !user) {
        router.replace('/login');
      } else if (user.role !== allowedRole) {
        if (user.role === 'admin') {
          router.replace('/admin/dashboard');
        } else if (user.role === 'student') {
          router.replace('/student/dashboard');
        } else {
          router.replace('/login');
        }
      }
    }
  }, [isLoggedIn, user, loading, allowedRole, router]);

  if (loading || !isLoggedIn || !user || user.role !== allowedRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
