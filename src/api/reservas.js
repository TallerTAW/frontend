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
    const response = await api.put(`/reservas/${id}`, reservaData);
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

  confirmar: async (id) => {
    const response = await api.post(`/reservas/${id}/confirmar`);
    return response.data;
  },

  getProximas: async (dias = 7) => {
    const response = await api.get(`/reservas/proximas/${dias}`);
    return response.data;
  }
};