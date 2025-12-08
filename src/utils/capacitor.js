// src/utils/capacitor.js
import { Capacitor } from '@capacitor/core';

// Detectar si estamos en móvil
export const isMobileApp = () => {
  return Capacitor.isNativePlatform();
};

// Obtener URL base dependiendo de la plataforma
export const getBaseUrl = () => {
  if (isMobileApp()) {
    // En móvil, el backend está configurado en capacitor.config.json
    return ''; // Rutas relativas
  }
  // En web, usar variable de entorno
  return import.meta.env.VITE_API_URL || 'https://backend-olympiahub.onrender.com';
};

// Para recaptcha en móvil
export const getRecaptchaToken = async () => {
  if (isMobileApp()) {
    // En móvil, puedes usar alternativa o deshabilitar
    console.log('En móvil, recaptcha deshabilitado');
    return 'mobile-bypass-token';
  }
  
  // En web, usar recaptcha normal
  if (window.grecaptcha) {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    return window.grecaptcha.execute(siteKey, { action: 'submit' });
  }
  return null;
};