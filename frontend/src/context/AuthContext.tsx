import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API } from '../utils';

interface UserPayload {
  id_actor: number;
  rol: string;
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload>(token);
        // Simple expiration check
        if ((decoded as any).exp * 1000 < Date.now()) {
          logout();
        } else {
          setIsAuthenticated(true);
          setUserRole(decoded.rol);
          setUsername(decoded.username);
        }
      } catch {
        logout();
      }
    }
  }, []);

  const login = async (user: string, pass: string) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('token', data.token);
        const decoded = jwtDecode<UserPayload>(data.token);
        setIsAuthenticated(true);
        setUserRole(decoded.rol);
        setUsername(decoded.username);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
