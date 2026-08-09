import { useState, useEffect } from "react";
import { fetchFolios } from "@/features/bitacora/services/tramitesClientes";
import useUser from "./GetUser";

export default function useGenerarFolio() {
    const user = useUser();
    const [foliosCargados, setFoliosCargados] = useState([]);
    const [nuevoFolio, setNuevoFolio] = useState(null);

    // 1. Cargar folios una sola vez (se ejecuta en el primer render)
    useEffect(() => {
        const loadFolios = async () => {
            try {
                const data = await fetchFolios();            
                setFoliosCargados(data.folios || []); 
            } catch (error) {
                console.error("Error al cargar folios:", error);
                setFoliosCargados([]);
            }
        };
        loadFolios();
    }, []);

    // 2. Calcular folio cada vez que 'user' o 'foliosCargados' cambian
    useEffect(() => {
        if (!user || foliosCargados.length === 0) {
           
            return;
        }

        const usuarioInicial = user.usuario_usu.charAt(0).toUpperCase();
        
        // Función de cálculo
        const generarNuevoFolio = () => {
            const foliosUsuario = foliosCargados
                
                .filter((folio) => folio.startsWith(usuarioInicial + "-"))
                
                .map((folio) => parseInt(folio.split("-")[1])) 
                
                .sort((a, b) => a - b);
            
            const ultimoNumero = 
                foliosUsuario.length > 0 ? foliosUsuario[foliosUsuario.length - 1] : 0;

            const siguienteNumero = (ultimoNumero + 1).toString().padStart(4, "0");

            return `${usuarioInicial}-${siguienteNumero}`;
        };
        
        setNuevoFolio(generarNuevoFolio());
        
    }, [user, foliosCargados]);

    return nuevoFolio;
}