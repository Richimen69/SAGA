// Configuración centralizada de la API
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  
  // Timeouts
  TIMEOUT: 30000, 
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Token ${import.meta.env.VITE_API_TOKEN}`, 
  },
};

export default API_CONFIG;