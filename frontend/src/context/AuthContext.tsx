import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (userData: any, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("aura_token");
    const u = localStorage.getItem("aura_user");

    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem("aura_token");
        localStorage.removeItem("aura_user");
      }
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
    }

    setLoading(false);
  }, []);

  const login = (userData: any, userToken: string) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem("aura_token", userToken);
    localStorage.setItem("aura_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("aura_token");
    localStorage.removeItem("aura_user");
  };

  const value = useMemo(() => ({ user, token, login, logout, loading }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
