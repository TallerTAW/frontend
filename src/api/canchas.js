// 📍 ARCHIVO: src/api/canchas.js
// AGREGAR ESTE MÉTODO NUEVO:

import api from './index';

export const canchasApi = {
  getAll: async () => {
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

  // NUEVO MÉTODO: Obtener canchas por disciplina
  getByDisciplina: async (disciplinaId) => {
    const response = await api.get(`/canchas/public/disciplina/${disciplinaId}`);
    return response.data;
  },

  create: async (canchaData) => {
    const response = await api.post('/canchas', canchaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, canchaData) => {
    const response = await api.put(`/canchas/${id}`, canchaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  },

  getByEspacioYDisciplina: async (espacioId, disciplinaId) => {
    const response = await api.get(`/canchas/public/espacio/${espacioId}/disciplina/${disciplinaId}`);
    return response.data;
  }
};