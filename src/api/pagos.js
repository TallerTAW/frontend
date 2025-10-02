import api from './index';

export const pagosApi = {
  getAll: async () => {
    const response = await api.get('/pagos');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  create: async (pagoData) => {
    const response = await api.post('/pagos', pagoData);
    return response.data;
  },

  update: async (id, pagoData) => {
    const response = await api.put(`/pagos/${id}`, pagoData);
    return response.data;
  },

  getByReserva: async (reservaId) => {
    const response = await api.get(`/pagos/reserva/${reservaId}`);
    return response.data;
  },

  completar: async (id) => {
    const response = await api.post(`/pagos/${id}/completar`);
    return response.data;
  }
};