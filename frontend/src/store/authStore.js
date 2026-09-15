import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true, // Inicia cargando para dar tiempo de validar el token

  // Acción para validar el token y obtener el usuario
  validateSession: async (navigate) => {
    const token = localStorage.getItem("token"); //[cite: 1]

    if (!token) {
      set({ user: null, loading: false });
      if (navigate) navigate("/login"); //[cite: 1]
      return;
    }

    try {
      const response = await fetch(
        "https://bitacorabc.site/backend/ruta_protegida.php", //[cite: 1]
        {
          method: "GET", //[cite: 1]
          headers: {
            Authorization: `Bearer ${token}`, //[cite: 1]
          },
        }
      );

      const data = await response.json(); //[cite: 1]

      if (data.status === "success") { //[cite: 1]
        set({ user: data.user, loading: false });
      } else {
        localStorage.removeItem("token");
        set({ user: null, loading: false });
        if (navigate) navigate("/login"); //[cite: 1]
      }
    } catch (error) {
      console.error("Error al acceder a la ruta protegida:", error); //[cite: 1]
      set({ user: null, loading: false });
      if (navigate) navigate("/login");
    }
  },

  // Acción simple para cerrar sesión
  logout: (navigate) => {
    localStorage.removeItem("token");
    set({ user: null });
    if (navigate) navigate("/login");
  }
}));