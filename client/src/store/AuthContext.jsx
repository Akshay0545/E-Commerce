import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, clearToken, getToken } from "../api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!getToken()) return setReady(true);
      try { const me = await api.me(); setUser(me); } catch { clearToken(); }
      setReady(true);
    })();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password });
    setToken(token); setUser(user); return user;
  };
  const signup = async (name, email, password) => {
    const { token, user } = await api.signup({ name, email, password });
    setToken(token); setUser(user); return user;
  };
  const logout = () => { clearToken(); setUser(null); };

  return <AuthCtx.Provider value={{ user, ready, login, signup, logout }}>
    {children}
  </AuthCtx.Provider>;
}
