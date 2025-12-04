import { Button, Grid, Card, CardContent, Typography, Box, Divider, Chip, Alert, Paper } from '@mui/material';
import { ArrowBack, SportsSoccer, Stadium, People, Money, AccessTime, CalendarMonth, Groups, LocalOffer } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ReservationForm from './ReservationForm';
import PaymentSummary from './PaymentSummary';
import { useEffect, useState } from 'react';

export default function Step4Confirmacion({
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
  }, [reservationData.hora_inicio, reservationData.hora_fin, isHorarioDisponible]);

  // Validar asistentes
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('=== VALIDANDO ASISTENTES EN STEP4 ===');
      console.log('Cantidad asistentes en reservationData:', reservationData.cantidad_asistentes);
      console.log('Array de asistentes:', asistentes);
      console.log('Longitud array asistentes:', asistentes?.length);
      
      if (reservationData.cantidad_asistentes <= 1) {
        console.log('Solo 1 asistente, validación automática OK');
        setAsistentesValidos(true);
        return;
      }
      
      // Si no hay asistentes aún, marcar como inválidos
      if (!asistentes || asistentes.length === 0) {
        console.log('Error: Array de asistentes vacío');
        setAsistentesValidos(false);
        return;
      }
      
      // Verificar cantidad
      if (asistentes.length !== reservationData.cantidad_asistentes) {
        console.log('Error: Cantidad no coincide', {
          esperado: reservationData.cantidad_asistentes,
          obtenido: asistentes.length
        });
        setAsistentesValidos(false);
        return;
      }
      
      // Validar cada asistente
      const todosValidos = asistentes.every((asistente, index) => {
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
      
      console.log('Resultado validación asistentes:', todosValidos);
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
    horarioNoValido: !isHorarioDisponible() || !horarioDisponible,
    horasInvalidas: reservationData.hora_inicio && reservationData.hora_fin && 
                   parseInt(reservationData.hora_fin.split(':')[0]) <= parseInt(reservationData.hora_inicio.split(':')[0]),
    // SOLO validar asistentes si el usuario ha mostrado el formulario
    asistentesInvalidos: tieneMasDeUnAsistente && mostrarFormAsistentes && !asistentesValidos,
  };
  
  const deshabilitado = Object.values(condiciones).some(c => c);
  
  console.log('Condiciones botón:', {
    ...condiciones,
    tieneMasDeUnAsistente,
    mostrarFormAsistentes,
    asistentesValidos,
    deshabilitado
  });
  
  return deshabilitado;
};

  return (
    <Box>
      <Box className="flex items-center gap-4 mb-8">
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          variant="outlined"
          sx={{ 
            color: '#0f9fe1',
            borderColor: '#0f9fe1',
            fontWeight: 'bold',
            '&:hover': {
              borderColor: '#0d8dc7',
              backgroundColor: 'rgba(15, 159, 225, 0.08)'
            }
          }}
        >
          Volver
        </Button>
        <Typography variant="h4" className="font-bold" sx={{ color: '#1a237e' }}>
          Confirmar Reserva
        </Typography>
      </Box>

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
            ⚠️ Horas ocupadas en esta fecha: <strong>{occupiedHours.join(', ')}</strong>
          </Typography>
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Columna 1: Detalles de la Cancha */}
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="rounded-2xl shadow-xl overflow-hidden h-full" sx={{ border: 'none' }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 100%)', 
                p: 3,
                color: 'white'
              }}>
                <Typography variant="h5" className="font-bold">
                  <SportsSoccer sx={{ mr: 1.5, verticalAlign: 'middle', fontSize: 28 }} />
                  Detalles de la Cancha
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 4 }}>
                <Box className="space-y-4">
                  {/* Información Principal */}
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#0f9fe1', mb: 2, fontWeight: 'bold' }}>
                      {selectedCancha.nombre}
                    </Typography>
                    
                    <Box className="space-y-3">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Stadium sx={{ color: '#9eca3f', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Espacio Deportivo
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedEspacio?.nombre}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <People sx={{ color: '#0f9fe1', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Disciplina
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedDisciplina?.nombre}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AccessTime sx={{ color: '#ff9800', fontSize: 22 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Horario Operativo
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedCancha.hora_apertura.slice(0,5)} - {selectedCancha.hora_cierre.slice(0,5)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Precio y Capacidad */}
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #e1f5fe' }}>
                    <Typography variant="subtitle1" sx={{ color: '#1a237e', mb: 2, fontWeight: 'bold' }}>
                      Información de Tarifas
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                          <Money sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
                          <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                            ${selectedCancha.precio_por_hora}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            por hora
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                          <Groups sx={{ fontSize: 32, color: '#0f9fe1', mb: 1 }} />
                          <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                            {selectedEspacio?.capacidad}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            capacidad máxima
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Estado de la Cancha */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Chip
                      label="DISPONIBLE"
                      color="success"
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
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
            <Card className="rounded-2xl shadow-xl overflow-hidden" sx={{ border: 'none' }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', 
                p: 3,
                color: 'white'
              }}>
                <Typography variant="h5" className="font-bold">
                  <CalendarMonth sx={{ mr: 1.5, verticalAlign: 'middle', fontSize: 28 }} />
                  Información de la Reserva
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 4 }}>
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
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mt: 3, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 2,
                    borderLeft: '4px solid #0f9fe1'
                  }}>
                    <Typography variant="subtitle1" sx={{ color: '#1a237e', mb: 1, fontWeight: 'bold' }}>
                      Resumen del Horario
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Inicio:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reservationData.hora_inicio}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Fin:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {reservationData.hora_fin}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Duración total:
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#0f9fe1', fontWeight: 'bold' }}>
                          {totalHours} hora{totalHours !== 1 ? 's' : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Cupones */}
                {cupones.length > 0 && (
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    mt: 3, 
                    bgcolor: '#fff8e1', 
                    borderRadius: 2,
                    border: '1px dashed #ffd54f'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalOffer sx={{ color: '#ff9800', mr: 1.5 }} />
                      <Typography variant="subtitle1" sx={{ color: '#5d4037', fontWeight: 'bold' }}>
                        Cupones Disponibles
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Tienes {cupones.length} cupón{cupones.length !== 1 ? 'es' : ''} disponible{cupones.length !== 1 ? 's' : ''} para aplicar
                    </Typography>
                  </Paper>
                )}

                <PaymentSummary
                  calcularCostoTotal={calcularCostoTotal}
                  selectedCoupon={selectedCoupon}
                  totalHours={totalHours}
                />

                {/* Validación de asistentes - MOSTRAR SOLO SI HAY MÁS DE 1 ASISTENTE */}
                {reservationData.cantidad_asistentes > 1 && (
                  <>
                    {!asistentesValidos && (
                      <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          ❌ Por favor completa la información de todos los asistentes antes de confirmar.
                          {asistentes?.length > 0 && (
                            <>
                              <br/>
                              <small>
                                {asistentes.filter(a => a && a.nombre && a.email && 
                                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())).length} 
                                de {reservationData.cantidad_asistentes} completados correctamente
                              </small>
                            </>
                          )}
                        </Typography>
                      </Alert>
                    )}
                    
                    {asistentesValidos && asistentes?.length > 0 && (
                      <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="medium">
                          ✅ Todos los asistentes tienen información válida
                        </Typography>
                      </Alert>
                    )}
                  </>
                )}

                <Box className="mt-8">
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
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      py: 2.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {profile ? '✅ Confirmar Reserva y Pagar' : '🔑 Iniciar Sesión para Reservar'}
                  </Button>

                  {!isHorarioDisponible() && reservationData.hora_inicio && reservationData.hora_fin && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 3, 
                        borderRadius: 2,
                        backgroundColor: '#ffebee',
                        border: '1px solid #ffcdd2'
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        ❌ El horario seleccionado ({reservationData.hora_inicio} - {reservationData.hora_fin}) 
                        no está disponible. Por favor, seleccione otro horario.
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