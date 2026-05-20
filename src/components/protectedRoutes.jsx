// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // 🔒 No token → go to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚫 Role mismatch → redirect home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
