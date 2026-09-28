import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const useProtectedData = () => {
  const navigate = useNavigate();
  const validateSession = useAuthStore((state) => state.validateSession);

  useEffect(() => {
    // Solo le decimos al store que valide la sesión y le pasamos 'navigate' para que pueda redirigir
    validateSession(navigate);
  }, [navigate, validateSession]);
};

export default useProtectedData;