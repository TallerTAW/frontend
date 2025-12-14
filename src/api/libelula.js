import api from './index'; // Asegúrate que este 'api' esté configurado con el baseURL (ej: http://localhost:8000)

/**
 * Inicia el proceso de pago con Libelula creando una transacción en el backend.
 * @param {object} pagoData - Datos necesarios para el pago, incluyendo reserva_id.
 * @returns {object} Respuesta del servidor, que contiene la url_pago_libelula.
 */
export const iniciarPagoLibelula = async (pagoData) => {
  console.log('🚀 [API Libelula] Enviando solicitud para iniciar pago:', pagoData);
  
  try {
    const response = await api.post('/pagos/libelula/iniciar', pagoData); 
    
    console.log('✅ [API Libelula] Pago iniciado exitosamente:', response.data);
    return response.data; 
    
  } catch (error) {
    console.error('❌ Error al iniciar el pago con Libelula:', error);
    
    let errorMessage = 'Error desconocido al iniciar el pago con Libelula.';
    
    // Mejor manejo de errores para devolver un mensaje útil al frontend
    if (error.response) {
      // 4xx o 5xx del servidor (e.g., 404, 422, 500)
      const detail = error.response.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        // Error de validación de FastAPI (422)
        errorMessage = `Error de validación: ${detail[0].msg} en el campo ${detail[0].loc.pop()}`;
      } else {
        errorMessage = `Error del servidor (${error.response.status}).`;
      }
    } else if (error.request) {
      errorMessage = 'No se recibió respuesta del servidor. Verifica que el Backend esté corriendo.';
    } else {
      errorMessage = error.message;
    }
    
    // Lanzar un error con un mensaje más limpio para el modal
    const apiError = new Error(`Fallo al iniciar el proceso de pago. Detalle: ${errorMessage}`);
    apiError.status = error.response?.status;
    
    throw apiError;
  }
};