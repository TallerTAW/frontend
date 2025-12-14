import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { espaciosApi } from '../api/espacios';
import { disciplinasApi } from '../api/disciplinas';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { cuponesApi } from '../api/cupones'; // ← USAR TU API
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
  const [selectedCouponData, setSelectedCouponData] = useState(null);
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

  // Fetch functions
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

  const fetchCanchasByDisciplina = useCallback(async (disciplinaId) => {
    if (!disciplinaId) return;
    
    try {
      setIsLoading(true);
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

  // ✅ CORRECCIÓN: Usar tu API de cupones
  const fetchCuponesUsuario = useCallback(async () => {
    if (!profile || !profile.id) {
      setCupones([]);
      return [];
    }
    
    try {
      console.log(`🎫 [useReserva] Cargando cupones para usuario: ${profile.id}`);
      setIsLoading(true);
      
      // Intentar primero con getMisCupones (endpoint específico para usuario actual)
      let data;
      try {
        data = await cuponesApi.getMisCupones();
        console.log(`🎫 [useReserva] getMisCupones devolvió:`, data);
      } catch (misCuponesError) {
        console.log(`⚠️ [useReserva] Falló getMisCupones, intentando getByUsuario`);
        // Si falla, usar getByUsuario con el ID del usuario
        data = await cuponesApi.getByUsuario(profile.id);
        console.log(`🎫 [useReserva] getByUsuario devolvió:`, data);
      }
      
      // Filtrar cupones activos y no expirados
      const cuponesActivos = data.filter(cupon => {
        if (!cupon) return false;
        
        const estadoValido = cupon.estado === 'activo';
        const noUtilizado = !cupon.id_reserva || cupon.id_reserva === null;
        
        let fechaValida = true;
        if (cupon.fecha_expiracion) {
          const expiracion = new Date(cupon.fecha_expiracion);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0); // Solo fecha, sin hora
          expiracion.setHours(0, 0, 0, 0);
          fechaValida = expiracion >= hoy;
        }
        
        const esValido = estadoValido && fechaValida && noUtilizado;
        
        if (!esValido) {
          console.log(`❌ [useReserva] Cupón ${cupon.codigo} inválido:`, {
            estado: cupon.estado,
            fecha_expiracion: cupon.fecha_expiracion,
            id_reserva: cupon.id_reserva
          });
        }
        
        return esValido;
      });
      
      setCupones(cuponesActivos);
      setIsLoading(false);
      
      console.log(`✅ [useReserva] Cupones cargados: ${cuponesActivos.length} activos de ${data.length} totales`);
      console.log(`✅ [useReserva] Cupones activos:`, cuponesActivos.map(c => c.codigo));
      
      return cuponesActivos;
    } catch (error) {
      console.error('❌ [useReserva] Error al cargar cupones:', error);
      toast.error('Error al cargar cupones');
      setCupones([]);
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

  // Step handlers
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
    setSelectedCoupon('');
    setSelectedCouponData(null);
    
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
    
    setSelectedCoupon('');
    setSelectedCouponData(null);
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

  // ✅ Función para aplicar cupón - MEJORADA
  const aplicarCupon = useCallback((cuponCodigo) => {
    console.log(`🎫 [useReserva] Aplicando cupón: ${cuponCodigo}`);
    
    const cupon = cupones.find(c => c.codigo === cuponCodigo);
    if (!cupon) {
      toast.error('Cupón no encontrado en tu lista de cupones disponibles');
      return false;
    }

    // Validaciones del cupón
    if (cupon.estado !== 'activo') {
      toast.error('Este cupón no está activo');
      return false;
    }

    if (cupon.id_reserva) {
      toast.error('Este cupón ya ha sido utilizado');
      return false;
    }

    if (cupon.fecha_expiracion) {
      const hoy = new Date();
      const expiracion = new Date(cupon.fecha_expiracion);
      hoy.setHours(0, 0, 0, 0);
      expiracion.setHours(0, 0, 0, 0);
      
      if (expiracion < hoy) {
        toast.error('Este cupón ha expirado');
        return false;
      }
    }

    // Aplicar el cupón
    setSelectedCoupon(cupon.codigo);
    setSelectedCouponData(cupon);
    
    console.log(`✅ [useReserva] Cupón aplicado:`, cupon);
    toast.success(`Cupón ${cupon.codigo} aplicado: ${cupon.tipo === 'porcentaje' ? `${cupon.monto_descuento}%` : `$${cupon.monto_descuento}`} de descuento`);
    
    return true;
  }, [cupones]);

  // ✅ Función para remover cupón
  const removerCupon = useCallback(() => {
    setSelectedCoupon('');
    setSelectedCouponData(null);
    toast.info('Cupón removido');
  }, []);

  // ✅ Función para calcular costo base (sin descuento)
  const calcularCostoBase = useCallback(() => {
    if (!selectedCancha || !reservationData.hora_inicio || !reservationData.hora_fin) return 0;
    
    try {
      const startHour = parseInt(reservationData.hora_inicio.split(':')[0]);
      const endHour = parseInt(reservationData.hora_fin.split(':')[0]);
      const hours = endHour - startHour;
      
      if (hours <= 0) return 0;
      
      const precioPorHora = parseFloat(selectedCancha.precio_por_hora) || 0;
      const total = hours * precioPorHora;
      return Math.max(0, parseFloat(total.toFixed(2)));
    } catch (error) {
      console.error('Error calculando costo base:', error);
      return 0;
    }
  }, [selectedCancha, reservationData]);

  // ✅ Función para calcular descuento
  const calcularDescuento = useCallback(() => {
    if (!selectedCouponData || !selectedCancha || !reservationData.hora_inicio || !reservationData.hora_fin) return 0;
    
    try {
      const costoBase = calcularCostoBase();
      
      if (selectedCouponData.tipo === 'porcentaje') {
        const porcentaje = parseFloat(selectedCouponData.monto_descuento) || 0;
        const descuento = (costoBase * porcentaje) / 100;
        return parseFloat(descuento.toFixed(2));
      } else {
        // Descuento fijo
        const descuentoFijo = parseFloat(selectedCouponData.monto_descuento) || 0;
        // No dejar que el descuento sea mayor que el costo base
        return Math.min(descuentoFijo, costoBase);
      }
    } catch (error) {
      console.error('Error calculando descuento:', error);
      return 0;
    }
  }, [selectedCouponData, selectedCancha, reservationData, calcularCostoBase]);

  // ✅ Función para calcular costo total CON descuento
  const calcularCostoTotal = useCallback(() => {
    const costoBase = calcularCostoBase();
    const descuento = calcularDescuento();
    
    const totalConDescuento = Math.max(0, costoBase - descuento);
    
    console.log(`💰 [useReserva] Cálculo: Base=$${costoBase}, Descuento=$${descuento}, Total=$${totalConDescuento}`);
    
    return parseFloat(totalConDescuento.toFixed(2));
  }, [calcularCostoBase, calcularDescuento]);

  // Obtener horas ocupadas
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
  }, []);

  // ✅ Manejar confirmación de reserva con cupón
  // ✅ Función para manejar confirmación de reserva con cupón
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
        return null;
    }

    if (!isHorarioDisponible()) {
        toast.error('El horario seleccionado no está disponible. Por favor, seleccione otro horario.');
        return null;
    }

    try {
        const codigoCupon = selectedCouponData ? selectedCouponData.codigo : null;
        
        // 🎯 FORMATO CORRECTO para crearReservaConCodigoUnico
        const reservaData = {
            fecha_reserva: reservationData.fecha_reserva,
            hora_inicio: reservationData.hora_inicio,
            hora_fin: reservationData.hora_fin,
            cantidad_asistentes: reservationData.cantidad_asistentes+1,
            material_prestado: reservationData.material_prestado,
            id_disciplina: reservationData.id_disciplina,
            id_cancha: reservationData.id_cancha,
            id_usuario: profile.id,
            codigo_cupon: codigoCupon,
            // 🚨 NO incluir 'asistentes' aquí, el backend lo maneja diferente
        };
        
        console.log(`📦 [useReserva] Enviando reserva con ${reservationData.cantidad_asistentes} asistentes`);
        console.log(`📦 [useReserva] Datos:`, reservaData);
        
        // Usar el endpoint para crear reserva con código único
        const nuevaReserva = await reservasApi.crearReservaConCodigoUnico(reservaData);
        
        const mensaje = `Reserva creada exitosamente! Código: ${nuevaReserva.codigo_reserva}`;
        
        if (codigoCupon) {
            toast.success(`${mensaje} Cupón ${selectedCouponData.codigo} aplicado exitosamente.`);
        } else {
            toast.success(`${mensaje}`);
        }
        
        setConfirmOpen(false);
        
        // ✅ DEVOLVER EL CÓDIGO DE RESERVA
        return {
            codigo_reserva: nuevaReserva.codigo_reserva,
            ...nuevaReserva
        };
            
    } catch (error) {
        console.error('❌ [useReserva] Error creando reserva:', error);
        
        let errorMessage = 'Error al crear la reserva';
        if (error.response?.data?.detail?.includes('no está disponible') || 
            error.response?.data?.detail?.includes('ocupado')) {
            errorMessage = 'El horario seleccionado no está disponible';
        } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
        }
        
        toast.error(errorMessage);
        throw error;
    }
}, [
    profile, 
    navigate, 
    isHorarioDisponible,
    selectedCouponData, 
    reservationData,
    selectedEspacio, 
    selectedDisciplina, 
    selectedCancha,
    setConfirmOpen,
    calcularCostoTotal
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
    setSelectedCouponData(null);
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
    selectedCouponData,
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
    setSelectedCouponData,
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
    calcularCostoBase,
    calcularDescuento,
    calcularCostoTotal,
    getOccupiedHours,
    validarAsistentes,
    filtrarCanchasPorEspacio,
    getEspaciosDisponibles,
    obtenerUbicacion,
    limpiarUbicacion,
    getCanchasOrdenadasPorDistancia,
    aplicarCupon,
    removerCupon,
    
    // Funciones para manejo de horas
    getOcupiedBlocks,
    isHoraInicioValida,
    isHoraFinValida,
    getHorasInicioDisponiblesList,
    getHorasFinDisponiblesList,
  };
};