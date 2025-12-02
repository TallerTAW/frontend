// 📍 ARCHIVO: src/api/disciplinas.js
// 🎯 PROPÓSITO: Métodos de la API para Disciplinas
// 💡 CAMBIO PRINCIPAL: Se agrega el método getByEspacio(id)

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

  // ✨ ¡NUEVO MÉTODO CRÍTICO PARA EL FILTRADO!
  // Llama al nuevo endpoint del Backend que filtra las disciplinas
  // por el ID del Espacio Deportivo.
  getByEspacio: async (espacioId) => {
    const response = await api.get(`/disciplinas/by-espacio/${espacioId}`);
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