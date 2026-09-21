import { useEffect, useState } from "react";
import type { UserRole } from "../types/auth";

interface AuthUser {
  username: string;
  role: UserRole;
  fullName: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as UserRole | null;
    const fullName = localStorage.getItem("fullName");
    const username = localStorage.getItem("username");

    if (token && role && fullName && username) {
      setUser({
        username,
        role,
        fullName,
      });
    }
  }, []);

  const login = (
    token: string,
    role: string,
    fullName: string,
    username: string
  ) => {
    const normalizedRole = role.toLowerCase() as UserRole;

    localStorage.setItem("token", token);
    localStorage.setItem("role", normalizedRole);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("username", username);

    setUser({
      username,
      role: normalizedRole,
      fullName,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");

    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: Boolean(user),
  };
};