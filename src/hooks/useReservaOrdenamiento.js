import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { canchasApi } from '../api/canchas';

// Función para calcular distancia (igual que antes)
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Ordenar ALFABÉTICAMENTE por nombre de cancha (A-Z)
const ordenarCanchasAlfabeticamente = (canchas) => {
  if (!canchas || canchas.length === 0) return canchas;
  
  return [...canchas].sort((a, b) => {
    const nombreA = a.nombre?.toLowerCase() || '';
    const nombreB = b.nombre?.toLowerCase() || '';
    return nombreA.localeCompare(nombreB);
  });
};

// Ordenar por DISTANCIA (más cercanas primero)
const ordenarCanchasPorDistancia = (canchas, espacios, ubicacionUsuario) => {
  if (!canchas || canchas.length === 0 || !ubicacionUsuario) {
    return ordenarCanchasAlfabeticamente(canchas);
  }
  
  // Calcular distancia para cada cancha
  const canchasConDistancia = canchas.map(cancha => {
    const espacioCancha = espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo);
    
    let distancia = null;
    if (espacioCancha?.latitud && espacioCancha?.longitud) {
      distancia = calcularDistancia(
        ubicacionUsuario.latitud,
        ubicacionUsuario.longitud,
        espacioCancha.latitud,
        espacioCancha.longitud
      );
    }
    
    return {
      ...cancha,
      espacio: espacioCancha,
      distancia: distancia
    };
  });
  
  // Ordenar por distancia (más cercanas primero)
  return [...canchasConDistancia].sort((a, b) => {
    // Si ambos tienen distancia, comparar
    if (a.distancia !== null && b.distancia !== null) {
      return a.distancia - b.distancia; // Más cercano primero
    }
    // Si solo uno tiene distancia, ponerlo primero
    if (a.distancia !== null) return -1;
    if (b.distancia !== null) return 1;
    // Si ninguno tiene distancia, ordenar alfabéticamente
    return (a.nombre?.toLowerCase() || '').localeCompare(b.nombre?.toLowerCase() || '');
  });
};

export const useReservaOrdenamiento = () => {
  
  // Obtener canchas con ordenamiento CORREGIDO
  const fetchCanchasByDisciplinaConOrdenamiento = useCallback(async (
    disciplinaId, 
    ordenarPorDistancia, 
    ubicacionUsuario, 
    espacios,
    setIsLoading,
    setCanchas
  ) => {
    if (!disciplinaId) return;
    
    try {
      setIsLoading(true);
      const data = await canchasApi.getByDisciplina(disciplinaId);
      
      // Primero agregar espacio a cada cancha
      let canchasProcesadas = data.map(cancha => ({
        ...cancha,
        espacio: espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo)
      }));
      
      // ⚠️ LÓGICA CORREGIDA Y SIMPLIFICADA:
      // - Si ordenarPorDistancia es TRUE Y hay ubicación -> ordenar por distancia
      // - CUALQUIER OTRO CASO -> ordenar alfabéticamente
      
      if (ordenarPorDistancia && ubicacionUsuario) {
        console.log('📍 Ordenando por DISTANCIA (más cercanas primero)');
        canchasProcesadas = ordenarCanchasPorDistancia(canchasProcesadas, espacios, ubicacionUsuario);
      } else {
        console.log('🔤 Ordenando ALFABÉTICAMENTE (A-Z)');
        canchasProcesadas = ordenarCanchasAlfabeticamente(canchasProcesadas);
      }
      
      // Depuración: mostrar primeras 3 canchas
      console.log('📊 Primeras 3 canchas después de ordenar:');
      canchasProcesadas.slice(0, 3).forEach((cancha, i) => {
        console.log(`${i + 1}. ${cancha.nombre} - Distancia: ${cancha.distancia ? cancha.distancia.toFixed(2) + ' km' : 'N/A'}`);
      });
      
      setCanchas(canchasProcesadas);
      setIsLoading(false);
      
      return canchasProcesadas;
    } catch (error) {
      console.error('Error al cargar canchas:', error);
      toast.error('Error al cargar canchas disponibles');
      setCanchas([]);
      setIsLoading(false);
      return [];
    }
  }, []);

  // Obtener ubicación 
  const obtenerUbicacion = useCallback((setUbicacionUsuario, setOrdenarPorDistancia, setObteniendoUbicacion) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error('Tu navegador no soporta geolocalización');
        reject(new Error('Tu navegador no soporta geolocalización'));
        return;
      }

      setObteniendoUbicacion(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const ubicacion = {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          };
          
          console.log('📍 Ubicación obtenida:', ubicacion);
          setUbicacionUsuario(ubicacion);
          // IMPORTANTE: Al obtener ubicación, activar ordenamiento por distancia
          setOrdenarPorDistancia(true);
          setObteniendoUbicacion(false);
          
          toast.success('Ubicación obtenida. Canchas ordenadas por cercanía.');
          resolve(ubicacion);
        },
        (error) => {
          let mensajeError = 'No se pudo obtener tu ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensajeError = 'Permiso de ubicación denegado. Por favor habilita la ubicación en tu navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              mensajeError = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              mensajeError = 'Tiempo de espera agotado para obtener la ubicación';
              break;
          }
          toast.error(mensajeError);
          setObteniendoUbicacion(false);
          setOrdenarPorDistancia(false); // Desactivar ordenamiento por distancia
          reject(new Error(mensajeError));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Limpiar ubicación
  const limpiarUbicacion = useCallback((setUbicacionUsuario, setOrdenarPorDistancia) => {
    console.log('🗑️ Limpiando ubicación y desactivando orden por distancia');
    setUbicacionUsuario(null);
    setOrdenarPorDistancia(false); // Asegurar que se desactive el orden por distancia
    toast.info('Ubicación limpiada. Canchas ordenadas alfabéticamente.');
  }, []);

  return {
    fetchCanchasByDisciplinaConOrdenamiento,
    obtenerUbicacion,
    limpiarUbicacion
  };
};