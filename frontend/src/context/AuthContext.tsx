import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [token, setToken] = useState<string | null>(localStorage.getItem('aura_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aura_user');
    // Chỉ thiết lập user nếu CẢ token và user đều tồn tại trong máy
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      logout(); // Xóa sạch dữ liệu thừa nếu thiếu 1 trong 2
    }
    setLoading(false);
  }, [token]);

  const login = (userData: any, userToken: string) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('aura_token', userToken);
    localStorage.setItem('aura_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};