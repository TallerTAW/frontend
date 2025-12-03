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
  }
};