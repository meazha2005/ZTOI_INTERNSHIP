import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  domain?: string;
  photo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole; email?: string }>;
  logout: () => Promise<void>;
  register: (data: Record<string, string>) => { success: boolean };
}


const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole; email?: string }> => {
    // Admin login via backend
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser({
          id: data.admin.id.toString(),
          name: data.admin.name,
          email: data.admin.email,
          role: 'admin',
        });
        return { success: true, role: 'admin' };
      }
    } catch (err) {
      console.error("Backend login check error", err);
    }

    // Student login via backend
    try {
      const studentRes = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await studentRes.json();
      if (studentRes.ok) {
        setUser({
          id: data.student.id.toString(),
          name: data.student.name,
          email: data.student.email,
          role: 'student',
          domain: data.student.domain_name,
          photo: data.student.photo_path,
        });
        return { success: true, role: 'student' };
      } else if (data.error === 'unverified') {
        return { success: false, error: 'unverified', email: data.email };
      } else if (data.error && data.error !== 'Invalid credentials') {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("Student login check error", err);
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = async () => {
    try {
      if (user?.role === 'admin') {
        await fetch('/api/admin/logout', { method: 'POST' });
      } else {
        await fetch('/api/student/logout', { method: 'POST' });
      }
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  const register = (_data: Record<string, string>) => {
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
