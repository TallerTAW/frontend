import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setProfile({
          id: parsedUser.id,
          nombre: parsedUser.nombre,
          email: parsedUser.email,
          rol: parsedUser.rol,
          full_name: parsedUser.nombre // Tu backend no envía apellido en el login
        });
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setError('Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando login con:', { email, password });
      
      const response = await authApi.login(email, password);
      
      console.log('Respuesta del login:', response);
      
      const { access_token, usuario } = response;
      
      if (!access_token || !usuario) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      // Guardar en localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      // Actualizar estado
      setUser(usuario);
      setProfile({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        full_name: usuario.nombre
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error completo en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        // El servidor respondió con un error
        errorMessage = error.response.data?.detail || `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // La request fue hecha pero no hubo respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
      } else {
        // Algo pasó al configurar la request
        errorMessage = error.message || 'Error de configuración';
      }
      
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (error) {
      console.error('Error en logout:', error);
      setError('Error al cerrar sesión');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signOut,
    checkAuth,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}