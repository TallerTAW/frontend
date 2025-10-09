import api from './index';

export const contentApi = {
  // Obtener todos los contenidos dinámicos (GET /content)
  getAll: async () => {
    const response = await api.get('/content');
    return response.data;
  },

  // Actualizar un contenido específico (PUT /content/{key})
  update: async (key, newValue) => {
    const response = await api.put(`/content/${key}`, {
      new_value: newValue
    });
    return response.data;
  }
};
