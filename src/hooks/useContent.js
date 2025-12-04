// hooks/useContent.js
import { useState, useEffect } from 'react';
import { contentApi } from '../api/content';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export const useContent = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const contentData = await contentApi.getAll();
        
        // Convertir rutas relativas a URLs completas para imágenes
        const processedContent = Object.keys(contentData).reduce((acc, key) => {
          let value = contentData[key];
          
          // Si es una ruta de imagen que empieza con /static, hacerla absoluta
          if (typeof value === 'string' && 
              (key.includes('_image') || key.includes('logo')) && 
              value.startsWith('/static')) {
            acc[key] = `${BACKEND_URL}${value}`;
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        setContent(processedContent);
        setError(null);
      } catch (err) {
        console.error('Error cargando contenido:', err);
        setError('Error al cargar contenido');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};