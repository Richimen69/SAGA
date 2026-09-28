const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL, // Asegúrate que en tu .env esto apunte a http://localhost:8000/api
  
  // Timeouts
  TIMEOUT: 30000, 
  
  // Headers por defecto (quitamos el Authorization estático)
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_CONFIG;