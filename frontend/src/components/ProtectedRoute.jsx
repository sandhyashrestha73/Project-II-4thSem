import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  allowedRoles,
  children,
}) {
  const { user, role } = useAuth();
  const location = useLocation();

  // User is not logged in
  if (!user) {
    const isAdminRoute =
      allowedRoles?.includes("admin");

    return (
      <Navigate
        to={isAdminRoute ? "/admin_login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  // User is logged in but doesn't have permission
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}