import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true, 

  // Valida si hay sesión guardada al recargar la página
  validateSession: (navigate) => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, loading: false });
      if (navigate) navigate("/login");
      return;
    }

    // Si hay token y usuario, los cargamos al estado global.
    // Si el token es viejo/inválido, apiNew.js atrapará el error 401 en la primera petición y cerrará la sesión.
    set({ user: JSON.parse(storedUser), loading: false });
  },

  // Guarda la sesión cuando el usuario hace login con éxito
  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, loading: false });
  },

  // Cierra sesión
  logout: (navigate) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, loading: false });
    if (navigate) navigate("/login");
  }
}));