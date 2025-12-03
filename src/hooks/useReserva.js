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

  const steps = [
    'Seleccionar Espacio',
    'Seleccionar Disciplina', 
    'Seleccionar Cancha',
    'Confirmar Reserva'
  ];

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

  const fetchDisciplinas = useCallback(async (espacioId) => {
    if (!espacioId) return;
    
    try {
      setIsLoading(true);
      const data = await disciplinasApi.getByEspacio(espacioId);
      setDisciplinas(data);
      setIsLoading(false);
      
      if (data.length === 0) {
        toast.info('El espacio seleccionado no tiene canchas con disciplinas configuradas.');
      }
      return data;
    } catch (error) {
      toast.error('Error al cargar disciplinas disponibles');
      setDisciplinas([]);
      setIsLoading(false);
      return [];
    }
  }, []);

  const fetchCanchas = useCallback(async () => {
    if (!selectedEspacio || !selectedDisciplina) return;
    
    try {
      setIsLoading(true);
      const data = await canchasApi.getByEspacioYDisciplina(
        selectedEspacio.id_espacio_deportivo,
        selectedDisciplina.id_disciplina
      );
      setCanchas(data);
      setIsLoading(false);
      
      if (data.length === 0) {
        toast.info(`No hay canchas de ${selectedDisciplina.nombre} disponibles en ${selectedEspacio.nombre}`);
      }
      return data;
    } catch (error) {
      console.error('Error al cargar canchas:', error);
      toast.error('Error al cargar canchas disponibles');
      setCanchas([]);
      setIsLoading(false);
      return [];
    }
  }, [selectedEspacio, selectedDisciplina]);

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

  // Step handlers
  const handleEspacioSelect = useCallback((espacio) => {
    setSelectedEspacio(espacio);
    setSelectedDisciplina(null);
    setSelectedCancha(null);
    setDisciplinas([]);
    setCanchas([]);
    setReservationData(prev => ({ 
      ...prev,
      id_disciplina: '',
      id_cancha: ''
    }));
    setActiveStep(1);
  }, []);

  const handleDisciplinaSelect = useCallback((disciplina) => {
    setSelectedDisciplina(disciplina);
    setReservationData(prev => ({ 
      ...prev, 
      id_disciplina: disciplina.id_disciplina 
    }));
    setSelectedCancha(null);
    setActiveStep(2);
  }, []);

  const handleCanchaSelect = useCallback((cancha) => {
  setSelectedCancha(cancha);
  setReservationData(prev => ({ 
    ...prev, 
    id_cancha: cancha.id_cancha,
    cantidad_asistentes: 1 // Reiniciar a 1 asistente por defecto
  }));
  setActiveStep(3);
  // Reiniciar asistentes cuando se selecciona nueva cancha
  setAsistentes([]);
}, []);

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
  console.log('=== VALIDANDO ASISTENTES ===');
  console.log('Cantidad esperada:', reservationData.cantidad_asistentes);
  console.log('Array asistentes:', asistentes);
  console.log('Longitud array:', asistentes.length);
  
  const cantidadAsistentes = reservationData.cantidad_asistentes || 1;
  
  // Si solo hay 1 asistente (el que hace la reserva), no necesita completar formulario
  if (cantidadAsistentes <= 1) {
    console.log('Solo 1 asistente, validación automática OK');
    return true;
  }
  
  // Verificar que tengamos el array de asistentes
  if (!Array.isArray(asistentes) || asistentes.length !== cantidadAsistentes) {
    console.log('Error: Cantidad de asistentes no coincide', {
      esperado: cantidadAsistentes,
      obtenido: asistentes.length,
      asistentes
    });
    return false;
  }
  
  // Validar cada asistente
  const todosValidos = asistentes.every((asistente, index) => {
    // Verificar que el objeto asistente exista
    if (!asistente) {
      console.log(`Asistente ${index + 1} no definido`);
      return false;
    }
    
    const nombreValido = asistente.nombre && asistente.nombre.trim() !== '';
    const emailValido = asistente.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asistente.email.trim());
    
    if (!nombreValido || !emailValido) {
      console.log(`Asistente ${index + 1} inválido:`, { 
        nombre: asistente.nombre, 
        email: asistente.email,
        nombreValido, 
        emailValido 
      });
    }
    
    return nombreValido && emailValido;
  });
  
  console.log('Resultado validación:', { todosValidos });
  return todosValidos;
}, [asistentes, reservationData.cantidad_asistentes]);

const handleAsistentesChange = useCallback((nuevosAsistentes) => {
  console.log('=== ACTUALIZANDO ASISTENTES EN HOOK ===');
  console.log('Nuevos asistentes:', nuevosAsistentes);
  console.log('Cantidad esperada:', reservationData.cantidad_asistentes);
  setAsistentes(nuevosAsistentes);
}, [reservationData.cantidad_asistentes]);

  // Reservation handler
  const handleConfirmReservation = useCallback(async () => {
    console.log('=== INICIANDO CONFIRMACIÓN DE RESERVA ===');
    console.log('Datos de reserva:', reservationData);
    console.log('Asistentes:', asistentes);
    console.log('Validación horario:', isHorarioDisponible());
    console.log('Validación asistentes:', validarAsistentes());
    
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
      console.log('Error: Asistentes no válidos');
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
        // Si solo hay 1 asistente (el reservante), no enviar array de asistentes
        asistentes: (reservationData.cantidad_asistentes > 1) ? asistentes : []
      };
      
      console.log('Enviando datos al backend:', reservaData);
      
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
    
    // Setters
    setActiveStep,
    setSelectedCoupon,
    setReservationData,
    setConfirmOpen,
    setAsistentes,
    handleAsistentesChange,
    
    // Methods
    fetchEspacios,
    fetchDisciplinas,
    fetchCanchas,
    fetchCuponesUsuario,
    fetchHorariosDisponibles,
    handleEspacioSelect,
    handleDisciplinaSelect,
    handleCanchaSelect,
    handleConfirmReservation,
    resetForm,
    isHorarioDisponible,
    calcularCostoTotal,
    getOccupiedHours,
    validarAsistentes,
    
    // Nuevas funciones para manejo de horas
    getOcupiedBlocks,
    isHoraInicioValida,
    isHoraFinValida,
    getHorasInicioDisponiblesList,
    getHorasFinDisponiblesList,
  };
};