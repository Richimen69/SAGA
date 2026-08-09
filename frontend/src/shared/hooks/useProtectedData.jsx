import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const useProtectedData = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchProtectedData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "https://bitacorabc.site/backend/ruta_protegida.php",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status === "success") {
          localStorage.setItem("user", JSON.stringify(data.user));

        } else {
          console.error("Error de autenticación:", data.message);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error al acceder a la ruta protegida:", error);
      }
    };

    fetchProtectedData();
  }, [navigate]);
};

export default useProtectedData;
