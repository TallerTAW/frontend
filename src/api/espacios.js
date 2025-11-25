import api from './index';


/**
 * Obtiene los espacios deportivos cercanos a una ubicación dada.
 * @param {number} lat - Latitud actual del usuario
 * @param {number} lon - Longitud actual del usuario
 * @param {number} radiusKm - Radio en kilómetros (por defecto 5)
 * @returns {Promise<Array>} Lista de espacios cercanos con su distancia
 */
const getNearby = async (lat, lon, radiusKm = 5) => {
  const response = await api.get('/espacios/nearby', {
    params: { lat, lon, radius_km: radiusKm },
  });
  return response.data;
};


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
    const response = await api.post('/espacios', espacioData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, espacioData) => {
    const response = await api.put(`/espacios/${id}`, espacioData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  },

  getGestoresDisponibles: async () => {
    const response = await api.get('/espacios/gestores/disponibles');
    return response.data;
  },

  getGestorAsignado: async (espacioId) => {
    const response = await api.get(`/espacios/${espacioId}/gestor-asignado`);
    return response.data;
  },
  getNearby,
};