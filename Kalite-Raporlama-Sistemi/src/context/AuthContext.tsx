import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { UserRole } from "../types/auth";

interface AuthUser {
  username: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (
    token: string,
    role: string,
    fullName: string,
    username: string
  ) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // ==================================================
  // SAYFA YENİLENDİĞİNDE KULLANICIYI GERİ YÜKLE
  // ==================================================

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

  // ==================================================
  // LOGIN
  // ==================================================

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

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext AuthProvider içinde kullanılmalıdır."
    );
  }

  return context;
}