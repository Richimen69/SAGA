import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  // Extraemos lo que necesitamos del store
  const { user, loading, validateSession } = useAuthStore();

  useEffect(() => {
    validateSession(navigate);
  }, [validateSession, navigate]);

  if (loading) return <div>Cargando sesión...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
