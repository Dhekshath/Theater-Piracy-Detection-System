import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<User & { exp: number }>(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          // Token is expired
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Token is valid
          setUser({
            id: decodedToken.id,
            username: decodedToken.username,
            role: decodedToken.role
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwtDecode<User>(token);
      setUser({
        id: decodedToken.id,
        username: decodedToken.username,
        role: decodedToken.role
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};