import { Button, Grid, Card, CardContent, Typography, Box, Divider, Chip, Alert, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress as MuiCircularProgress } from '@mui/material';
import { ArrowBack, SportsSoccer, Stadium, People, Money, AccessTime, CalendarMonth, Groups, LocalOffer, QrCode, ContentCopy, Discount, Close } from '@mui/icons-material';
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
  cupones = [],
  reservationData,
  horariosDisponibles,
  selectedCoupon,
  selectedCouponData,
  onBack,
  onCouponChange,
  onRemoveCoupon,
  onReservationChange,
  onConfirm,
  isHorarioDisponible,
  calcularCostoBase,
  calcularDescuento,
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
  const [cuponSeleccionado, setCuponSeleccionado] = useState('');
  const [cuponValido, setCuponValido] = useState(false);

  // Validar horario
  useEffect(() => {
    if (reservationData.hora_inicio && reservationData.hora_fin) {
      setHorarioDisponible(isHorarioDisponible());
    } else {
      setHorarioDisponible(true);
    }
  }, [reservationData.hora_inicio, reservationData.hora_fin, reservationData.fecha_reserva]);

  // Actualizar cupón seleccionado cuando cambie selectedCoupon
  useEffect(() => {
    if (selectedCoupon) {
      const cupon = cupones.find(c => c.codigo === selectedCoupon);
      if (cupon) {
        setCuponSeleccionado(cupon.codigo);
        setCuponValido(true);
      }
    } else {
      setCuponSeleccionado('');
      setCuponValido(false);
    }
  }, [selectedCoupon, cupones]);

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
        
        setTimeout(() => {
          toast.success(`Reserva confirmada! Código: ${response.codigo_reserva}`);
        }, 500);
      } else {
        const fallbackCode = response?.data?.codigo_reserva;
        setCodigoReserva(fallbackCode);
        setReservaConfirmada(true);
        setShowCodigoDialog(true);
      }
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      toast.error('Error al confirmar reserva');
    } finally {
      setLoading(false);
    }
  };

  // Manejar aplicación de cupón
  const handleAplicarCupon = (codigoCupon) => {
    if (!profile) {
      toast.error('Debes iniciar sesión para aplicar cupones');
      return;
    }

    if (onCouponChange) {
      const aplicado = onCouponChange(codigoCupon);
      if (aplicado) {
        setCuponSeleccionado(codigoCupon);
      }
    }
  };

  // Manejar remoción de cupón
  const handleRemoverCupon = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon();
      setCuponSeleccionado('');
      setCuponValido(false);
    }
  };

  // Filtrar cupones válidos
  const cuponesValidos = cupones.filter(cupon => {
    const estadoValido = cupon.estado === 'activo';
    const fechaValida = !cupon.fecha_expiracion || new Date(cupon.fecha_expiracion) >= new Date();
    const noUtilizado = !cupon.id_reserva;
    
    return estadoValido && fechaValida && noUtilizado;
  });

  // Renderizar sección de cupones
  const renderCuponesDisponibles = () => {
    if (!profile) {
      return (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            🔐 <strong>Inicia sesión</strong> para ver y aplicar tus cupones disponibles
          </Typography>
        </Alert>
      );
    }

    if (cuponesValidos.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            No tienes cupones disponibles en este momento
          </Typography>
        </Alert>
      );
    }

    return (
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: '#1a237e',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Discount sx={{ color: '#0f9fe1' }} />
          Tus Cupones Disponibles
        </Typography>
        
        <Grid container spacing={2}>
          {cuponesValidos.map((cupon) => (
            <Grid item xs={12} sm={6} md={4} key={cupon.id_cupon}>
              <Card 
                variant="outlined"
                sx={{ 
                  cursor: 'pointer',
                  borderColor: cuponSeleccionado === cupon.codigo ? '#4caf50' : '#e0e0e0',
                  borderWidth: cuponSeleccionado === cupon.codigo ? 2 : 1,
                  backgroundColor: cuponSeleccionado === cupon.codigo ? '#e8f5e9' : 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#0f9fe1',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => handleAplicarCupon(cupon.codigo)}
              >
                <CardContent sx={{ p: 2, position: 'relative' }}>
                  {cuponSeleccionado === cupon.codigo && (
                    <Chip 
                      label="APLICADO"
                      color="success"
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalOffer sx={{ 
                      color: cuponSeleccionado === cupon.codigo ? '#4caf50' : '#0f9fe1',
                      fontSize: 20 
                    }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="#1a237e">
                      {cupon.codigo}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Descuento:
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#2e7d32',
                        fontWeight: 'bold'
                      }}
                    >
                      {cupon.tipo === 'porcentaje' ? `${cupon.monto_descuento}%` : `$${cupon.monto_descuento}`}
                    </Typography>
                  </Box>
                  
                  {cupon.fecha_expiracion && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Válido hasta: {new Date(cupon.fecha_expiracion).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  <Button
                    size="small"
                    variant={cuponSeleccionado === cupon.codigo ? "contained" : "outlined"}
                    color={cuponSeleccionado === cupon.codigo ? "success" : "primary"}
                    sx={{ 
                      mt: 2,
                      width: '100%',
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    {cuponSeleccionado === cupon.codigo ? '✓ Aplicado' : 'Aplicar Cupón'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {selectedCoupon && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#e8f5e9', 
            borderRadius: 2,
            border: '1px solid #4caf50',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="body1" fontWeight="bold" color="#2e7d32">
                ✓ Cupón aplicado: {selectedCoupon}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCouponData?.tipo === 'porcentaje' 
                  ? `${selectedCouponData?.monto_descuento}% de descuento` 
                  : `$${selectedCouponData?.monto_descuento} de descuento`}
              </Typography>
            </Box>
            <Button
              startIcon={<Close />}
              variant="outlined"
              color="error"
              size="small"
              onClick={handleRemoverCupon}
              sx={{ textTransform: 'none' }}
            >
              Remover
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoReserva);
    toast.success('Código copiado al portapapeles');
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
                  Próximos pasos
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
                          {selectedCancha?.nombre}
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
                                {selectedCancha?.hora_apertura?.slice(0,5)} - {selectedCancha?.hora_cierre?.slice(0,5)}
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
                                ${selectedCancha?.precio_por_hora || 0}
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
                    {/* Cupones Disponibles */}
                    {renderCuponesDisponibles()}

                    <ReservationForm
                      reservationData={reservationData}
                      horariosDisponibles={horariosDisponibles}
                      selectedCoupon={selectedCoupon}
                      cupones={cuponesValidos}
                      selectedEspacio={selectedEspacio}
                      onReservationChange={onReservationChange}
                      onCouponChange={handleAplicarCupon}
                      isHorarioDisponible={isHorarioDisponible}
                      isHoraInicioValida={isHoraInicioValida}
                      isHoraFinValida={isHoraFinValida}
                      getHorasInicioDisponiblesList={getHorasInicioDisponiblesList}
                      getHorasFinDisponiblesList={getHorasFinDisponiblesList}
                    />

                    {/* Payment Summary */}
                    <Box sx={{ mt: 3 }}>
                      <PaymentSummary
                        calcularCostoBase={calcularCostoBase}
                        calcularDescuento={calcularDescuento}
                        calcularCostoTotal={calcularCostoTotal}
                        selectedCoupon={selectedCoupon}
                        selectedCouponData={selectedCouponData}
                        cupones={cuponesValidos}
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
                          <MuiCircularProgress size={24} color="inherit" />
                        ) : profile ? (
                          selectedCouponData ? '✅ Confirmar Reserva con Cupón' : '✅ Confirmar Reserva'
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