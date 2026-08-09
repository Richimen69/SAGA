// src/hooks/useUser.js (O donde guardes tus hooks)
import { useState, useEffect } from "react";
export default function useUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser); 
            } catch (error) {
                console.error("Error al analizar el usuario desde localStorage:", error);
                // Opcional: limpiar localStorage si el formato es inválido
                localStorage.removeItem("user");
            }
        }
    }, []); 
    return user; 
}