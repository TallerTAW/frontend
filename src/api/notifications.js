import api from './index';

export const notificationsApi = {
  getAll: async () => {
    const response = await api.get('/notificaciones');
    return response.data;
  },

  getUnread: async () => {
    const response = await api.get('/notificaciones');
    const allNotifications = response.data;
    return allNotifications.filter(notif => !notif.leida);
  },

  getByUser: async (userId) => {
    const response = await api.get(`/notificaciones/usuario/${userId}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notificaciones/${notificationId}/leer`);
    return response.data;
  },

  create: async (notificationData) => {
    const response = await api.post('/notificaciones', notificationData);
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notificaciones/${notificationId}`);
    return response.data;
  }
};