import { Button, Grid, Card, CardContent, Typography, Box, Divider, Chip, Alert, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { ArrowBack, SportsSoccer, Stadium, People, Money, AccessTime, CalendarMonth, Groups, LocalOffer, QrCode, ContentCopy } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ReservationForm from './ReservationForm';
import PaymentSummary from './PaymentSummary';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';


export default function Step3Confirmacion({
  selectedEspacio,
  selectedDisciplina,
  selectedCancha,
  cupones,
  reservationData,
  horariosDisponibles,
  selectedCoupon,
  onBack,
  onCouponChange,
  onReservationChange,
  onConfirm,
  isHorarioDisponible,
  calcularCostoTotal,
  getOccupiedHours,
  profile,
  isHoraInicioValida,
  isHoraFinValida,
  getHorasInicioDisponiblesList,
  getHorasFinDisponiblesList,
  asistentes = [],
  onAsistentesChange,
}) {
  const occupiedHours = getOccupiedHours();
  const totalHours = reservationData.hora_inicio && reservationData.hora_fin 
    ? parseInt(reservationData.hora_fin.split(':')[0]) - parseInt(reservationData.hora_inicio.split(':')[0])
    : 0;
  const [horarioDisponible, setHorarioDisponible] = useState(true);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [codigoReserva, setCodigoReserva] = useState('');
  const [showCodigoDialog, setShowCodigoDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codigoAcceso, setCodigoAcceso] = useState('');

  // Validar horario
  useEffect(() => {
    if (reservationData.hora_inicio && reservationData.hora_fin) {
      setHorarioDisponible(isHorarioDisponible());
    } else {
      setHorarioDisponible(true);
    }
  }, [reservationData.hora_inicio, reservationData.hora_fin, reservationData.fecha_reserva]);

  // Determinar si el botón debe estar deshabilitado
  const isButtonDisabled = () => {
    const condiciones = {
      fecha: !reservationData.fecha_reserva,
      hora_inicio: !reservationData.hora_inicio,
      hora_fin: !reservationData.hora_fin,
      horarioNoDisponible: !isHorarioDisponible() || !horarioDisponible,
      horasInvalidas: reservationData.hora_inicio && reservationData.hora_fin && 
                      parseInt(reservationData.hora_fin.split(':')[0]) <= parseInt(reservationData.hora_inicio.split(':')[0]),
    };
    
    return Object.values(condiciones).some(c => c);
  };

 const handleConfirmarReserva = async () => {
  try {
    setLoading(true);
    
    const response = await onConfirm();
    
    if (response && response.codigo_reserva) {
      setCodigoReserva(response.codigo_reserva);
      setReservaConfirmada(true);
      setShowCodigoDialog(true);
      
      // ✅ Forzar un pequeño delay para asegurar que todo se actualice
      setTimeout(() => {
        toast.success(`Reserva confirmada! Código: ${response.codigo_reserva}`);
      }, 500);
    } else {
      // ✅ Intentar obtener el código de otras maneras
      const fallbackCode = response?.data?.codigo_reserva;
      setCodigoReserva(fallbackCode);
      setReservaConfirmada(true);
      setShowCodigoDialog(true);
      
      toast.warning('Código generado localmente. Revisa tu email para el código oficial.');
    }
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    toast.error('Error al confirmar reserva');
  } finally {
    setLoading(false);
  }
};

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoReserva);
    // Mostrar notificación de copiado
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
      {/* Botón Volver y Título */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 3 },
        mb: { xs: 4, sm: 6 }
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          variant="outlined"
          sx={{ 
            color: '#0f9fe1',
            borderColor: '#0f9fe1',
            fontWeight: 'bold',
            minWidth: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: '#0d8dc7',
              backgroundColor: 'rgba(15, 159, 225, 0.08)'
            }
          }}
        >
          Volver
        </Button>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1a237e',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            textAlign: { xs: 'center', sm: 'left' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          {reservaConfirmada ? 'Reserva Confirmada' : 'Confirmar Reserva'}
        </Typography>
      </Box>

      {reservaConfirmada ? (
        // Vista de reserva confirmada
        <Box>
          <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              ✅ ¡Reserva Confirmada!
            </Typography>
            <Typography variant="body2">
              La reserva se ha creado exitosamente. Revisa tu correo para más detalles.
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#e8f5e9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <QrCode sx={{ fontSize: 40, color: '#0f9fe1' }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#1a237e">
                  Proximos pasos
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: 2 }}>
                  {codigoReserva}
                </Typography>
              </Box>
              <Button
                startIcon={<ContentCopy />}
                onClick={copiarCodigo}
                variant="outlined"
                sx={{ ml: 'auto' }}
              >
                Copiar
              </Button>
            </Box>

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                🎯 Códigos para Invitados: {reservationData.cantidad_asistentes - 1}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Comparte este código con los demás asistentes. Cada uno podrá registrarse usando este código hasta {reservationData.cantidad_asistentes - 1} veces.
              </Typography>
            </Alert>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'white', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1a237e" sx={{ mb: 2 }}>
                Instrucciones para Invitados:
              </Typography>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="body2">Comparte el código con los demás asistentes</Typography></li>
                <li><Typography variant="body2">Los invitados pueden registrarse en la página principal usando el código</Typography></li>
                <li><Typography variant="body2">Cada invitado recibirá su propio código QR por email</Typography></li>
                <li><Typography variant="body2">Si ya tienen cuenta, pueden usar el código desde su dashboard</Typography></li>
              </ol>
            </Box>
          </Paper>
        </Box>
      ) : (
        // Vista normal de confirmación
        <>
          {/* Alerta de horas ocupadas */}
          {occupiedHours.length > 0 && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 4, 
                borderRadius: 2,
                backgroundColor: '#fff3cd',
                color: '#856404',
                border: '1px solid #ffeaa7'
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                ⚠️ Horas ocupadas: <strong>{occupiedHours.join(', ')}</strong>
              </Typography>
            </Alert>
          )}

          {/* Grid Principal Responsivo */}
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Columna 1: Detalles de la Cancha */}
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                border: 'none',
                height: '100%',
                boxShadow: 3
              }}
            >
              {/* Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 100%)', 
                p: { xs: 2, sm: 3 },
                color: 'white'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SportsSoccer sx={{ fontSize: { xs: 22, sm: 24 } }} />
                  Detalles de la Cancha
                </Typography>
              </Box>
              
              {/* Contenido */}
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Información Principal */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      bgcolor: '#f8f9fa', 
                      borderRadius: 2 
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#0f9fe1', 
                        mb: 2, 
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      {selectedCancha.nombre}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Stadium sx={{ color: '#9eca3f', fontSize: { xs: 20, sm: 22 } }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Espacio Deportivo
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedEspacio?.nombre}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <People sx={{ color: '#0f9fe1', fontSize: { xs: 20, sm: 22 } }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Disciplina
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedDisciplina?.nombre}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccessTime sx={{ color: '#ff9800', fontSize: { xs: 20, sm: 22 } }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Horario Operativo
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedCancha.hora_apertura.slice(0,5)} - {selectedCancha.hora_cierre.slice(0,5)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Precio y Capacidad */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      bgcolor: '#f0f7ff', 
                      borderRadius: 2, 
                      border: '1px solid #e1f5fe' 
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#1a237e', 
                        mb: 2, 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      Información de Tarifas
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0' 
                        }}>
                          <Money sx={{ fontSize: { xs: 24, sm: 28 }, color: '#4caf50', mb: 1 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#2e7d32', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                          >
                            ${selectedCancha.precio_por_hora}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            por hora
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          bgcolor: 'white', 
                          borderRadius: 2, 
                          border: '1px solid #e0e0e0' 
                        }}>
                          <Groups sx={{ fontSize: { xs: 24, sm: 28 }, color: '#0f9fe1', mb: 1 }} />
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#1565c0', 
                              fontWeight: 'bold',
                              fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                          >
                            {selectedEspacio?.capacidad}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            capacidad
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Estado */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      label="DISPONIBLE"
                      color="success"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.85rem' },
                        px: 3,
                        py: 1
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

            {/* Columna 2: Formulario de Reserva */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: 3
                }}>
                  {/* Header */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', 
                    p: { xs: 2, sm: 3 },
                    color: 'white'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CalendarMonth sx={{ fontSize: { xs: 22, sm: 24 } }} />
                      Información de la Reserva
                    </Typography>
                  </Box>
                  
                  {/* Contenido */}
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <ReservationForm
                      reservationData={reservationData}
                      horariosDisponibles={horariosDisponibles}
                      selectedCoupon={selectedCoupon}
                      cupones={cupones}
                      selectedEspacio={selectedEspacio}
                      onReservationChange={onReservationChange}
                      onCouponChange={onCouponChange}
                      isHorarioDisponible={isHorarioDisponible}
                      isHoraInicioValida={isHoraInicioValida}
                      isHoraFinValida={isHoraFinValida}
                      getHorasInicioDisponiblesList={getHorasInicioDisponiblesList}
                      getHorasFinDisponiblesList={getHorasFinDisponiblesList}
                    />

                    {/* Payment Summary */}
                    <Box sx={{ mt: 3 }}>
                      <PaymentSummary
                        calcularCostoTotal={calcularCostoTotal}
                        selectedCoupon={selectedCoupon}
                        totalHours={totalHours}
                      />
                    </Box>

                    {/* Botón de Confirmación */}
                    <Box sx={{ mt: 4 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleConfirmarReserva}
                        disabled={isButtonDisabled() || loading}
                        sx={{
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0d8dc7 0%, #8ab637 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(15, 159, 225, 0.3)'
                          },
                          '&:disabled': {
                            background: '#e0e0e0',
                            color: '#9e9e9e',
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          fontWeight: 'bold',
                          py: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : profile ? (
                          '✅ Confirmar Reserva y Obtener Código'
                        ) : (
                          '🔑 Iniciar Sesión para Reservar'
                        )}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </>
      )}

      
    </Box>
  );
}