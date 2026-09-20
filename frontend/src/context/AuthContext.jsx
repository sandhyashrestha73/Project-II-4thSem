import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginTourist,
  loginAgency,
  loginAdmin,
  registerTourist,
  registerAgency,
} from "../services/authService";

const AuthContext = createContext(null);

// Reads the previously saved session (if any) so a page refresh doesn't log the user out.
function loadStoredUser() {
  const raw = localStorage.getItem("tourease_user");
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("tourease_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("tourease_user");
    }
  }, [user]);

  function persistSession(token, role, profile, idField) {
    localStorage.setItem("tourease_token", token);
    const sessionUser = { role, id: profile[idField], ...profile };
    setUser(sessionUser);
    return sessionUser;
  }

  async function login(role, email, password) {
    setLoading(true);
    try {
      if (role === "tourist") {
        const data = await loginTourist(email, password);
        return persistSession(data.access_token, "tourist", data.tourist, "tourist_id");
      }
      if (role === "agency") {
        const data = await loginAgency(email, password);
        return persistSession(data.access_token, "agency", data.agency, "agency_id");
      }
      if (role === "admin") {
        const data = await loginAdmin(email, password);
        return persistSession(data.access_token, "admin", data.admin, "admin_id");
      }
      throw new Error("Unknown role");
    } finally {
      setLoading(false);
    }
  }

  async function registerAsTourist(payload) {
    setLoading(true);
    try {
      return await registerTourist(payload);
    } finally {
      setLoading(false);
    }
  }

  async function registerAsAgency(payload) {
    setLoading(true);
    try {
      return await registerAgency(payload);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("tourease_token");
    localStorage.removeItem("tourease_user");
    setUser(null);
  }

  const value = {
    user,
    role: user?.role || null,
    loading,
    login,
    logout,
    registerAsTourist,
    registerAsAgency,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
