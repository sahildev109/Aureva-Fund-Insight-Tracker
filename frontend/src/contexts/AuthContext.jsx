import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aureva_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('aureva_user') || 'null'));

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('aureva_token', data.token);
    localStorage.setItem('aureva_user', JSON.stringify({ name: data.name }));
    setToken(data.token);
    setUser({ name: data.name });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aureva_token');
    localStorage.removeItem('aureva_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
