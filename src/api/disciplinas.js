import api from './index';

export const disciplinasApi = {
  getAll: async () => {
    const response = await api.get('/disciplinas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/disciplinas/${id}`);
    return response.data;
  },

  create: async (disciplinaData) => {
    const response = await api.post('/disciplinas', disciplinaData);
    return response.data;
  },

  update: async (id, disciplinaData) => {
    const response = await api.put(`/disciplinas/${id}`, disciplinaData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/disciplinas/${id}`);
    return response.data;
  }
};