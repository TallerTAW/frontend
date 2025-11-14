import api from './index';

export const cuponesApi = {
  getAll: async (estado = null, idUsuario = null) => {
    const params = new URLSearchParams();
    if (estado) params.append('estado', estado);
    if (idUsuario) params.append('id_usuario', idUsuario);
    
    const response = await api.get(`/cupones?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/cupones/${id}`);
    return response.data;
  },

  getByCodigo: async (codigo) => {
    const response = await api.get(`/cupones/codigo/${codigo}`);
    return response.data;
  },

  create: async (cuponData) => {
    const response = await api.post('/cupones', cuponData);
    return response.data;
  },

  update: async (id, cuponData) => {
    const response = await api.put(`/cupones/${id}`, cuponData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/cupones/${id}`);
    return response.data;
  },

  aplicar: async (aplicarData) => {
    const response = await api.post('/cupones/aplicar', aplicarData);
    return response.data;
  },

  generarLote: async (loteData) => {
    const response = await api.post('/cupones/generar-lote', loteData);
    return response.data;
  },

  activar: async (id) => {
    const response = await api.put(`/cupones/${id}/activar`);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await api.put(`/cupones/${id}/desactivar`);
    return response.data;
  },

  getByUsuario: async (usuarioId) => {
    const response = await api.get(`/cupones/usuario/${usuarioId}`);
    return response.data;
  },

  validar: async (codigo, idUsuario = null) => {
    const params = new URLSearchParams();
    if (idUsuario) params.append('id_usuario', idUsuario);
    
    const response = await api.get(`/cupones/validar/${codigo}?${params}`);
    return response.data;
  },

  getMisCupones: async () => {
    const response = await api.get('/cupones/mis-cupones');
    return response.data;
  }
};