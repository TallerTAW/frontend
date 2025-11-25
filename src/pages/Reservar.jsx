// 📍 ARCHIVO: src/pages/reservar.jsx
// 🎯 PROPÓSITO: Página principal de reservas
// 💡 CAMBIO PRINCIPAL: Usar createCompleta en lugar de create para aplicar cupones

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // ✅ AGREGAR NAVIGATE
import { espaciosApi } from '../api/espacios';
import { disciplinasApi } from '../api/disciplinas';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas'; // ✅ API ACTUALIZADA
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
  ToggleButtonGroup,
  ToggleButton,
  Rating,
} from '@mui/material';
import { Stadium, Category, SportsSoccer, ArrowBack, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Reservar() {
  const { profile } = useAuth();
  const navigate = useNavigate(); // ✅ AGREGAR NAVIGATE
  const [activeStep, setActiveStep] = useState(0);
  const [espacios, setEspacios] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
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
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  useEffect(() => {
    fetchEspacios();
    if (profile) {
      fetchCuponesUsuario();
    }
  }, [profile]);

  const fetchEspacios = async () => {
    try {
      // Usar endpoint público para reservas
      const data = await espaciosApi.getDisponibles();
      setEspacios(data);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const fetchDisciplinas = async () => {
    try {
      const data = await disciplinasApi.getAll();
      setDisciplinas(data);
    } catch (error) {
      toast.error('Error al cargar disciplinas');
    }
  };

  const fetchCanchas = async () => {
    if (selectedEspacio && selectedDisciplina) {
      try {
        // ✅ USAR ENDPOINT ESPECÍFICO que filtra por espacio Y disciplina
        const data = await canchasApi.getByEspacioYDisciplina(
          selectedEspacio.id_espacio_deportivo,
          selectedDisciplina.id_disciplina
        );
        
        setCanchas(data);
        
        // ✅ MOSTRAR MENSAJE SI NO HAY CANCHAS
        if (data.length === 0) {
          toast.info(`No hay canchas de ${selectedDisciplina.nombre} disponibles en ${selectedEspacio.nombre}`);
        }
        
      } catch (error) {
        console.error('Error al cargar canchas:', error);
        
        if (error.response?.status === 404) {
          toast.info(`No hay canchas de ${selectedDisciplina.nombre} en ${selectedEspacio.nombre}`);
          setCanchas([]);
        } else {
          toast.error('Error al cargar canchas disponibles');
        }
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
    if (selectedCancha && reservationData.fecha_reserva) {
      try {
        // ✅ CAMBIO: Usar el nuevo endpoint con prefijo /reservas-completas/
        const data = await reservasApi.getDisponibilidad(
          selectedCancha.id_cancha, 
          reservationData.fecha_reserva
        );
        setHorariosDisponibles(data || []); // ✅ CAMBIO: data en lugar de data.horarios_disponibles
      } catch (error) {
        console.error('Error al cargar horarios disponibles:', error);
        setHorariosDisponibles([]);
      }
    }
  };

  useEffect(() => {
    if (selectedDisciplina) {
      fetchCanchas();
    }
  }, [selectedEspacio, selectedDisciplina]);

  useEffect(() => {
    fetchHorariosDisponibles();
  }, [selectedCancha, reservationData.fecha_reserva]);

  const handleEspacioSelect = (espacio) => {
    setSelectedEspacio(espacio);
    setActiveStep(1);
    fetchDisciplinas();
  };

  const handleDisciplinaSelect = (disciplina) => {
    setSelectedDisciplina(disciplina);
    setReservationData(prev => ({ ...prev, id_disciplina: disciplina.id_disciplina }));
    setActiveStep(2);
  };

  const handleCanchaSelect = (cancha) => {
    setSelectedCancha(cancha);
    setReservationData(prev => ({ ...prev, id_cancha: cancha.id_cancha }));
    setActiveStep(3);
  };

  const calcularCostoTotal = () => {
    if (!selectedCancha || !reservationData.hora_inicio || !reservationData.hora_fin) return 0;

    const start = new Date(`2000-01-01T${reservationData.hora_inicio}`);
    const end = new Date(`2000-01-01T${reservationData.hora_fin}`);
    const hours = (end - start) / (1000 * 60 * 60);

    let total = hours * selectedCancha.precio_por_hora;

    // Aplicar cupón si está seleccionado (solo para visualización en frontend)
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
  };

  const handleConfirmReservation = async () => {
    // ✅ CORRECCIÓN PRINCIPAL: Usar el endpoint completo con soporte para cupones
    console.log('🎯 [FRONTEND] Iniciando confirmación de reserva...');
    
    // Si es invitado, redirigir a login
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

    try {
      // Obtener el código del cupón seleccionado
      const codigoCupon = selectedCoupon 
        ? cupones.find(c => c.id_cupon === parseInt(selectedCoupon))?.codigo 
        : null;

      console.log('🎫 [FRONTEND] Cupón seleccionado:', codigoCupon);
      console.log('📅 [FRONTEND] Datos de reserva:', reservationData);

      // ✅ USAR EL ENDPOINT COMPLETO DE RESERVAS que soporta cupones
      const reservaData = {
        ...reservationData,
        id_usuario: profile.id,
        codigo_cupon: codigoCupon  // ← Incluir código de cupón
      };

      console.log('🚀 [FRONTEND] Enviando reserva al backend...', reservaData);
      
      // ✅ CAMBIO CRÍTICO: Usar createCompleta en lugar de create
      const nuevaReserva = await reservasApi.createCompleta(reservaData);

      console.log('✅ [FRONTEND] Reserva creada exitosamente:', nuevaReserva);
      
      // Mostrar mensaje de éxito según si se aplicó cupón o no
      if (codigoCupon) {
        toast.success(`¡Reserva creada exitosamente con cupón aplicado! Total: $${nuevaReserva.costo_total}`);
      } else {
        toast.success(`¡Reserva creada exitosamente! Total: $${nuevaReserva.costo_total}`);
      }
      
      setConfirmOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ [FRONTEND] Error creando reserva:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la reserva');
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

  const steps = ['Seleccionar Espacio', 'Seleccionar Disciplina', 'Seleccionar Cancha', 'Confirmar Reserva'];

  const today = new Date().toISOString().split('T')[0];

  const isHorarioDisponible = (horaInicio, horaFin) => {
    return horariosDisponibles.some(horario => 
      horario.hora_inicio === horaInicio && 
      horario.hora_fin === horaFin && 
      horario.disponible
    );
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

      <Stepper activeStep={activeStep} className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Paso 1: Seleccionar Espacio */}
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

      {/* Paso 2: Seleccionar Disciplina */}
      {activeStep === 1 && (
        <Box>
          <Box className="flex items-center gap-4 mb-4">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(0)}
              className="text-primary"
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Selecciona una Disciplina
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {disciplinas.map((disciplina, index) => (
              <Grid item xs={12} sm={6} md={3} key={disciplina.id_disciplina}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-secondary/10 to-accent/10"
                    onClick={() => handleDisciplinaSelect(disciplina)}
                  >
                    <CardContent className="text-center py-8">
                      <Box className="text-7xl mb-4">
                        {disciplina.nombre === 'Fútbol' ? '⚽' :
                         disciplina.nombre === 'Básquetbol' ? '🏀' :
                         disciplina.nombre === 'Tenis' ? '🎾' :
                         disciplina.nombre === 'Vóleibol' ? '🏐' : '🏆'}
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

      {/* Paso 3: Seleccionar Cancha */}
      {activeStep === 2 && (
        <Box>
          <Box className="flex items-center gap-4 mb-4">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(1)}
              className="text-primary"
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Selecciona una Cancha
            </Typography>
          </Box>
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
                        Horario: {cancha.hora_apertura.slice(0,5)} - {cancha.hora_cierre.slice(0,5)}
                      </Typography>
                      <Typography variant="h6" className="font-title text-accent">
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

      {/* Paso 4: Confirmar Reserva */}
      {activeStep === 3 && selectedCancha && (
        <Box>
          <Box className="flex items-center gap-4 mb-4">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(2)}
              className="text-primary"
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Confirmar Reserva
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className="rounded-2xl shadow-lg p-4">
                <Typography variant="h6" className="font-title mb-4">
                  Detalles de la Cancha
                </Typography>
                <Typography className="font-body mb-2">
                  <strong>Cancha:</strong> {selectedCancha.nombre}
                </Typography>
                <Typography className="font-body mb-2">
                  <strong>Espacio:</strong> {selectedEspacio?.nombre}
                </Typography>
                <Typography className="font-body mb-2">
                  <strong>Disciplina:</strong> {selectedDisciplina?.nombre}
                </Typography>
                <Typography className="font-body mb-2">
                  <strong>Precio:</strong> ${selectedCancha.precio_por_hora}/hora
                </Typography>
                <Typography className="font-body">
                  <strong>Horario:</strong> {selectedCancha.hora_apertura.slice(0,5)} - {selectedCancha.hora_cierre.slice(0,5)}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="rounded-2xl shadow-lg p-4">
                <Typography variant="h6" className="font-title mb-4">
                  Información de la Reserva
                </Typography>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={reservationData.fecha_reserva}
                  onChange={(e) => setReservationData({ ...reservationData, fecha_reserva: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  required
                  className="mb-4"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Hora de inicio"
                  type="time"
                  value={reservationData.hora_inicio}
                  onChange={(e) => setReservationData({ ...reservationData, hora_inicio: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Hora de fin"
                  type="time"
                  value={reservationData.hora_fin}
                  onChange={(e) => setReservationData({ ...reservationData, hora_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Cantidad de asistentes"
                  type="number"
                  value={reservationData.cantidad_asistentes}
                  onChange={(e) => setReservationData({ ...reservationData, cantidad_asistentes: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: selectedEspacio?.capacidad }}
                  margin="normal"
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
                
                <Box className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
                  <Typography variant="h5" className="font-title text-primary">
                    Total: ${calcularCostoTotal().toFixed(2)}
                  </Typography>
                  {selectedCoupon && (
                    <Typography variant="body2" className="text-green-600 font-body">
                      ✅ Cupón aplicado - Precio final con descuento
                    </Typography>
                  )}
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setConfirmOpen(true)}
                  disabled={!reservationData.fecha_reserva || !reservationData.hora_inicio || !reservationData.hora_fin}
                  className="mt-4"
                  sx={{
                    textTransform: 'none',
                    background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                    },
                    fontSize: '1.1rem',
                    py: 1.5,
                  }}
                >
                  {profile ? 'Confirmar Reserva' : 'Iniciar Sesión para Reservar'}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle className="font-title">Confirmar Reserva</DialogTitle>
        <DialogContent>
          <Typography className="font-body">
            ¿Estás seguro de confirmar esta reserva?
          </Typography>
          <Box className="mt-4 p-4 bg-gray-100 rounded-xl">
            <Typography className="font-body mb-1">
              <strong>Cancha:</strong> {selectedCancha?.nombre}
            </Typography>
            <Typography className="font-body mb-1">
              <strong>Fecha:</strong> {reservationData.fecha_reserva}
            </Typography>
            <Typography className="font-body mb-1">
              <strong>Horario:</strong> {reservationData.hora_inicio} - {reservationData.hora_fin}
            </Typography>
            {selectedCoupon && (
              <Typography className="font-body mb-1 text-green-600">
                <strong>Cupón aplicado:</strong> {cupones.find(c => c.id_cupon === parseInt(selectedCoupon))?.codigo}
              </Typography>
            )}
            <Typography className="font-title text-primary text-xl mt-2">
              <strong>Total:</strong> ${calcularCostoTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmReservation}
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
              '&:hover': {
                background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}