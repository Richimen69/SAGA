import React from "react";
import { Navigate } from "react-router-dom";

// Componente para proteger las rutas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Si no hay token en localStorage, redirige al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si hay token, permite el acceso a la ruta protegida
  return children;
};

export default ProtectedRoute;
