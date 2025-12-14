import api from './index';

export const reservasApi = {
  // ✅ MÉTODO NUEVO: Para reservas con cupones (agregado por tu compañero)
  createCompleta: async (reservaData) => {
    console.log('🚀 [API] Enviando reserva completa con cupón:', reservaData.codigo_cupon);
    const response = await api.post('/reservas', reservaData);
    console.log('✅ [API] Reserva creada exitosamente:', response.data);
    return response.data;
  },

  // ✅ MÉTODOS EXISTENTES (tuyos)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await api.get(`/reservas?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  create: async (reservaData) => {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  },

  update: async (id, reservaData) => {
    const response = await api.patch(`/reservas/${id}`, reservaData);
    return response.data;
  },

  cancelar: async (id, motivo) => {
    const response = await api.delete(`/reservas/${id}?motivo=${encodeURIComponent(motivo)}`);
    return response.data;
  },

  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/reservas/usuario/${usuarioId}`);
    return response.data;
  },

  getByGestor: async (gestorId) => {
    const response = await api.get(`/reservas/gestor/mis-reservas?gestor_id=${gestorId}`);
    return response.data;
  },

  confirmar: async (id) => {
    const response = await api.post(`/reservas/${id}/confirmar`);
    return response.data;
  },

  getProximas: async (dias = 7) => {
    const response = await api.get(`/reservas/proximas/${dias}`);
    return response.data;
  },

  // ✅ HORARIOS DISPONIBLES - Versión mejorada (combinación de ambas)
  getHorariosDisponibles: async (canchaId, fecha) => {
    // Intentar con el nuevo endpoint primero, luego con el antiguo como fallback
    try {
      const response = await api.get(`/reservas/cancha/${canchaId}/horarios-disponibles`, {
        params: { fecha }
      });
      return response.data;
    } catch (error) {
      // Fallback al endpoint original
      console.log('Usando endpoint alternativo para horarios disponibles');
      const response = await api.get(`/reservas/cancha/${canchaId}/horarios-disponibles`, {
        params: { fecha }
      });
      return response.data;
    }
  },

  verificarDisponibilidad: async (canchaId, fecha, horaInicio, horaFin) => {
    // Intentar con el nuevo endpoint primero
    try {
      const response = await api.get(`/reservas/verificar-disponibilidad`, {
        params: { 
          cancha_id: canchaId, 
          fecha, 
          hora_inicio: horaInicio, 
          hora_fin: horaFin 
        } 
      });
      return response.data;
    } catch (error) {
      // Fallback al endpoint original
      console.log('Usando endpoint alternativo para verificar disponibilidad');
      const response = await api.get(`/reservas/verificar-disponibilidad`, {
        params: { 
          cancha_id: canchaId, 
          fecha, 
          hora_inicio: horaInicio, 
          hora_fin: horaFin 
        } 
      });
      return response.data;
    }
  },

  // ✅ MÉTODO NUEVO: Obtener reserva por código (agregado por tu compañero)
  getByCodigo: async (codigoReserva) => {
    const response = await api.get(`/reservas/codigo/${codigoReserva}`);
    return response.data;
  },

  // ✅ MÉTODO EXISTENTE: Crear reserva desde frontend (tuyo)
  crearReservaCompleta: async (reservaData) => {
    // Usar el nuevo método createCompleta si hay cupón, sino el método original
    if (reservaData.codigo_cupon) {
      return await reservasApi.createCompleta(reservaData);
    } else {
      return await reservasApi.create(reservaData);
    }
  },

  // ✅ MÉTODO NUEVO: Cancelar simple (agregado por tu compañero)
  cancel: async (id) => {
    const response = await api.put(`/reservas/${id}`, { estado: 'cancelada' });
    return response.data;
  },

  // ✅ MÉTODO NUEVO: Eliminar (agregado por tu compañero)
  delete: async (id) => {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },


verificarQR: async (codigo_qr, token_verificacion) => {
  try {
    console.log('📱 Enviando verificación QR:', { codigo_qr });
    
    const response = await api.post('/control-acceso/verificar-qr', {
      codigo_qr,
      token_verificacion
    });
    
    console.log('✅ Respuesta exitosa:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error en verificarQR:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // ✅ MEJOR MANEJO DE ERRORES CON INFORMACIÓN ESTRUCTURADA
    let errorDetail = error.response?.data?.detail;
    let errorMessage = 'Error verificando el código QR';
    
    if (errorDetail) {
      if (typeof errorDetail === 'object') {
        // Si es un objeto estructurado
        errorMessage = errorDetail.message || errorMessage;
      } else {
        // Si es un string
        errorMessage = errorDetail;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const apiError = new Error(errorMessage);
    apiError.response = error.response;
    apiError.status = error.response?.status;
    apiError.detail = errorDetail; // ✅ Preservar toda la información
    
    throw apiError;
  }
},

crearReservaConAsistentes: async (reservaData) => {
  try {
    const response = await api.post('/reservas/crear-con-asistentes', reservaData);
    return response.data;
  } catch (error) {
    throw error;
  }
},

obtenerAsistentesReserva: async (reserva_id) => {
  try {
    const response = await api.get(`/control-acceso/asistentes/${reserva_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
},
 crearReservaConCodigoUnico: async (reservaData) => {
  console.log('[API] Enviando reserva con código único');
  const response = await api.post('/reservas/crear-con-codigo-unico', reservaData);
  console.log('[API] Reserva creada exitosamente:', response.data);
  
  // ✅ Asegurar que la respuesta tiene el código
  if (!response.data.codigo_reserva) {
    console.warn('[API] La respuesta no tiene codigo_reserva, usando id como fallback');
    response.data.codigo_reserva = `RES-${response.data.id_reserva}`;
  }
  
  return response.data;
},

  unirseConCodigo: async (codigoReserva, invitadoData) => {
    console.log('[API] Uniendo invitado con código');
    const response = await api.post(`/reservas/unirse-con-codigo/${codigoReserva}`, invitadoData);
    console.log('[API] Invitado unido exitosamente');
    return response.data;
  },
  registerWithReservation: async (codigoReserva, userData) => {
    console.log('[AUTH] Registrando con reserva:', codigoReserva);
    // Usar el endpoint especial para registro + unión
    const response = await api.post(`/reservas/registrar-y-unirse/${codigoReserva}`, userData);
    return response.data;
  },
};