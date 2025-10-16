import api from './index';

export const canchasApi = {
  getAll: async () => {
    const response = await api.get('/canchas/');
    return response.data;
  },

  getMisCanchas: async () => {
    const response = await api.get('/canchas/gestor/mis-canchas');
    return response.data;
  },

  getAllAdmin: async () => {
    const response = await api.get('/canchas/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/canchas/${id}`);
    return response.data;
  },

  getByEspacio: async (espacioId) => {
    const response = await api.get(`/canchas/espacio/${espacioId}`);
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

  delete: async (id) => {
    const response = await api.delete(`/canchas/${id}`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.put(`/canchas/${id}/desactivar`);
    return response.data;
  },

  activar: async (id) => {
    const response = await api.put(`/canchas/${id}/activar`);
    return response.data;
  },

  getDisponibles: async () => {
    const response = await api.get('/canchas/public/disponibles');
    return response.data;
  },

  getByEspacioPublic: async (espacioId) => {
    const response = await api.get(`/canchas/public/espacio/${espacioId}`);
    return response.data;
  },

  getByIdPublic: async (id) => {
    const response = await api.get(`/canchas/public/${id}`);
    return response.data;
  }
};