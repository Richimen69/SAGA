import { useState, useEffect } from "react";

/**
 * Hook para obtener y formatear el usuario desde localStorage
 * @returns {string} Nombre del usuario formateado
 */
const useUsuario = () => {
  const [usuario, setUsuario] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsuario(user);
      } catch (error) {
        console.error("Error al analizar el usuario desde localStorage:", error);
      }
    }
  }, []);

  return usuario;
};

export default useUsuario;