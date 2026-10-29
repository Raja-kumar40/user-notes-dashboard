import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("notes_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem("notes_token");
        localStorage.removeItem("notes_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signup(name, email, password) {
    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    localStorage.setItem("notes_token", response.data.token);
    localStorage.setItem("notes_user", JSON.stringify(response.data.user));
    setUser(response.data.user);

    return response.data;
  }

  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("notes_token", response.data.token);
    localStorage.setItem("notes_user", JSON.stringify(response.data.user));
    setUser(response.data.user);

    return response.data;
  }

  function logout() {
    localStorage.removeItem("notes_token");
    localStorage.removeItem("notes_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}