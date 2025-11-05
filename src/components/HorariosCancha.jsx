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
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  SportsSoccer,
  Stadium,
  Today,
  Refresh,
  CheckCircle,
  Cancel,
  Warning
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { reservasApi } from '../api/reservas';
import { toast } from 'react-toastify';

const HorariosCancha = ({ cancha, espacio, onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);

  const fetchHorariosDisponibles = async () => {
    if (!cancha) return;
    
    setLoading(true);
    try {
      const fechaFormateada = selectedDate.toISOString().split('T')[0];
      
      // Usar la función de BD para obtener horarios disponibles
      const horariosBD = await reservasApi.getHorariosDisponibles(cancha.id_cancha, fechaFormateada);
      
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
      
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      
      // Si hay error con la función de BD, mostrar mensaje específico
      if (error.response?.status === 500) {
        toast.error('Error al consultar la disponibilidad. La función de BD puede no estar disponible.');
      } else {
        toast.error('Error al cargar los horarios disponibles');
      }
      
      // En caso de error, mostrar horarios vacíos
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorariosDisponibles();
  }, [selectedDate, cancha]);

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
    if (!selectedHorario) return;
    
    try {
      // Aquí puedes implementar la lógica para crear una reserva
      toast.info('Funcionalidad de reserva en desarrollo');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Error al crear la reserva');
    }
  };

  const formatHora = (horaString) => {
    if (!horaString) return '';
    // Convertir "14:30:00" a "14:30"
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
              {espacio.nombre} • Horarios disponibles según configuración de BD
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
                  onClick={fetchHorariosDisponibles}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Actualizar'}
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
            <Typography variant="h6" className="font-title mb-3">
              Disponibilidad para {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>

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
                          backgroundColor: horario.disponible ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          '&:hover': {
                            backgroundColor: horario.disponible ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
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
                            >
                              Reservar
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
                <strong>Información:</strong> Los horarios se calculan automáticamente usando la función de base de datos 
                <code>listar_horarios_disponibles()</code> que considera las reservas existentes y el horario de apertura/cierre de la cancha.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Dialog para reservar */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="font-title">
            Confirmar Reserva
          </DialogTitle>
          <DialogContent>
            {selectedHorario && (
              <Box className="space-y-3">
                <Typography><strong>Cancha:</strong> {cancha.nombre}</Typography>
                <Typography><strong>Fecha:</strong> {selectedDate.toLocaleDateString('es-ES')}</Typography>
                <Typography><strong>Horario:</strong> {formatHora(selectedHorario.hora_inicio)} - {formatHora(selectedHorario.hora_fin)}</Typography>
                <Typography><strong>Precio:</strong> ${selectedHorario.precio_hora || cancha.precio_por_hora || cancha.precio_hora || '0'}</Typography>
                <Alert severity="info">
                  Esta acción creará una nueva reserva para el horario seleccionado.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleReservar}
            >
              Confirmar Reserva
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
    estado: PropTypes.string
  }).isRequired,
  espacio: PropTypes.shape({
    nombre: PropTypes.string,
    ubicacion: PropTypes.string
  }).isRequired,
  onBack: PropTypes.func.isRequired
};

export default HorariosCancha;