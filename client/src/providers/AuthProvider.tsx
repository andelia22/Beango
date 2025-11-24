import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { queryClient } from '@/lib/queryClient';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const refreshAuth = async () => {
    await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  };

  return (
    <AuthContext.Provider value={{ ...auth, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
