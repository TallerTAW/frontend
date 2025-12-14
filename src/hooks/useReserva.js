import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { espaciosApi } from '../api/espacios';
import { disciplinasApi } from '../api/disciplinas';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { cuponesApi } from '../api/cupones';
import { useAuth } from '../context/AuthContext';
import { 
  getOcupiedTimeBlocks, 
  isHoraInicioDisponible,
  isHoraFinDisponible,
  getHorasInicioDisponibles,
  getHorasFinDisponibles 
} from '../utils/reservaHelpers';

// Función para calcular distancia usando la fórmula del haversine
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

export const useReserva = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [espacios, setEspacios] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [asistentes, setAsistentes] = useState([]);
  const [espacioFiltro, setEspacioFiltro] = useState('todos');
  const [ubicacionUsuario, setUbicacionUsuario] = useState(null);
  const [ordenarPorDistancia, setOrdenarPorDistancia] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);

  // Nuevo flujo: Disciplina → Canchas → Confirmación
  const steps = [
    'Seleccionar Disciplina',
    'Seleccionar Cancha', 
    'Confirmar Reserva'
  ];

  const [reservationData, setReservationData] = useState({
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    cantidad_asistentes: 1,
    material_prestado: '',
    id_disciplina: '',
    id_cancha: '',
    id_usuario: profile?.id
  });

  // Fetch functions - Modificadas para nuevo flujo
  const fetchEspacios = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await espaciosApi.getDisponibles();
      setEspacios(data);
      setIsLoading(false);
      return data;
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
      setIsLoading(false);
      return [];
    }
  }, []);

  const fetchAllDisciplinas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await disciplinasApi.getAll();
      setDisciplinas(data);
      setIsLoading(false);
      return data;
    } catch (error) {
      toast.error('Error al cargar disciplinas');
      setIsLoading(false);
      return [];
    }
  }, []);

  // Obtener canchas por disciplina (de todos los espacios)
  const fetchCanchasByDisciplina = useCallback(async (disciplinaId) => {
    if (!disciplinaId) return;
    
    try {
      setIsLoading(true);
      // Usar el nuevo endpoint que incluye info del espacio deportivo
      const data = await canchasApi.getByDisciplina(disciplinaId);
      setCanchas(data);
      setIsLoading(false);
      
      if (data.length === 0) {
        toast.info(`No hay canchas de esta disciplina disponibles`);
      }
      return data;
    } catch (error) {
      console.error('Error al cargar canchas por disciplina:', error);
      toast.error('Error al cargar canchas disponibles');
      setCanchas([]);
      setIsLoading(false);
      return [];
    }
  }, []);

  const fetchCuponesUsuario = useCallback(async () => {
    if (!profile) return;
    
    try {
      setIsLoading(true);
      const data = await cuponesApi.getByUsuario(profile.id);
      const cuponesActivos = data.filter(cupon => 
        cupon.estado === 'activo' && 
        (!cupon.fecha_expiracion || new Date(cupon.fecha_expiracion) > new Date())
      );
      setCupones(cuponesActivos);
      setIsLoading(false);
      return cuponesActivos;
    } catch (error) {
      console.error('Error al cargar cupones:', error);
      setIsLoading(false);
      return [];
    }
  }, [profile]);

  const fetchHorariosDisponibles = useCallback(async () => {
    if (!selectedCancha || !reservationData.fecha_reserva) {
      setHorariosDisponibles([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await reservasApi.getHorariosDisponibles(
        selectedCancha.id_cancha,
        reservationData.fecha_reserva
      );
      
      if (!Array.isArray(data)) {
        setHorariosDisponibles([]);
        setIsLoading(false);
        return;
      }
      
      const processedData = data.map(slot => ({
        ...slot,
        hora_inicio: slot.hora_inicio?.split(':').slice(0, 2).join(':') || '00:00',
        hora_fin: slot.hora_fin?.split(':').slice(0, 2).join(':') || '00:00',
        disponible: slot.disponible === true && slot.mensaje !== 'OCUPADO'
      }));
      
      setHorariosDisponibles(processedData);
      setIsLoading(false);
      return processedData;
    } catch (error) {
      console.error('Error al cargar horarios disponibles:', error);
      toast.error('Error al cargar horarios disponibles');
      setHorariosDisponibles([]);
      setIsLoading(false);
      return [];
    }
  }, [selectedCancha, reservationData.fecha_reserva]);

  // Step handlers - MODIFICADOS para nuevo flujo
  const handleDisciplinaSelect = useCallback((disciplina) => {
    setSelectedDisciplina(disciplina);
    setSelectedEspacio(null);
    setSelectedCancha(null);
    setCanchas([]);
    setReservationData(prev => ({ 
      ...prev,
      id_disciplina: disciplina.id_disciplina,
      id_cancha: ''
    }));
    setEspacioFiltro('todos');
    setUbicacionUsuario(null);
    setOrdenarPorDistancia(false);
    
    // Cargar canchas para esta disciplina
    fetchCanchasByDisciplina(disciplina.id_disciplina);
    
    setActiveStep(1);
  }, [fetchCanchasByDisciplina]);

  const handleCanchaSelect = useCallback((cancha) => {
    setSelectedCancha(cancha);
    // Encontrar el espacio deportivo de esta cancha
    const espacioCancha = espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo);
    setSelectedEspacio(espacioCancha);
    
    setReservationData(prev => ({ 
      ...prev, 
      id_cancha: cancha.id_cancha,
      cantidad_asistentes: 1
    }));
    
    setActiveStep(2);
    setAsistentes([]);
  }, [espacios]);

  // Función para obtener la ubicación del usuario
  const obtenerUbicacion = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error('Tu navegador no soporta geolocalización');
        reject(new Error('Tu navegador no soporta geolocalización'));
        return;
      }

      setObteniendoUbicacion(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const ubicacion = {
            latitud: position.coords.latitude,
            longitud: position.coords.longitude,
            precision: position.coords.accuracy
          };
          setUbicacionUsuario(ubicacion);
          setOrdenarPorDistancia(true);
          setObteniendoUbicacion(false);
          toast.success('Ubicación obtenida correctamente');
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

  // Limpiar ubicación y ordenamiento
  const limpiarUbicacion = useCallback(() => {
    setUbicacionUsuario(null);
    setOrdenarPorDistancia(false);
  }, []);

  // Función para ordenar canchas por distancia
  const getCanchasOrdenadasPorDistancia = useCallback(() => {
    if (!ordenarPorDistancia || !ubicacionUsuario) {
      return canchas;
    }
    
    const canchasConDistancia = canchas.map(cancha => {
      const espacioCancha = espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo);
      
      let distancia = null;
      if (espacioCancha && espacioCancha.latitud && espacioCancha.longitud) {
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

    // Separar canchas con y sin coordenadas
    const canchasConCoordenadas = canchasConDistancia.filter(c => c.distancia !== null);
    const canchasSinCoordenadas = canchasConDistancia.filter(c => c.distancia === null);

    // Ordenar por distancia
    return [
      ...canchasConCoordenadas.sort((a, b) => a.distancia - b.distancia),
      ...canchasSinCoordenadas
    ];
  }, [canchas, espacios, ordenarPorDistancia, ubicacionUsuario]);

  // Función para filtrar canchas por espacio
  const filtrarCanchasPorEspacio = useCallback((espacioId, canchasArray = null) => {
    const canchasAUsar = canchasArray || canchas;
    
    if (!espacioId || espacioId === 'todos') {
      return canchasAUsar;
    }
    
    return canchasAUsar.filter(cancha => cancha.id_espacio_deportivo === parseInt(espacioId));
  }, [canchas]);

  // Obtener espacios únicos de las canchas disponibles
  const getEspaciosDisponibles = useCallback(() => {
    const espaciosIds = [...new Set(canchas.map(c => c.id_espacio_deportivo))];
    return espacios.filter(e => espaciosIds.includes(e.id_espacio_deportivo));
  }, [canchas, espacios]);

  // Obtener bloques ocupados
  const getOcupiedBlocks = useCallback(() => {
    return getOcupiedTimeBlocks(horariosDisponibles);
  }, [horariosDisponibles]);

  // Verificar si hora inicio está disponible
  const isHoraInicioValida = useCallback((hora) => {
    return isHoraInicioDisponible(hora, horariosDisponibles, getOcupiedBlocks());
  }, [horariosDisponibles, getOcupiedBlocks]);

  // Verificar si hora fin está disponible
  const isHoraFinValida = useCallback((hora) => {
    return isHoraFinDisponible(hora, horariosDisponibles, getOcupiedBlocks());
  }, [horariosDisponibles, getOcupiedBlocks]);

  // Obtener horas disponibles para inicio
  const getHorasInicioDisponiblesList = useCallback(() => {
    return getHorasInicioDisponibles(horariosDisponibles, getOcupiedBlocks());
  }, [horariosDisponibles, getOcupiedBlocks]);

  // Obtener horas disponibles para fin
  const getHorasFinDisponiblesList = useCallback((horaInicio) => {
    return getHorasFinDisponibles(horariosDisponibles, getOcupiedBlocks(), horaInicio);
  }, [horariosDisponibles, getOcupiedBlocks]);

  // Validation functions
  const isHorarioDisponible = useCallback(() => {
    const { hora_inicio, hora_fin } = reservationData;
    if (!hora_inicio || !hora_fin) return true;
    
    try {
      const inicio = parseInt(hora_inicio.split(':')[0]);
      const fin = parseInt(hora_fin.split(':')[0]);
      
      if (isNaN(inicio) || isNaN(fin) || fin <= inicio) return false;
      
      // Verificar que la hora inicio sea válida
      if (!isHoraInicioValida(hora_inicio)) return false;
      
      // Verificar que la hora fin sea válida
      if (!isHoraFinValida(hora_fin)) return false;
      
      // Verificar todas las horas intermedias
      for (let hour = inicio; hour < fin; hour++) {
        const horaCheck = hour.toString().padStart(2, '0') + ':00';
        const slot = horariosDisponibles.find(s => s.hora_inicio === horaCheck);
        
        if (!slot || !slot.disponible) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error en validación de horario:', error);
      return false;
    }
  }, [reservationData, horariosDisponibles, isHoraInicioValida, isHoraFinValida]);

  const calcularCostoTotal = useCallback(() => {
    if (!selectedCancha || !reservationData.hora_inicio || !reservationData.hora_fin) return 0;
    
    try {
      const startHour = parseInt(reservationData.hora_inicio.split(':')[0]);
      const endHour = parseInt(reservationData.hora_fin.split(':')[0]);
      const hours = endHour - startHour;
      
      if (hours <= 0) return 0;
      
      let total = hours * selectedCancha.precio_por_hora;
      
      if (selectedCoupon) {
        const coupon = cupones.find(c => c.id_cupon === parseInt(selectedCoupon));
        if (coupon) {
          if (coupon.tipo === 'porcentaje') {
            total = total * (1 - coupon.monto_descuento / 100);
          } else {
            total = Math.max(0, total - coupon.monto_descuento);
          }
        }
      }

      return Math.max(0, total);
    } catch (error) {
      console.error('Error calculando costo:', error);
      return 0;
    }
  }, [selectedCancha, reservationData, selectedCoupon, cupones]);

  const getOccupiedHours = useCallback(() => {
    if (!horariosDisponibles.length) return [];
    return horariosDisponibles
      .filter(slot => !slot.disponible && slot.hora_inicio.endsWith(':00'))
      .map(slot => slot.hora_inicio);
  }, [horariosDisponibles]);

  // Validar asistentes
  const validarAsistentes = useCallback(() => {
    const cantidadAsistentes = reservationData.cantidad_asistentes || 1;
    
    // Si solo hay 1 asistente (el que hace la reserva), no necesita completar formulario
    if (cantidadAsistentes <= 1) {
      return true;
    }
    
    // Verificar que tengamos el array de asistentes
    if (!Array.isArray(asistentes) || asistentes.length !== cantidadAsistentes) {
      return false;
    }
    
    // Validar cada asistente
    const todosValidos = asistentes.every((asistente, index) => {
      if (!asistente) return false;
      
      const nombreValido = asistente.nombre && asistente.nombre.trim() !== '';
      const emailValido = asistente.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asistente.email.trim());
      
      return nombreValido && emailValido;
    });
    
    return todosValidos;
  }, [asistentes, reservationData.cantidad_asistentes]);

  const handleAsistentesChange = useCallback((nuevosAsistentes) => {
    setAsistentes(nuevosAsistentes);
  }, [reservationData.cantidad_asistentes]);

  // Reservation handler
  const handleConfirmReservation = useCallback(async () => {
    if (!profile) {
      toast.info('Por favor, inicia sesión para completar tu reserva');
      navigate('/login', { 
        state: { 
          from: '/reservar', 
          reservationData: {
            ...reservationData,
            selectedEspacio,
            selectedDisciplina, 
            selectedCancha
          }
        } 
      });
      return;
    }

    if (!isHorarioDisponible()) {
      toast.error('El horario seleccionado no está disponible. Por favor, seleccione otro horario.');
      return;
    }

    // Validar asistentes
    if (!validarAsistentes()) {
      toast.error('Por favor completa la información de todos los asistentes correctamente.');
      return;
    }

    try {
      const codigoCupon = selectedCoupon 
        ? cupones.find(c => c.id_cupon === parseInt(selectedCoupon))?.codigo 
        : null;
      
      // Preparar datos para enviar
      const reservaData = {
        ...reservationData,
        id_usuario: profile.id,
        codigo_cupon: codigoCupon,
        asistentes: (reservationData.cantidad_asistentes > 1) ? asistentes : []
      };
      
      // Usar el endpoint correcto según si hay asistentes o no
      let nuevaReserva;
      if (reservationData.cantidad_asistentes > 1 && asistentes.length > 0) {
        nuevaReserva = await reservasApi.crearReservaConAsistentes(reservaData);
      } else {
        nuevaReserva = await reservasApi.create(reservaData);
      }
      
      const mensaje = `Reserva creada exitosamente! Código: ${nuevaReserva.codigo_reserva}`;
      
      if (reservationData.cantidad_asistentes > 1) {
        toast.success(`${mensaje} Se enviarán códigos QR a los asistentes.`);
      } else {
        toast.success(mensaje);
      }
      
      setConfirmOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('Error creando reserva:', error);
      
      if (error.response?.data?.detail?.includes('no está disponible') || 
          error.response?.data?.detail?.includes('ocupado') ||
          error.response?.status === 400) {
        toast.error(error.response.data.detail || 'El horario seleccionado no está disponible');
      } else {
        toast.error(error.response?.data?.detail || 'Error al crear la reserva');
      }
    }
  }, [
    profile, 
    navigate, 
    isHorarioDisponible, 
    validarAsistentes,
    selectedCoupon, 
    cupones, 
    reservationData, 
    asistentes,
    selectedEspacio, 
    selectedDisciplina, 
    selectedCancha
  ]);

  const resetForm = useCallback(() => {
    setActiveStep(0);
    setSelectedEspacio(null);
    setSelectedDisciplina(null);
    setSelectedCancha(null);
    setReservationData({
      fecha_reserva: '',
      hora_inicio: '',
      hora_fin: '',
      cantidad_asistentes: 1,
      material_prestado: '',
      id_disciplina: '',
      id_cancha: '',
      id_usuario: profile?.id
    });
    setSelectedCoupon('');
    setDisciplinas([]);
    setCanchas([]);
    setHorariosDisponibles([]);
    setAsistentes([]);
    setEspacioFiltro('todos');
    setUbicacionUsuario(null);
    setOrdenarPorDistancia(false);
    setObteniendoUbicacion(false);
    
    if (profile) {
      fetchCuponesUsuario();
    }
  }, [profile, fetchCuponesUsuario]);

  return {
    // State
    activeStep,
    steps,
    espacios,
    disciplinas,
    canchas,
    cupones,
    selectedEspacio,
    selectedDisciplina,
    selectedCancha,
    selectedCoupon,
    reservationData,
    confirmOpen,
    horariosDisponibles,
    asistentes,
    loading,
    isLoading,
    espacioFiltro,
    ubicacionUsuario,
    ordenarPorDistancia,
    obteniendoUbicacion,
    
    // Setters
    setActiveStep,
    setSelectedCoupon,
    setReservationData,
    setConfirmOpen,
    setAsistentes,
    handleAsistentesChange,
    setEspacioFiltro,
    setUbicacionUsuario,
    setOrdenarPorDistancia,
    setObteniendoUbicacion,
    
    // Methods
    fetchEspacios,
    fetchAllDisciplinas,
    fetchCanchasByDisciplina,
    fetchCuponesUsuario,
    fetchHorariosDisponibles,
    handleDisciplinaSelect,
    handleCanchaSelect,
    handleConfirmReservation,
    resetForm,
    isHorarioDisponible,
    calcularCostoTotal,
    getOccupiedHours,
    validarAsistentes,
    filtrarCanchasPorEspacio,
    getEspaciosDisponibles,
    obtenerUbicacion,
    limpiarUbicacion,
    getCanchasOrdenadasPorDistancia,
    
    // Funciones para manejo de horas
    getOcupiedBlocks,
    isHoraInicioValida,
    isHoraFinValida,
    getHorasInicioDisponiblesList,
    getHorasFinDisponiblesList,
  };
};