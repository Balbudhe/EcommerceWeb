import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api";
import axiosInstance from "../utils/Axios";
import {
  clearAuthSession,
  isTokenExpired,
  loadAuthSession,
  saveAuthSession,
} from "../utils/authSession";

const AuthContext = createContext(null);

function getAxiosErrorMessage(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  const applyAuth = (data) => {
    const nextToken = data?.token || null;
    const nextUser = data?.user || null;
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    if (nextToken && nextUser) {
      saveAuthSession({ token: nextToken, user: nextUser });
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      clearAuthSession();
    }
  };

  useEffect(() => {
    const session = loadAuthSession();
    if (session?.token && session?.user) {
      setToken(session.token);
      setUser(session.user);
      setAuthToken(session.token);
    }
    setBooting(false);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    const payloadExp = (() => {
      try {
        const json = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        return json.exp ? json.exp * 1000 : null;
      } catch {
        return null;
      }
    })();

    if (!payloadExp) return undefined;

    const remaining = payloadExp - Date.now();
    if (remaining <= 0) {
      logout();
      return undefined;
    }

    const timer = setTimeout(() => {
      logout();
    }, remaining);

    return () => clearTimeout(timer);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      return applyAuth(data);
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
      });
      return data;
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (patch) => {
    const updated = await api.updateProfile(patch);
    const nextUser = updated?.user || updated;
    setUser(nextUser);
    if (token && nextUser) {
      saveAuthSession({ token, user: nextUser });
    }
    return nextUser;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token && !isTokenExpired(token)),
      loading,
      booting,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, token, loading, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
