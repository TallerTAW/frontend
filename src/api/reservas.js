// 📍 ARCHIVO: src/api/reservas.js
import api from './index';

export const reservasApi = {
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
    const response = await api.patch(`/reservas/${id}`, reservaData);  // Cambiar put por patch
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

  // HORARIOS DISPONIBLES - usar /reservas/ en lugar de /reservas_opcion/
  getHorariosDisponibles: async (canchaId, fecha) => {
    const response = await api.get(`/reservas/cancha/${canchaId}/horarios-disponibles`, {
      params: { fecha }
    });
    return response.data;
  },

  verificarDisponibilidad: async (canchaId, fecha, horaInicio, horaFin) => {
    const response = await api.get(`/reservas/verificar-disponibilidad`, {
      params: { 
        cancha_id: canchaId, 
        fecha, 
        hora_inicio: horaInicio, 
        hora_fin: horaFin 
      } 
    });
    return response.data;
  },

  // NUEVO: Crear reserva desde frontend
  crearReservaCompleta: async (reservaData) => {
    const response = await api.post('/reservas/', reservaData);
    return response.data;
  }
};