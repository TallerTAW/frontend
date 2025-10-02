import api from './index';

export const authApi = {
  login: async (email, password) => {
    // Usar FormData para compatibilidad con OAuth2
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI OAuth2 espera 'username'
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/usuarios/profile');
    return response.data;
  }
};