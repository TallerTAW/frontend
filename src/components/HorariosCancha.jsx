import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack,
  SportsSoccer,
  Stadium,
  Today,
  Refresh,
  CheckCircle,
  Cancel,
  Warning,
  Person
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { reservasApi } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const HorariosCancha = ({ cancha, espacio, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cantidadAsistentes, setCantidadAsistentes] = useState(1);
  const { user, profile } = useAuth();

  const fetchHorariosDisponibles = async () => {
    if (!cancha) return;
    
    setLoading(true);
    try {
      const fechaFormateada = selectedDate.toISOString().split('T')[0];
      
      console.log(`🔄 [FRONTEND] Consultando horarios para cancha ${cancha.id_cancha}, fecha ${fechaFormateada}`);
      
      // Usar la función de BD para obtener horarios disponibles
      const horariosBD = await reservasApi.getHorariosDisponibles(cancha.id_cancha, fechaFormateada);
      
      console.log(`✅ [FRONTEND] Horarios recibidos:`, horariosBD);
      
      // Transformar los datos de la BD al formato que necesita el frontend
      const horariosTransformados = horariosBD.map(horario => ({
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        disponible: horario.disponible,
        precio_hora: horario.precio_hora,
        mensaje: horario.mensaje,
        estado: horario.disponible ? 'disponible' : 'ocupado'
      }));
      
      setHorarios(horariosTransformados);
      
      // Log para debugging
      const horariosOcupados = horariosTransformados.filter(h => !h.disponible);
      console.log(`📊 [FRONTEND] Total horarios: ${horariosTransformados.length}, Ocupados: ${horariosOcupados.length}`);
      
    } catch (error) {
      console.error('❌ [FRONTEND] Error al cargar horarios:', error);
      
      if (error.response?.status === 500) {
        toast.error('Error al consultar la disponibilidad. La función de BD puede no estar disponible.');
      } else {
        toast.error('Error al cargar los horarios disponibles');
      }
      
      setHorarios([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Efecto para cargar horarios cuando cambia la fecha o la cancha
  useEffect(() => {
    fetchHorariosDisponibles();
  }, [selectedDate, cancha]);

  // Función para forzar recarga manual
  const handleForceRefresh = () => {
    setRefreshing(true);
    fetchHorariosDisponibles();
  };

  const getEstadoColor = (estado, disponible) => {
    if (!disponible) return 'error';
    
    const colors = {
      'disponible': 'success',
      'ocupado': 'error',
      'reservada': 'warning',
      'confirmada': 'primary',
      'en_curso': 'info',
      'completada': 'secondary',
      'cancelada': 'default'
    };
    return colors[estado] || 'default';
  };

  const getEstadoIcon = (disponible) => {
    if (disponible) {
      return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
    } else {
      return <Cancel sx={{ color: 'error.main', fontSize: 20 }} />;
    }
  };

  const getEstadoText = (disponible, mensaje) => {
    if (!disponible) {
      return mensaje || 'OCUPADO';
    }
    return 'DISPONIBLE';
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleHorarioClick = (horario) => {
    if (horario.disponible) {
      setSelectedHorario(horario);
      setDialogOpen(true);
    }
  };

  const handleReservar = async () => {
    if (!selectedHorario || !user || !profile) {
      toast.error('Debes iniciar sesión para realizar una reserva');
      return;
    }
    
    try {
      setRefreshing(true);
      
      // Preparar datos para la reserva
      const reservaData = {
        fecha_reserva: selectedDate.toISOString().split('T')[0],
        hora_inicio: selectedHorario.hora_inicio,
        hora_fin: selectedHorario.hora_fin,
        cantidad_asistentes: cantidadAsistentes,
        id_cancha: cancha.id_cancha,
        id_disciplina: cancha.id_disciplina || 1, // Valor por defecto si no hay disciplina
        id_usuario: profile.id_usuario || user.id
      };
      
      console.log('📤 [FRONTEND] Enviando reserva:', reservaData);
      
      // Crear reserva usando el endpoint completo
      const nuevaReserva = await reservasApi.crearReservaCompleta(reservaData);
      
      console.log('✅ [FRONTEND] Reserva creada:', nuevaReserva);
      
      toast.success(`¡Reserva creada exitosamente! Código: ${nuevaReserva.codigo_reserva}`);
      
      // Cerrar el diálogo y resetear
      setDialogOpen(false);
      setSelectedHorario(null);
      setCantidadAsistentes(1);
      
      // ✅ RECARGAR HORARIOS DESPUÉS DE LA RESERVA
      setTimeout(() => {
        console.log('🔄 [FRONTEND] Recargando horarios después de reserva...');
        handleForceRefresh();
      }, 1500);
      
    } catch (error) {
      console.error('❌ [FRONTEND] Error al crear reserva:', error);
      
      if (error.response?.data?.detail) {
        toast.error(`Error: ${error.response.data.detail}`);
      } else {
        toast.error('Error al crear la reserva. Verifica la conexión.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const formatHora = (horaString) => {
    if (!horaString) return '';
    return horaString.slice(0, 5);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        {/* Header */}
        <Box className="flex items-center gap-4 mb-6">
          <IconButton onClick={onBack} className="text-primary">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" className="font-title text-primary">
              Disponibilidad - {cancha.nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {espacio.nombre} • Los horarios se actualizan automáticamente después de cada reserva
            </Typography>
          </Box>
        </Box>

        {/* Información de cancha y espacio */}
        <Card className="rounded-2xl shadow-lg mb-4">
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box className="flex items-center gap-2 mb-2">
                  <Stadium color="primary" />
                  <Typography variant="h6" className="font-title">
                    {espacio.nombre}
                  </Typography>
                </Box>
                <Typography variant="body2" className="text-gray-600">
                  📍 {espacio.ubicacion}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="flex items-center gap-2 mb-2">
                  <SportsSoccer color="primary" />
                  <Typography variant="h6" className="font-title">
                    {cancha.nombre}
                  </Typography>
                </Box>
                <Box className="flex gap-2 flex-wrap">
                  <Chip 
                    label={cancha.disciplina || 'Sin disciplina'} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={`$${cancha.precio_por_hora || cancha.precio_hora || '0'}/hora`} 
                    variant="outlined" 
                    size="small" 
                  />
                  <Chip 
                    label={cancha.estado === 'activo' ? 'ACTIVA' : 'INACTIVA'} 
                    color={cancha.estado === 'activo' ? 'success' : 'default'} 
                    size="small" 
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Controles de fecha */}
        <Card className="rounded-2xl shadow-lg mb-4">
          <CardContent>
            <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Box className="flex items-center gap-2">
                <Today color="primary" />
                <Typography variant="h6" className="font-title">
                  Consultar disponibilidad para:
                </Typography>
              </Box>
              
              <Box className="flex items-center gap-2">
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      size="small"
                      sx={{ width: 200 }}
                    />
                  )}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleForceRefresh}
                  disabled={loading || refreshing}
                >
                  {loading || refreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </Box>
            </Box>
            
            {isToday(selectedDate) && (
              <Chip 
                label="CONSULTANDO DISPONIBILIDAD PARA HOY" 
                color="primary" 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </CardContent>
        </Card>

        {/* Tabla de horarios */}
        <Card className="rounded-2xl shadow-lg">
          <CardContent>
            <Box className="flex justify-between items-center mb-3">
              <Typography variant="h6" className="font-title">
                Disponibilidad para {selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
              
              <Chip 
                label={`${horarios.filter(h => !h.disponible).length} ocupados de ${horarios.length}`}
                color="info"
                variant="outlined"
                size="small"
              />
            </Box>

            {loading ? (
              <Box className="text-center py-8">
                <CircularProgress />
                <Typography variant="body1" className="mt-2 text-gray-600">
                  Consultando disponibilidad en la base de datos...
                </Typography>
              </Box>
            ) : horarios.length === 0 ? (
              <Alert severity="info" className="rounded-xl">
                No hay horarios configurados para esta cancha en la fecha seleccionada.
                Verifica que la cancha tenga horarios de apertura y cierre configurados.
              </Alert>
            ) : (
              <TableContainer component={Paper} className="rounded-xl">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Horario</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Precio</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {horarios.map((horario, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          backgroundColor: horario.disponible ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
                          '&:hover': {
                            backgroundColor: horario.disponible ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" className="font-medium">
                            {formatHora(horario.hora_inicio)} - {formatHora(horario.hora_fin)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            {getEstadoIcon(horario.disponible)}
                            <Chip 
                              label={getEstadoText(horario.disponible, horario.mensaje)}
                              color={getEstadoColor(horario.estado, horario.disponible)}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" className="font-medium">
                            ${horario.precio_hora || cancha.precio_por_hora || cancha.precio_hora || '0'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {horario.disponible ? (
                            <Button 
                              variant="contained" 
                              size="small"
                              color="success"
                              onClick={() => handleHorarioClick(horario)}
                              startIcon={<CheckCircle />}
                              disabled={!user}
                            >
                              {user ? 'Reservar' : 'Inicia sesión'}
                            </Button>
                          ) : (
                            <Button 
                              variant="outlined" 
                              size="small"
                              color="error"
                              disabled
                              startIcon={<Warning />}
                            >
                              No Disponible
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Información adicional */}
            <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Typography variant="body2" className="text-blue-800">
                <strong>💡 Información:</strong> Después de crear una reserva, los horarios se actualizan automáticamente. 
                Si no ves los cambios, haz clic en &quot;Actualizar&quot; o espera unos segundos.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Dialog para reservar */}
        <Dialog
          open={dialogOpen}
          onClose={() => !refreshing && setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="font-title">
            Confirmar Reserva
          </DialogTitle>
          <DialogContent>
            {selectedHorario && (
              <Box className="space-y-4 mt-2">
                <Typography><strong>Cancha:</strong> {cancha.nombre}</Typography>
                <Typography><strong>Fecha:</strong> {selectedDate.toLocaleDateString('es-ES')}</Typography>
                <Typography><strong>Horario:</strong> {formatHora(selectedHorario.hora_inicio)} - {formatHora(selectedHorario.hora_fin)}</Typography>
                <Typography><strong>Precio estimado:</strong> ${selectedHorario.precio_hora || cancha.precio_por_hora || cancha.precio_hora || '0'}</Typography>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Asistentes</InputLabel>
                  <Select
                    value={cantidadAsistentes}
                    label="Asistentes"
                    onChange={(e) => setCantidadAsistentes(e.target.value)}
                    startAdornment={<Person sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <MenuItem key={num} value={num}>
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Alert severity="info">
                  Al confirmar, se creará la reserva y los horarios se actualizarán automáticamente.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDialogOpen(false)} 
              disabled={refreshing}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleReservar}
              disabled={refreshing}
              startIcon={refreshing ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {refreshing ? 'Creando reserva...' : 'Confirmar Reserva'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

HorariosCancha.propTypes = {
  cancha: PropTypes.shape({
    id_cancha: PropTypes.number,
    nombre: PropTypes.string,
    disciplina: PropTypes.string,
    precio_por_hora: PropTypes.number,
    precio_hora: PropTypes.number,
    estado: PropTypes.string,
    id_disciplina: PropTypes.number
  }).isRequired,
  espacio: PropTypes.shape({
    nombre: PropTypes.string,
    ubicacion: PropTypes.string
  }).isRequired,
  onBack: PropTypes.func.isRequired
};

export default HorariosCancha;