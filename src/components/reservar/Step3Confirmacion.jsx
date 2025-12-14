import { Button, Grid, Card, CardContent, Typography, Box, Divider, Chip, Alert, Paper } from '@mui/material';
import { ArrowBack, SportsSoccer, Stadium, People, Money, AccessTime, CalendarMonth, Groups, LocalOffer } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ReservationForm from './ReservationForm';
import PaymentSummary from './PaymentSummary';
import { useEffect, useState } from 'react';

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
  
  const [asistentesValidos, setAsistentesValidos] = useState(true);
  const [horarioDisponible, setHorarioDisponible] = useState(true);
  const [mostrarFormAsistentes, setMostrarFormAsistentes] = useState(false);

  // Validar horario
  useEffect(() => {
    if (reservationData.hora_inicio && reservationData.hora_fin) {
      setHorarioDisponible(isHorarioDisponible());
    } else {
      setHorarioDisponible(true);
    }
  }, [reservationData.hora_inicio, reservationData.hora_fin, reservationData.fecha_reserva]);

  // Validar asistentes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reservationData.cantidad_asistentes <= 1) {
        setAsistentesValidos(true);
        return;
      }
      
      const cantidadCoincide = asistentes && asistentes.length === reservationData.cantidad_asistentes;
      
      if (!cantidadCoincide) {
          setAsistentesValidos(false);
          return;
      }
      
      const todosValidos = asistentes.every((asistente) => {
        if (!asistente) return false;
        
        const nombreValido = asistente.nombre && asistente.nombre.trim() !== '';
        const emailValido = asistente.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asistente.email.trim());
        
        return nombreValido && emailValido;
      });
      
      setAsistentesValidos(todosValidos);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [asistentes, reservationData.cantidad_asistentes]);

  // Determinar si el botón debe estar deshabilitado
  const isButtonDisabled = () => {
    const tieneMasDeUnAsistente = reservationData.cantidad_asistentes > 1;
    
    const condiciones = {
      fecha: !reservationData.fecha_reserva,
      hora_inicio: !reservationData.hora_inicio,
      hora_fin: !reservationData.hora_fin,
      horarioNoDisponible: !isHorarioDisponible() || !horarioDisponible,
      horasInvalidas: reservationData.hora_inicio && reservationData.hora_fin && 
                      parseInt(reservationData.hora_fin.split(':')[0]) <= parseInt(reservationData.hora_inicio.split(':')[0]),
      asistentesInvalidos: tieneMasDeUnAsistente && mostrarFormAsistentes && !asistentesValidos,
    };
    
    return Object.values(condiciones).some(c => c);
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
          Confirmar Reserva
        </Typography>
      </Box>

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
                  onAsistentesChange={onAsistentesChange}
                  onMostrarFormAsistentes={(mostrar) => setMostrarFormAsistentes(mostrar)}
                />

                {/* Resumen del Tiempo */}
                {reservationData.hora_inicio && reservationData.hora_fin && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      mt: 3, 
                      bgcolor: '#f5f5f5',
                      borderRadius: 2,
                      borderLeft: '4px solid #0f9fe1'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#1a237e', 
                        mb: 1, 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      Resumen del Horario
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Inicio:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {reservationData.hora_inicio}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Fin:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {reservationData.hora_fin}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Duración total:
                        </Typography>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: '#0f9fe1', 
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          {totalHours} hora{totalHours !== 1 ? 's' : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Cupones */}
                {cupones.length > 0 && (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      mt: 3,
                      bgcolor: '#fff8e1',
                      borderRadius: 2,
                      border: '1px dashed #ffd54f'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocalOffer sx={{ color: '#ff9800', mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: '#5d4037', 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                      >
                        Cupones Disponibles
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Tienes {cupones.length} cupón{cupones.length !== 1 ? 'es' : ''} disponible{cupones.length !== 1 ? 's' : ''}
                    </Typography>
                  </Paper>
                )}

                {/* Payment Summary */}
                <Box sx={{ mt: 3 }}>
                  <PaymentSummary
                    calcularCostoTotal={calcularCostoTotal}
                    selectedCoupon={selectedCoupon}
                    totalHours={totalHours}
                  />
                </Box>

                {/* Validación de asistentes */}
                {reservationData.cantidad_asistentes > 1 && (
                  <Box sx={{ mt: 3 }}>
                    {!asistentesValidos && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          borderRadius: 2,
                          '& .MuiAlert-message': { width: '100%' }
                        }}
                      >
                        <Typography variant="caption" fontWeight="medium">
                          ❌ Completa la información de todos los asistentes
                        </Typography>
                        {asistentes?.length > 0 && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {asistentes.filter(a => a && a.nombre && a.email && 
                              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())).length}
                            /{reservationData.cantidad_asistentes} completados
                          </Typography>
                        )}
                      </Alert>
                    )}
                    
                    {asistentesValidos && asistentes?.length > 0 && (
                      <Alert severity="success" sx={{ borderRadius: 2 }}>
                        <Typography variant="caption" fontWeight="medium">
                          ✅ Todos los asistentes válidos
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Botón de Confirmación */}
                <Box sx={{ mt: 4 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={onConfirm}
                    disabled={isButtonDisabled()}
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
                    {profile ? '✅ Confirmar Reserva y Pagar' : '🔑 Iniciar Sesión para Reservar'}
                  </Button>

                  {/* Mensaje de error de horario */}
                  {!isHorarioDisponible() && reservationData.hora_inicio && reservationData.hora_fin && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 3,
                        borderRadius: 2,
                        backgroundColor: '#ffebee',
                        border: '1px solid #ffcdd2',
                        '& .MuiAlert-message': { width: '100%' }
                      }}
                    >
                      <Typography variant="caption" fontWeight="medium">
                        ❌ Horario no disponible ({reservationData.hora_inicio} - {reservationData.hora_fin})
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}