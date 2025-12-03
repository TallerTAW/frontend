// 📍 ARCHIVO: src/pages/reservar.jsx
// 🎯 PROPÓSITO: Página principal de reservas con lógica de filtrado y MEJORAS DE UX/UI.
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { espaciosApi } from '../api/espacios';
import { disciplinasApi } from '../api/disciplinas';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { cuponesApi } from '../api/cupones';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { Stadium, SportsSoccer, ArrowBack, CalendarToday, AccessTime, Money, People } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Reservar() {

  const formatHourToFull = (timeString) => {
    if (!timeString) return '';
    // Tomar solo la hora y agregar :00
    const [hours] = timeString.split(':');
    return `${hours}:00`;
  };

  const getAvailableHours = (horaApertura, horaCierre) => {
    const start = parseInt(horaApertura);
    const end = parseInt(horaCierre);
    const hours = [];
    
    for (let i = start; i < end; i++) {
      hours.push(i.toString());
    }
    
    return hours;
  };

  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  // Datos principales de la aplicación
  const [espacios, setEspacios] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [cupones, setCupones] = useState([]);
  // Selecciones del usuario
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [duracionHoras, setDuracionHoras] = useState(1);
  
  // Datos de la reserva
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const steps = ['Seleccionar Espacio', 'Seleccionar Disciplina', 'Seleccionar Cancha', 'Confirmar Reserva'];

  useEffect(() => {
    fetchEspacios();
    if (profile) {
      fetchCuponesUsuario();
    }
  }, [profile]);
  
  useEffect(() => {
    if (selectedDisciplina) {
      fetchCanchas();
    }
  }, [selectedEspacio, selectedDisciplina]);
  
  useEffect(() => {
    fetchHorariosDisponibles();
  }, [selectedCancha, reservationData.fecha_reserva]);

  // === 1. CARGA DE ESPACIOS ===
  const fetchEspacios = async () => {
    try {
      const data = await espaciosApi.getDisponibles();
      setEspacios(data);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  // === 2. CARGA DE DISCIPLINAS POR ESPACIO (LÓGICA DE FILTRADO) ===
  const fetchDisciplinas = async (espacioId) => {
    if (!espacioId) return;
    try {
      const data = await disciplinasApi.getByEspacio(espacioId);
      setDisciplinas(data);

      if (data.length === 0) {
        toast.info(`El espacio seleccionado no tiene canchas con disciplinas configuradas.`);
      }

    } catch (error) {
      toast.error('Error al cargar disciplinas disponibles para este espacio');
      setDisciplinas([]);
    }
  };

  // === 3. CARGA DE CANCHAS POR ESPACIO Y DISCIPLINA ===
  const fetchCanchas = async () => {
    if (selectedEspacio && selectedDisciplina) {
      try {
        const data = await canchasApi.getByEspacioYDisciplina(
          selectedEspacio.id_espacio_deportivo,
          selectedDisciplina.id_disciplina
        );
        setCanchas(data);
        
        if (data.length === 0) {
          toast.info(`No hay canchas de ${selectedDisciplina.nombre} disponibles en ${selectedEspacio.nombre}`);
        }
        
      } catch (error) {
        console.error('Error al cargar canchas:', error);
        toast.error('Error al cargar canchas disponibles');
        setCanchas([]);
      }
    }
  };
  
  const fetchCuponesUsuario = async () => {
    try {
      const data = await cuponesApi.getByUsuario(profile.id);
      setCupones(data.filter(cupon => 
        cupon.estado === 'activo' && 
        (!cupon.fecha_expiracion || new Date(cupon.fecha_expiracion) > new Date()) 
      ));
    } catch (error) {
      console.error('Error al cargar cupones');
    }
  };

  const fetchHorariosDisponibles = async () => {
    if (!selectedCancha || !reservationData.fecha_reserva) {
      setHorariosDisponibles([]);
      return;
    }
    
    try {
      const data = await reservasApi.getHorariosDisponibles(
        selectedCancha.id_cancha,
        reservationData.fecha_reserva
      );
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ API no retornó array:', data);
        setHorariosDisponibles([]);
        return;
      }
      
      console.log('📊 Datos recibidos de API:', data);
      
      // Procesar datos: convertir formato y asegurar que sean horas completas
      const processedData = data.map(slot => {
        const horaInicio = slot.hora_inicio?.split(':').slice(0, 2).join(':') || '00:00';
        const horaFin = slot.hora_fin?.split(':').slice(0, 2).join(':') || '00:00';
        
        return {
          ...slot,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          disponible: slot.disponible === true && slot.mensaje !== 'OCUPADO'
        };
      });
      
      console.log('✅ Horarios procesados:', processedData);
      setHorariosDisponibles(processedData);
      
    } catch (error) {
      console.error('❌ Error al cargar horarios disponibles:', error);
      toast.error('Error al cargar horarios disponibles');
      setHorariosDisponibles([]);
    }
  };

  // === MANEJADORES DE PASOS ===

  const handleEspacioSelect = (espacio) => {
    setSelectedEspacio(espacio);
    // Reiniciar selecciones dependientes
    setSelectedDisciplina(null);
    setSelectedCancha(null);
    setDisciplinas([]);
    setCanchas([]);
    setActiveStep(1);
    fetchDisciplinas(espacio.id_espacio_deportivo);
  };
  
  const handleDisciplinaSelect = (disciplina) => {
    setSelectedDisciplina(disciplina);
    setReservationData(prev => ({ ...prev, id_disciplina: disciplina.id_disciplina }));
    setActiveStep(2);
    setSelectedCancha(null);
  };

  const handleCanchaSelect = (cancha) => {
    setSelectedCancha(cancha);
    setReservationData(prev => ({ ...prev, id_cancha: cancha.id_cancha }));
    setActiveStep(3);
  };

  const calcularCostoTotal = () => {
    if (!selectedCancha || !reservationData.hora_inicio || !reservationData.hora_fin) return 0;
    
    try {
      // Parsear horas
      const startHour = parseInt(reservationData.hora_inicio.split(':')[0]);
      const endHour = parseInt(reservationData.hora_fin.split(':')[0]);
      
      // Calcular diferencia de horas
      const hours = endHour - startHour;
      
      if (hours <= 0) return 0;
      
      let total = hours * selectedCancha.precio_por_hora;
      
      // Aplicar cupón si está seleccionado
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
  };

  const getOccupiedHours = () => {
  if (!horariosDisponibles.length) return [];
  return horariosDisponibles
    .filter(slot => !slot.disponible && slot.hora_inicio.endsWith(':00')) // ✅ Cambia hora_disponible por hora_inicio
    .map(slot => slot.hora_inicio); // ✅ Cambia hora_disponible por hora_inicio
};

  const isHorarioDisponible = () => {
    if (!reservationData.hora_inicio || !reservationData.hora_fin) return true;
    
    try {
      const inicio = parseInt(reservationData.hora_inicio.split(':')[0]);
      const fin = parseInt(reservationData.hora_fin.split(':')[0]);
      
      // Validar que sean números
      if (isNaN(inicio) || isNaN(fin)) return false;
      
      if (fin <= inicio) return false; // Hora fin debe ser mayor que inicio
      
      // Verificar que todas las horas entre inicio y fin estén disponibles
      for (let hour = inicio; hour < fin; hour++) {
        const horaCheck = hour.toString().padStart(2, '0') + ':00';
        const slot = horariosDisponibles.find(s => s.hora_inicio === horaCheck);
        
        // Si no existe el slot o no está disponible
        if (!slot || !slot.disponible) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error en isHorarioDisponible:', error);
      return false;
    }
  };

  // Función para verificar disponibilidad específica
  const verificarDisponibilidad = async () => {
    if (!selectedCancha || !reservationData.fecha_reserva || 
        !reservationData.hora_inicio || !reservationData.hora_fin) {
      return false;
    }
    
    try {
      // Asegurar formato HH:MM:SS
      const horaInicio = reservationData.hora_inicio.includes(':') 
        ? (reservationData.hora_inicio.split(':').length === 2 
          ? `${reservationData.hora_inicio}:00` 
          : reservationData.hora_inicio)
        : `${reservationData.hora_inicio}:00:00`;
      
      const horaFin = reservationData.hora_fin.includes(':')
        ? (reservationData.hora_fin.split(':').length === 2
          ? `${reservationData.hora_fin}:00`
          : reservationData.hora_fin)
        : `${reservationData.hora_fin}:00:00`;
      
      console.log('🔍 Verificando disponibilidad:', {
        cancha: selectedCancha.id_cancha,
        fecha: reservationData.fecha_reserva,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      
      const resultado = await reservasApi.verificarDisponibilidad(
        selectedCancha.id_cancha,
        reservationData.fecha_reserva,
        horaInicio,
        horaFin
      );
      
      console.log('✅ Resultado verificación:', resultado);
      return resultado.disponible === true;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      
      // Si hay error 422, intentar con formato diferente
      if (error.response?.status === 422) {
        console.log('⚠️ Intentando con formato diferente...');
        try {
          // Intentar sin segundos
          const resultado = await reservasApi.verificarDisponibilidad(
            selectedCancha.id_cancha,
            reservationData.fecha_reserva,
            reservationData.hora_inicio,  // Sin :00 adicional
            reservationData.hora_fin      // Sin :00 adicional
          );
          return resultado.disponible === true;
        } catch (error2) {
          console.error('Error en segundo intento:', error2);
          return false;
        }
      }
      
      return false;
    }
  };
  
  const handleConfirmReservation = async () => {
    if (!profile) {
      toast.info('Por favor, inicia sesión o regístrate para completar tu reserva');
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

    // ✅ SOLO validación frontend (ya es suficiente)
    if (!isHorarioDisponible()) {
      toast.error('❌ El horario seleccionado no está disponible. Por favor, seleccione otro horario.');
      return;
    }
    
    // ❌ NO hagas verificación extra con el backend aquí
    // El backend ya valida en create_reserva

    try {
      const codigoCupon = selectedCoupon 
        ? cupones.find(c => c.id_cupon === parseInt(selectedCoupon))?.codigo 
        : null;
      
      const reservaData = {
        ...reservationData,
        id_usuario: profile.id,
        codigo_cupon: codigoCupon 
      };
      
      const nuevaReserva = await reservasApi.createCompleta(reservaData);
      const mensaje = codigoCupon 
        ? `¡Reserva creada exitosamente con cupón aplicado! Total: $${nuevaReserva.costo_total}`
        : `¡Reserva creada exitosamente! Total: $${nuevaReserva.costo_total}`;

      toast.success(mensaje);
      
      setConfirmOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creando reserva:', error);
      
      // ✅ El backend ya te dirá si el horario está ocupado
      if (error.response?.data?.detail?.includes('no está disponible') || 
          error.response?.data?.detail?.includes('ocupado') ||
          error.response?.status === 400) {
        toast.error(`❌ ${error.response.data.detail || 'El horario seleccionado no está disponible'}`);
      } else {
        toast.error(error.response?.data?.detail || 'Error al crear la reserva');
      }
    }
  };

  const resetForm = () => {
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
    fetchCuponesUsuario();
  };
  
  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-6">
          Reservar Cancha
        </Typography>
      </motion.div>

      <Stepper 
        activeStep={activeStep} className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Paso 1: Seleccionar Espacio (Estilos se mantienen, ya son sólidos) */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" className="font-title mb-4">
            Selecciona un Espacio Deportivo
          </Typography>
          <Grid container spacing={3}>
            {espacios.map((espacio, index) => (
              <Grid item xs={12} sm={6} md={4} key={espacio.id_espacio_deportivo}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => handleEspacioSelect(espacio)}
                  >
                    <Box
                      className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-t-2xl"
                    >
                      <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" className="font-title">
                        {espacio.nombre}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 font-body">
                      {espacio.ubicacion}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 font-body mt-2">
                        Capacidad: {espacio.capacidad} personas
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Paso 2: Seleccionar Disciplina (Estilos se mantienen, ya son sólidos) */}
      {activeStep === 1 && (
        <Box>
          <Box className="flex items-center gap-4 mb-6">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(0)}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Selecciona una Disciplina en **{selectedEspacio?.nombre}**
            </Typography>
          </Box>

          {disciplinas.length === 0 && (
            <Box className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <Typography>
                No se encontraron disciplinas con canchas disponibles en **{selectedEspacio?.nombre}**.
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            {disciplinas.map((disciplina, index) => (
              <Grid item xs={12} sm={6} md={3} key={disciplina.id_disciplina}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform 
                      hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-secondary/10 to-accent/10"
                    onClick={() => handleDisciplinaSelect(disciplina)}
                  >
                    <CardContent className="text-center py-8">
                      <Box className="text-7xl mb-4">
                        {disciplina.nombre.includes('Fútbol') ? '⚽' : 
                         disciplina.nombre.includes('Básquetbol') ?
                        '🏀' : 
                         disciplina.nombre.includes('Tenis') ?
                        '🎾' : 
                         disciplina.nombre.includes('Vóleibol') ?
                        '🏐' : '🏆'}
                      </Box>
                      <Typography variant="h5" className="font-title">
                        {disciplina.nombre}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Paso 3: Seleccionar Cancha (Estilos se mantienen, ya son sólidos) */}
      {activeStep === 2 && (
        <Box>
          <Box className="flex items-center gap-4 mb-6">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(1)}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Selecciona una Cancha de **{selectedDisciplina?.nombre}**
            </Typography>
          </Box>
          
          {canchas.length === 0 && (
            <Box className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
              <Typography>
                No se encontraron canchas de **{selectedDisciplina?.nombre}** disponibles en **{selectedEspacio?.nombre}**.
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            {canchas.filter(c => c.estado === 'disponible').map((cancha, index) => (
              <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => handleCanchaSelect(cancha)}
                  >
                    <Box
                      className="h-48 bg-gradient-to-br from-accent to-highlight flex items-center justify-center rounded-t-2xl relative"
                    >
                      <SportsSoccer sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                      <Chip
                        label={cancha.estado}
                        className="absolute top-2 right-2 bg-secondary text-white font-bold"
                        size="small"
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" className="font-title mb-2">
                        {cancha.nombre}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 font-body mb-2">
                        Tipo: {cancha.tipo}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 font-body mb-2">
                        Horario: **{cancha.hora_apertura.slice(0,5)}** - **{cancha.hora_cierre.slice(0,5)}**
                      </Typography>
                      <Typography variant="h5" className="font-title text-primary mt-3">
                        ${cancha.precio_por_hora}/hora
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Paso 4: Confirmar Reserva - MEJORAS UX/UI */}
      {activeStep === 3 && selectedCancha && (
        <Box>
          <Box className="flex items-center gap-4 mb-6">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(2)}
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Confirmar Reserva
            </Typography>
          </Box>

          // Puedes mostrar esta información al usuario:
          {getOccupiedHours().length > 0 && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="caption" color="text.primary">
                ⚠️ Horas ocupadas: {getOccupiedHours().join(', ')}
              </Typography>
            </Box>
          )}

          <Grid container spacing={4}>
            {/* Columna 1: Detalles de la Cancha (UX: Resaltar información estática) */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="rounded-2xl shadow-xl p-6 h-full bg-primary/10 border-l-4 border-primary">
                  <Typography variant="h5" className="font-title text-primary pb-3 mb-4">
                    Detalles de la Cancha
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography className="font-body text-lg mb-2">
                    <SportsSoccer sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                    <strong className="text-primary">Cancha:</strong> {selectedCancha.nombre}
                  </Typography>
                  <Typography className="font-body mb-2">
                    <Stadium sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    <strong className="text-gray-700">Espacio:</strong> {selectedEspacio?.nombre}
                  </Typography>
                  <Typography className="font-body mb-4">
                    <People sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    <strong className="text-gray-700">Disciplina:</strong> {selectedDisciplina?.nombre}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  <Typography className="font-body text-xl text-accent font-bold mb-2">
                    <Money sx={{ fontSize: 24, mr: 1, verticalAlign: 'middle', color: 'accent.main' }} />
                    <strong>Precio:</strong> ${selectedCancha.precio_por_hora}/hora
                  </Typography>
                  <Typography className="font-body text-md text-gray-800">
                    <AccessTime sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: 'text.secondary' }} />
                    **Horario:** {selectedCancha.hora_apertura.slice(0,5)} - {selectedCancha.hora_cierre.slice(0,5)}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>

            {/* Columna 2: Formulario de Reserva (UX: Agrupación y Campos claros) */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="rounded-2xl shadow-xl p-6">
                  <Typography variant="h5" className="font-title text-secondary mb-4 pb-2 border-b">
                    Información de la Reserva
                  </Typography>
               
                  <TextField
                    fullWidth
                    label="Fecha"
                    type="date"
                    value={reservationData.fecha_reserva}
                    onChange={(e) => setReservationData({ ...reservationData, fecha_reserva: e.target.value, hora_inicio: '', hora_fin: '' })} 
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: today }}
                    required
                    margin="normal"
                    // Estilo limpio con ícono al final
                    InputProps={{
                      endAdornment: <CalendarToday color="action" />,
                    }}
                  />
                  
                  {/* Campos de Hora con validación */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Hora de inicio</InputLabel>
                        <Select
                          value={reservationData.hora_inicio}
                          onChange={(e) => {
                            const horaInicio = e.target.value;
                            setReservationData({ 
                              ...reservationData, 
                              hora_inicio: horaInicio,
                              hora_fin: '' // Resetear hora fin cuando cambia inicio
                            });
                          }}
                          label="Hora de inicio"
                          disabled={!reservationData.fecha_reserva}
                        >
                          <MenuItem value="">
                            <em>Seleccionar hora</em>
                          </MenuItem>
                          {horariosDisponibles
                            .filter(slot => {
                              // Solo mostrar horas que estén disponibles
                              return slot.disponible === true;
                            })
                            .map((slot) => {
                              const horaInicio = slot.hora_inicio;
                              
                              return (
                                <MenuItem key={horaInicio} value={horaInicio}>
                                  {horaInicio}
                                </MenuItem>
                              );
                            })}
                        </Select>
                        {horariosDisponibles.filter(s => !s.disponible).length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            ⚠️ Horas ocupadas no se muestran en la lista
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Hora de fin</InputLabel>
                        <Select
                          value={reservationData.hora_fin}
                          onChange={(e) => {
                            const horaFin = e.target.value;
                            setReservationData({ ...reservationData, hora_fin: horaFin });
                          }}
                          label="Hora de fin"
                          disabled={!reservationData.hora_inicio}
                          error={!!(reservationData.hora_fin && !isHorarioDisponible())} // ✅ CORREGIDO
                        >
                          <MenuItem value="">
                            <em>Seleccionar hora</em>
                          </MenuItem>
                          {reservationData.hora_inicio && 
                            horariosDisponibles
                              .filter(slot => {
                                // Solo mostrar horas DISPONIBLES
                                if (!slot.disponible) return false;
                                
                                // Convertir a minutos para comparar
                                const toMinutes = (timeStr) => {
                                  const [hours, minutes] = timeStr.split(':').map(Number);
                                  return hours * 60 + minutes;
                                };
                                
                                const slotMinutes = toMinutes(slot.hora_inicio);
                                const inicioMinutes = toMinutes(reservationData.hora_inicio);
                                
                                // Solo horas después de la hora de inicio
                                return slotMinutes > inicioMinutes;
                              })
                              .map((slot) => {
                                const horaFin = slot.hora_inicio;
                                
                                return (
                                  <MenuItem key={horaFin} value={horaFin}>
                                    {horaFin}
                                  </MenuItem>
                                );
                              })
                          }
                        </Select>
                        {reservationData.hora_fin && !isHorarioDisponible() && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            ⚠️ Este horario está ocupado o no está disponible
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      ⏰ Las reservas solo pueden hacerse en horas completas (ej: 10:00, 11:00)
                    </Typography>
                  </Box>
                 
                  <TextField
                    fullWidth
                    label="Cantidad de asistentes"
                    type="number"
                    value={reservationData.cantidad_asistentes || ''} // Asegurar que no sea undefined
                    onChange={(e) => {
                      const value = e.target.value;
                      // Convertir a número o mantener vacío
                      const numValue = value === '' ? '' : parseInt(value, 10);
                      // Validar que sea número válido y positivo
                      if (value === '' || (!isNaN(numValue) && numValue > 0)) {
                        setReservationData({ 
                          ...reservationData, 
                          cantidad_asistentes: numValue === '' ? 1 : numValue
                        });
                      }
                    }}
                    inputProps={{ 
                      min: 1, 
                      max: selectedEspacio?.capacidad || 100 
                    }}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Material prestado (opcional)"
                    value={reservationData.material_prestado}
                    onChange={(e) => setReservationData({ ...reservationData, material_prestado: e.target.value })}
                    margin="normal"
                    helperText="Ej: Balones, redes, etc."
                  />
                  
                  {cupones.length > 0 && (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Cupón de descuento</InputLabel>
                      <Select
                        value={selectedCoupon}
                        onChange={(e) => setSelectedCoupon(e.target.value)}
                      >
                        <MenuItem value="">Sin cupón</MenuItem>
                        {cupones.map((coupon) => (
                          <MenuItem key={coupon.id_cupon} value={coupon.id_cupon}>
                            {coupon.tipo === 'porcentaje' ?
                              `${coupon.monto_descuento}% descuento` :
                              `$${coupon.monto_descuento} descuento`} - {coupon.codigo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  {/* UX: Resaltar el total con fondo y tipografía grande */}
                  <Box className="mt-6 p-4 bg-primary/20 rounded-xl text-center shadow-md">
                    <Typography variant="h3" className="font-title text-primary">
                      Total: **${calcularCostoTotal().toFixed(2)}**
                    </Typography>
                    {selectedCoupon && (
                      <Typography variant="body1" className="text-green-800 font-body font-bold mt-1">
                        ✅ Cupón aplicado
                      </Typography>
                    )}
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setConfirmOpen(true)}
                    disabled={
                      !reservationData.fecha_reserva ||
                      !reservationData.hora_inicio ||
                      !reservationData.hora_fin ||
                      !isHorarioDisponible() || // ✅ NUEVA VALIDACIÓN
                      parseInt(reservationData.hora_fin.split(':')[0]) <= 
                      parseInt(reservationData.hora_inicio.split(':')[0])
                    }
                    className="mt-6"
                    sx={{
                      textTransform: 'none',
                      background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                      '&:hover': {
                        background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                      },
                      '&:disabled': {
                        background: '#ccc',
                        color: '#666'
                      },
                      fontSize: '1.4rem',
                      py: 2, 
                      boxShadow: '0 6px 20px rgba(15, 159, 225, 0.4)',
                    }}
                  >
                    {profile ?
                      'Confirmar Reserva y Pagar' : 'Iniciar Sesión para Reservar'}
                  </Button>

                  {!isHorarioDisponible() && reservationData.hora_inicio && reservationData.hora_fin && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="error.contrastText">
                        ⚠️ El horario seleccionado ({reservationData.hora_inicio} - {reservationData.hora_fin}) 
                        no está disponible. Por favor, seleccione otro horario.
                      </Typography>
                    </Box>
                  )}
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        
        <DialogTitle className="font-title">Confirmar Reserva</DialogTitle>
        <DialogContent>
          <Typography className="font-body">
            Revisa los detalles finales antes de proceder al pago:
          </Typography>
          <Box className="mt-4 p-4 bg-gray-100 rounded-xl">
            <Typography className="font-body mb-1">
              <strong className="text-primary">Cancha:</strong> {selectedCancha?.nombre}
            </Typography>
            <Typography className="font-body mb-1">
              <strong className="text-gray-700">Fecha:</strong> {reservationData.fecha_reserva}
            </Typography>
            <Typography className="font-body mb-1">
              <strong className="text-gray-700">Horario:</strong> {reservationData.hora_inicio} - {reservationData.hora_fin}
            </Typography>
            {selectedCoupon && (
              <Typography className="font-body mb-1 text-green-600">
                <strong>Cupón aplicado:</strong> {cupones.find(c => c.id_cupon === parseInt(selectedCoupon))?.codigo}
              </Typography>
            )}
            <Typography className="font-title text-primary text-2xl mt-3">
              <strong>Total a Pagar:</strong> ${calcularCostoTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmReservation}
            variant="contained"
            disabled={!isHorarioDisponible()} // ✅ Validar aquí también
            sx={{
              background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
              '&:hover': {
                background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666'
              }
            }}
          >
            Pagar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}