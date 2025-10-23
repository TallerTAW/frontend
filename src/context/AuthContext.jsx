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
          apellido: parsedUser.apellido,
          email: parsedUser.email,
          rol: parsedUser.rol,
          full_name: `${parsedUser.nombre} ${parsedUser.apellido}`
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

  const signIn = async (email, password, captchaToken) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Intentando login con:', { email, password });
      console.log('Token reCAPTCHA:', captchaToken);
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await authApi.login(formData);
      
      console.log('Respuesta del login:', response);
      
      const { access_token, usuario } = response;
      
      if (!access_token || !usuario) {
        throw new Error('Respuesta inválida del servidor');
      }
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      setUser(usuario);
      setProfile({
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        full_name: `${usuario.nombre} ${usuario.apellido}`
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error completo en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      let errorType = 'general'; // 'general', 'credentials', 'inactive'
      
      if (error.response) {
        errorMessage = error.response.data?.detail || `Error ${error.response.status}: ${error.response.statusText}`;
        
        // Manejo específico de diferentes tipos de errores
        if (error.response.status === 401) {
          if (errorMessage.includes('Credenciales')) {
            errorMessage = 'Email o contraseña incorrectos.';
            errorType = 'credentials';
          } else {
            errorMessage = 'Credenciales inválidas.';
            errorType = 'credentials';
          }
        } else if (error.response.status === 403) {
          if (errorMessage.includes('inactivo') || errorMessage.includes('inactiva')) {
            errorMessage = 'Usuario inactivo. Le llegará un correo para activar su cuenta.';
            errorType = 'inactive';
          } else {
            errorMessage = 'Acceso denegado. No tiene permisos para acceder.';
            errorType = 'general';
          }
        } else if (error.response.status === 400) {
          if (errorMessage.includes('Captcha') || errorMessage.includes('captcha')) {
            errorMessage = 'Error de verificación reCAPTCHA. Por favor, intenta nuevamente.';
            errorType = 'captcha';
          } else {
            errorMessage = 'Datos de entrada incorrectos.';
            errorType = 'general';
          }
        } else if (error.response.status === 422) {
          errorMessage = 'Datos de entrada inválidos.';
          errorType = 'general';
        } else if (error.response.status >= 500) {
          errorMessage = 'Error del servidor. Por favor, intente más tarde.';
          errorType = 'general';
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que el backend esté ejecutándose.';
        errorType = 'connection';
      } else {
        errorMessage = error.message || 'Error de configuración';
        errorType = 'general';
      }
      
      setError(errorMessage);
      return { 
        error: errorMessage,
        type: errorType // Retornamos el tipo de error para manejo específico
      };
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