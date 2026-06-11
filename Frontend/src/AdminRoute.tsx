import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (!token) {
    console.warn("No token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    console.warn("User not admin, redirecting home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
