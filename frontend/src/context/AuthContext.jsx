import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, clearAuth, readStoredUser, saveAuth } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("taskflow_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/api/auth/me")
      .then((data) => {
        const currentUser = {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(currentUser);
        localStorage.setItem("taskflow_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveAuth(data);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveAuth(data);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, isAdmin: user?.role === "admin" }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
