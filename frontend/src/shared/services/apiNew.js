import API_CONFIG from '@/shared/config/apiConfig';

const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}/${endpoint}`;
  
  
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...options.headers,
  };

  // NUEVO: Recuperamos el token JWT y lo inyectamos dinámicamente
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'omit',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // NUEVO: Si Django responde 401 (No autorizado/Expirado), limpiamos y mandamos al login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return { success: false, message: 'Sesión expirada' };
    }

    if (response.status === 204) {
      return { success: true, message: 'Operación exitosa', data: null };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = { success: false, message: 'La respuesta del servidor no es válida', errors: {} };
    }
    return data;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'La solicitud ha excedido el tiempo de espera', errors: {} };
    }
    return { success: false, message: error.message || 'Error de conexión', errors: {} };
  }
};

export default fetchApi;