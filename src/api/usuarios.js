import api from './index';

export const usuariosApi = {
  getAll: async (includeInactive = false) => {
    const response = await api.get(`/usuarios?include_inactive=${includeInactive}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  activar: async (id) => {
    const response = await api.put(`/usuarios/${id}/activar`);
    return response.data;
  }
};