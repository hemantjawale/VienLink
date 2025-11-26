import { createContext, useContext, useEffect, useState } from 'react';
import publicApi from '../lib/publicApi';

const PublicAuthContext = createContext(null);

export const PublicAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('publicUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const signup = async (data) => {
    const res = await publicApi.post('/public-auth/signup', data);
    const { token, user } = res.data;
    localStorage.setItem('publicToken', token);
    localStorage.setItem('publicUser', JSON.stringify(user));
    setUser(user);
    return res.data;
  };

  const login = async (data) => {
    const res = await publicApi.post('/public-auth/login', data);
    const { token, user } = res.data;
    localStorage.setItem('publicToken', token);
    localStorage.setItem('publicUser', JSON.stringify(user));
    setUser(user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('publicToken');
    localStorage.removeItem('publicUser');
    setUser(null);
  };

  return (
    <PublicAuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </PublicAuthContext.Provider>
  );
};

export const usePublicAuth = () => useContext(PublicAuthContext);
