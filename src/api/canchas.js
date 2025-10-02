import api from './index';

export const canchasApi = {
  getAll: async () => {
    const response = await api.get('/canchas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/canchas/${id}`);
    return response.data;
  },

  create: async (canchaData) => {
    const response = await api.post('/canchas', canchaData);
    return response.data;
  },

  update: async (id, canchaData) => {
    const response = await api.put(`/canchas/${id}`, canchaData);
    return response.data;
  },

  getDisponibilidad: async (canchaId, fecha) => {
    const response = await api.get(`/reservas/cancha/${canchaId}/disponibilidad?fecha=${fecha}`);
    return response.data;
  }
};