import api from './index';

export const comentariosApi = {
  getAll: async (idUsuario = null, idCancha = null) => {
    const params = new URLSearchParams();
    if (idUsuario) params.append('id_usuario', idUsuario);
    if (idCancha) params.append('id_cancha', idCancha);
    
    const response = await api.get(`/comentarios?${params}`);
    return response.data;
  },

  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/comentarios/usuario/${usuarioId}`);
    return response.data;
  },

  getByCancha: async (canchaId) => {
    const response = await api.get(`/comentarios/cancha/${canchaId}`);
    return response.data;
  },

  create: async (comentarioData) => {
    const response = await api.post('/comentarios', comentarioData);
    return response.data;
  },

  update: async (id, comentarioData) => {
    const response = await api.put(`/comentarios/${id}`, comentarioData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/comentarios/${id}`);
    return response.data;
  },

  getMisComentarios: async () => {
    const response = await api.get('/comentarios/mis-comentarios');
    return response.data;
  }
};