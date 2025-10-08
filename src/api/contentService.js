// frontend/src/api/contentService.js

import api from './index.js'; // Asegúrate de que esta ruta sea correcta

/**
 * Obtiene todo el contenido dinámico desde el Backend de FastAPI (Solo lectura).
 */
export async function fetchWebsiteContent() {
  try {
    const response = await api.get('/content/'); 
    return response.data; 
  } catch (error) {
    console.error('Error fetching website content from API:', error);
    return {};
  }
}

/**
 * Actualiza el valor de una clave de contenido específica en la BD.
 * Requiere que el token de autenticación esté configurado en Axios (Bear Token).
 */
export async function updateContent(key, newValue) {
  try {
    const payload = {
      new_value: newValue, // Coincide con el esquema ContentUpdate(new_value: str) de FastAPI
    };
    
    // Llamada PUT a la ruta protegida: /content/{key}
    const response = await api.put(`/content/${key}`, payload); 

    return { success: true, message: response.data.message };

  } catch (error) {
    console.error(`Error updating content key '${key}':`, error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.detail || 'Error al actualizar. Verifique sus permisos.';
    return { success: false, message: errorMessage };
  }
}