'use client';

import { createContext, useContext, type ReactNode } from 'react';

type User = {
  tenantId: string;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User;
};

const mockUser: User = {
  tenantId: 'tenant-001',
  name: 'Admin ComptaPro',
  role: 'admin',
};

const AuthContext = createContext<AuthContextType>({ user: mockUser });

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: mockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
