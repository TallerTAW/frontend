import api from './index';

export const espaciosApi = {
  getAll: async (includeInactive = false) => {
    const response = await api.get(`/espacios/?include_inactive=${includeInactive}`);
    return response.data;
  },

  getMisEspacios: async (includeInactive = false) => {
    const response = await api.get(`/espacios/gestor/mis-espacios?include_inactive=${includeInactive}`);
    return response.data;
  },

  getAllAdmin: async (includeInactive = false) => {
    const response = await api.get(`/espacios/admin/todos-espacios?include_inactive=${includeInactive}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/espacios/${id}`);
    return response.data;
  },

  create: async (espacioData) => {
    const response = await api.post('/espacios', espacioData);
    return response.data;
  },

  update: async (id, espacioData) => {
    const response = await api.put(`/espacios/${id}`, espacioData);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.delete(`/espacios/${id}`);
    return response.data;
  },

  activar: async (id) => {
    const response = await api.put(`/espacios/${id}/activar`);
    return response.data;
  },

  getDisponibles: async () => {
    const response = await api.get('/espacios/public/disponibles');
    return response.data;
  },

  getByIdPublic: async (id) => {
    const response = await api.get(`/espacios/public/${id}`);
    return response.data;
  }
};