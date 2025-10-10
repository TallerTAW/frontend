// frontend/src/api/auth.js

import api from './index';

export const authApi = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI OAuth2 espera 'username'
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // 🚨 LÓGICA AGREGADA: Guardar el token y el usuario en localStorage
    const data = response.data;
    if (data.access_token && data.usuario) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
    }

    return data;
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