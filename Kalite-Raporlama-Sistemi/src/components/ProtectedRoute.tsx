import { Navigate } from "react-router-dom";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") as UserRole | null;

  // ==================================================
  // TOKEN YOKSA LOGIN'E GÖNDER
  // ==================================================

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ==================================================
  // ROL YETKİSİ YOKSA KENDİ ANA SAYFASINA GÖNDER
  // ==================================================

  if (
    allowedRoles &&
    (!userRole || !allowedRoles.includes(userRole))
  ) {
    if (userRole === "worker") {
      return <Navigate to="/worker" replace />;
    }

    if (userRole === "manager") {
      return <Navigate to="/dashboard" replace />;
    }

    if (userRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;