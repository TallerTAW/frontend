// 📍 ARCHIVO: src/api/reservas.js
// 🎯 ACTUALIZADO: Usar los nuevos prefijos

import api from './index';

export const reservasApi = {
  // ✅ MÉTODO ACTUALIZADO: Usar /reservas-completas/ para reservas con cupones
  createCompleta: async (reservaData) => {
    console.log('🚀 [API] Enviando reserva completa con cupón:', reservaData.codigo_cupon);
    const response = await api.post('/reservas-completas', reservaData); // ← NUEVO PREFIJO
    console.log('✅ [API] Reserva creada exitosamente:', response.data);
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

  // Métodos básicos - siguen usando /reservas/
  create: async (reservaData) => {
    const response = await api.post('/reservas', reservaData);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/reservas', { params });
  update: async (id, reservaData) => {
    const response = await api.patch(`/reservas/${id}`, reservaData);  // Cambiar put por patch
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reservas/${id}`);
    return response.data;
  },

  getByUsuario: async (usuarioId) => {
    const response = await api.get('/reservas', { 
      params: { id_usuario: usuarioId } 
    });
    return response.data;
  },

  update: async (id, reservaData) => {
    const response = await api.put(`/reservas/${id}`, reservaData);
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.put(`/reservas/${id}`, { estado: 'cancelada' });
   getByGestor: async (gestorId) => {
    const response = await api.get(`/reservas/gestor/mis-reservas?gestor_id=${gestorId}`);
    return response.data;
  },

  confirmar: async (id) => {
    const response = await api.post(`/reservas/${id}/confirmar`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reservas/${id}`);
    return response.data;
  },

  // ✅ ACTUALIZADO: Usar /reservas-completas/ para disponibilidad
  getDisponibilidad: async (canchaId, fecha) => {
    const response = await api.get(`/reservas-completas/cancha/${canchaId}/horarios-disponibles`, {
      params: { fecha }
    });
    return response.data;
  },

  verificarDisponibilidad: async (canchaId, fecha, horaInicio, horaFin) => {
    const response = await api.get('/reservas-completas/verificar-disponibilidad', {
      params: {
        cancha_id: canchaId,
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      }
    });
    return response.data;
  },

  getByCodigo: async (codigoReserva) => {
    const response = await api.get(`/reservas-completas/codigo/${codigoReserva}`);
    return response.data;
  }
};