import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: null,
    userId: null,
    role: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  // On mount, hydrate auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check token expiry
        if (decoded.exp * 1000 > Date.now()) {
          setAuthState({
            token,
            userId: decoded.userId,
            role: decoded.role,
            isAuthenticated: true,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Called after successful login — saves token and decodes payload
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setAuthState({
      token,
      userId: decoded.userId,
      role: decoded.role,
      isAuthenticated: true,
    });
  };


  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      userId: null,
      role: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
