import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/database/indexedDB';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasAdmin: boolean;
  register: (email: string, password: string) => Promise<boolean>;
  updatePassword: (current: string, next: string) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const navigate = useNavigate();

  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  useEffect(() => {
    // Check for existing session on mount
    const init = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const admin = await db.getAdmin();
        setHasAdmin(!!admin);
        if (token) {
          setIsAuthenticated(true);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const admin = await db.getAdmin();
      if (!admin) {
        // No admin configured yet – require registration flow
        return false;
      }
      const hashed = await hashPassword(password);
      if (hashed === admin.passwordHash) {
        const token = 'admin-token-' + Date.now();
        localStorage.setItem('adminToken', token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const existing = await db.getAdmin();
      if (existing) {
        return false; // already registered
      }
      const hashed = await hashPassword(password);
      await db.setAdmin(email, hashed);
      setHasAdmin(true);
      return true;
    } catch (e) {
      console.error('Register failed:', e);
      return false;
    }
  };

  const updatePassword = async (current: string, next: string): Promise<boolean> => {
    try {
      const admin = await db.getAdmin();
      if (!admin) return false;
      const currentHashed = await hashPassword(current);
      if (currentHashed !== admin.passwordHash) return false;
      const nextHashed = await hashPassword(next);
      await db.updateAdminPassword(nextHashed);
      return true;
    } catch (e) {
      console.error('Update password failed:', e);
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, loading, hasAdmin, register, updatePassword }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
