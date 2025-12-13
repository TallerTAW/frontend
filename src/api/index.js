// src/api/index.js
import axios from 'axios';

// Detectar plataforma
const isMobileApp = window.Capacitor && window.Capacitor.isNative;

// Configurar URL base según plataforma
const getBaseURL = () => {
  // En móvil nativo, el backend está configurado en capacitor.config.json
  // Las peticiones serán relativas a la URL configurada ahí
  if (isMobileApp) {
    return import.meta.env.VITE_API_URL; //|| 'https://backend-olympiahub.onrender.com';
    //return import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8000';
  }
  
  // En web, usar variable de entorno o valor por defecto
  return import.meta.env.VITE_API_URL; //|| 'https://backend-olympiahub.onrender.com';
  //return import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8000';
};

// Configuración global de axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 segundos (importante para móvil)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Manejar storage según plataforma
const getToken = () => {
  try {
    if (isMobileApp && window.Capacitor?.Plugins?.Storage) {
      // Usar Capacitor Storage en móvil
      return window.Capacitor.Plugins.Storage.get({ key: 'access_token' });
    } else {
      // Usar localStorage en web
      return localStorage.getItem('access_token');
    }
  } catch (error) {
    console.warn('Error obteniendo token:', error);
    return null;
  }
};

const removeToken = () => {
  try {
    if (isMobileApp && window.Capacitor?.Plugins?.Storage) {
      window.Capacitor.Plugins.Storage.remove({ key: 'access_token' });
      window.Capacitor.Plugins.Storage.remove({ key: 'user' });
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.warn('Error removiendo token:', error);
  }
};

const redirectToLogin = () => {
  if (isMobileApp) {
    // En móvil, usar Capacitor App para navegación
    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.openUrl({ url: 'olympiahub://login' });
    } else {
      // Fallback a navegación web
      window.location.href = '/login';
    }
  } else {
    // En web, redirección normal
    window.location.href = '/login';
  }
};

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Añadir header para identificar plataforma
      if (isMobileApp) {
        config.headers['X-Platform'] = 'mobile';
        config.headers['X-App-Version'] = '1.0.0';
      }
      
      return config;
    } catch (error) {
      console.warn('Error en interceptor de request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Limpiar token inválido
      removeToken();
      
      // Si es una petición de login, no redirigir
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }
      
      // Redirigir a login
      redirectToLogin();
      return Promise.reject(new Error('Sesión expirada. Por favor, inicia sesión nuevamente.'));
    }
    
    // Manejar error 403 (Prohibido)
    if (error.response?.status === 403) {
      return Promise.reject(new Error('No tienes permisos para realizar esta acción.'));
    }
    
    // Manejar error de red/timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Error de conexión. Verifica tu internet e intenta nuevamente.'));
    }
    
    // Manejar error de red
    if (!error.response) {
      return Promise.reject(new Error('Error de red. Verifica tu conexión a internet.'));
    }
    
    // Para otros errores, devolver mensaje del servidor o genérico
    const serverMessage = error.response?.data?.detail || error.response?.data?.message;
    if (serverMessage) {
      return Promise.reject(new Error(serverMessage));
    }
    
    return Promise.reject(error);
  }
);

// Función para verificar conexión a internet (útil para móvil)
export const checkConnection = async () => {
  if (isMobileApp && window.Capacitor?.Plugins?.Network) {
    try {
      const status = await window.Capacitor.Plugins.Network.getStatus();
      return status.connected;
    } catch (error) {
      console.warn('Error verificando conexión:', error);
      return navigator.onLine; // Fallback a API web
    }
  }
  return navigator.onLine;
};

// Función para manejar recaptcha en móvil
export const getRecaptchaToken = async (action = 'submit') => {
  if (isMobileApp) {
    // En móvil, puedes usar alternativa o deshabilitar
    console.log('Recaptcha deshabilitado en versión móvil');
    return 'mobile-bypass-token-' + Date.now();
  }
  
  // En web, usar recaptcha normal
  if (window.grecaptcha && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    try {
      const token = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action }
      );
      return token;
    } catch (error) {
      console.warn('Error con recaptcha:', error);
      return null;
    }
  }
  
  console.warn('Recaptcha no configurado');
  return null;
};

export default api;