import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormHelperText,
  Paper,
  InputAdornment,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  Button,
} from '@mui/material';
import { 
  CalendarToday, 
  AccessTime, 
  People, 
  SportsTennis,
  Info,
  CheckCircle,
  Cancel,
  Warning,
  Email,
  PersonAdd,
  Person,
  AddCircle,
  RemoveCircle,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

export default function ReservationForm({
  reservationData,
  horariosDisponibles,
  selectedCoupon,
  cupones,
  selectedEspacio,
  onReservationChange,
  onCouponChange,
  isHorarioDisponible,
  isHoraInicioValida,
  isHoraFinValida,
  getHorasInicioDisponiblesList,
  getHorasFinDisponiblesList,
  onAsistentesChange,
}) {
  const today = new Date().toISOString().split('T')[0];
  const [showCapacityInfo, setShowCapacityInfo] = useState(false);
  const [horarioDisponible, setHorarioDisponible] = useState(true);
  const [asistentes, setAsistentes] = useState([]);
  const [showAsistentesForm, setShowAsistentesForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Validar email
  const isValidEmail = (email) => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Inicializar asistentes
  useEffect(() => {
  const cantidad = reservationData.cantidad_asistentes || 1;
  
  // Si la cantidad cambió, ajustar el array de asistentes
  if (asistentes.length !== cantidad) {
    const newAsistentes = [];
    
    for (let i = 0; i < cantidad; i++) {
      // Mantener datos existentes si los hay
      newAsistentes[i] = asistentes[i] || { 
        nombre: '', 
        email: '',
        id: i + 1
      };
    }
    
    console.log('Inicializando asistentes:', { cantidad, newAsistentes });
    setAsistentes(newAsistentes);
    
    // Solo notificar al padre si hay más de 1 asistente
    if (cantidad > 1 && onAsistentesChange) {
      setTimeout(() => {
        onAsistentesChange(newAsistentes);
      }, 100);
    }
  }
  
  console.log('Asistentes inicializados:', {
    cantidad,
    asistentesLength: asistentes.length,
    asistentes
  });
}, [reservationData.cantidad_asistentes]);

  // Notificar cambios en asistentes al padre
  useEffect(() => {
  if (reservationData.cantidad_asistentes > 1) {
    // Notificar al padre con el array actual
    if (onAsistentesChange) {
      onAsistentesChange(asistentes);
    }
  }
  
  // Validar y actualizar errores
  const errors = {};
  asistentes.forEach((asistente, index) => {
    if (asistente && asistente.email && asistente.email.trim() !== '') {
      if (!isValidEmail(asistente.email)) {
        errors[`email_${index}`] = true; // Cambia a booleano, no string
      }
    }
  });
  setValidationErrors(errors);
  
  console.log('Asistentes actualizados:', {
    cantidadAsistentes: reservationData.cantidad_asistentes,
    asistentesLength: asistentes.length,
    asistentes,
    errors
  });
}, [asistentes, reservationData.cantidad_asistentes]);

  // Verificar si el horario está disponible
  useEffect(() => {
    if (reservationData.hora_inicio && reservationData.hora_fin) {
      const disponible = isHorarioDisponible();
      setHorarioDisponible(disponible);
    } else {
      setHorarioDisponible(true);
    }
  }, [reservationData.hora_inicio, reservationData.hora_fin, isHorarioDisponible]);

  const allAsistentesValid = () => {
  if (reservationData.cantidad_asistentes <= 1) {
    return true;
  }
  
  console.log('=== VALIDANDO ASISTENTES EN FORMULARIO ===');
  console.log('Cantidad esperada:', reservationData.cantidad_asistentes);
  console.log('Cantidad en array:', asistentes.length);
  console.log('Asistentes:', asistentes);
  
  if (asistentes.length !== reservationData.cantidad_asistentes) {
    console.log('Error: Cantidad no coincide');
    return false;
  }
  
  const todosValidos = asistentes.every((asistente, index) => {
    if (!asistente) {
      console.log(`Asistente ${index + 1} no definido`);
      return false;
    }
    
    const nombreValido = asistente.nombre && asistente.nombre.trim() !== '';
    const emailValido = isValidEmail(asistente.email);
    
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
  
  console.log('Resultado validación formulario:', todosValidos);
  return todosValidos;
};

  const handleHoraInicioChange = (horaInicio) => {
    onReservationChange({
      ...reservationData,
      hora_inicio: horaInicio,
      hora_fin: ''
    });
  };

  const handleHoraFinChange = (horaFin) => {
    onReservationChange({
      ...reservationData,
      hora_fin: horaFin
    });
  };

  const handleClearHours = () => {
    onReservationChange({
      ...reservationData,
      hora_inicio: '',
      hora_fin: ''
    });
  };

  const handleAsistenteChange = (index, field, value) => {
    const newAsistentes = [...asistentes];
    newAsistentes[index] = {
      ...newAsistentes[index],
      [field]: value
    };
    setAsistentes(newAsistentes);
  };

  const addAsistente = () => {
    const cantidadActual = reservationData.cantidad_asistentes || 1;
    const maxCapacity = selectedEspacio?.capacidad || 100;
    
    if (cantidadActual < maxCapacity) {
      onReservationChange({
        ...reservationData,
        cantidad_asistentes: cantidadActual + 1
      });
    }
  };

  const removeAsistente = () => {
    const cantidadActual = reservationData.cantidad_asistentes || 1;
    if (cantidadActual > 1) {
      onReservationChange({
        ...reservationData,
        cantidad_asistentes: cantidadActual - 1
      });
    }
  };

  const horasInicioDisponibles = getHorasInicioDisponiblesList();
  const horasFinDisponibles = reservationData.hora_inicio 
    ? getHorasFinDisponiblesList(reservationData.hora_inicio)
    : [];

  const isHoraInicioOk = reservationData.hora_inicio ? isHoraInicioValida(reservationData.hora_inicio) : true;
  const isHoraFinOk = reservationData.hora_fin ? isHoraFinValida(reservationData.hora_fin) : true;

  const maxCapacity = selectedEspacio?.capacidad || 100;
  const tieneMasDeUnAsistente = (reservationData.cantidad_asistentes || 1) > 1;

  return (
    <Box className="space-y-6">
      {/* Fecha */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#1a237e', mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ color: '#0f9fe1' }} />
          Selecciona la Fecha
        </Typography>
        <TextField
          fullWidth
          type="date"
          value={reservationData.fecha_reserva}
          onChange={(e) => {
            onReservationChange({
              ...reservationData,
              fecha_reserva: e.target.value,
              hora_inicio: '',
              hora_fin: ''
            });
            // Limpiar asistentes al cambiar fecha
            if (asistentes.length > 0) {
              setAsistentes([]);
            }
          }}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          required
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover fieldset': {
                borderColor: '#0f9fe1',
              },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday sx={{ color: '#0f9fe1' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Horarios */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#1a237e', mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime sx={{ color: '#0f9fe1' }} />
          Selecciona el Horario
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!(reservationData.hora_inicio && !isHoraInicioOk)}>
              <InputLabel sx={{ fontWeight: 'medium' }}>
                Hora de inicio
              </InputLabel>
              <Select
                value={reservationData.hora_inicio}
                onChange={(e) => handleHoraInicioChange(e.target.value)}
                label="Hora de inicio"
                disabled={!reservationData.fecha_reserva || horasInicioDisponibles.length === 0}
                variant="outlined"
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTime sx={{ 
                      color: reservationData.hora_inicio && isHoraInicioOk ? '#4caf50' : '#f44336', 
                      ml: 1 
                    }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Seleccionar hora</MenuItem>
                {horasInicioDisponibles.map((hora) => (
                  <MenuItem 
                    key={hora} 
                    value={hora}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{hora}</span>
                    <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                  </MenuItem>
                ))}
              </Select>
              {reservationData.hora_inicio && !isHoraInicioOk && (
                <FormHelperText error sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Cancel sx={{ fontSize: 16 }} />
                  Esta hora no está disponible para iniciar una reserva
                </FormHelperText>
              )}
              {horasInicioDisponibles.length === 0 && reservationData.fecha_reserva && (
                <Alert severity="info" sx={{ mt: 1, borderRadius: 1 }}>
                  No hay horas disponibles para esta fecha
                </Alert>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!(reservationData.hora_fin && !isHoraFinOk)}>
              <InputLabel sx={{ fontWeight: 'medium' }}>
                Hora de fin
              </InputLabel>
              <Select
                value={reservationData.hora_fin}
                onChange={(e) => handleHoraFinChange(e.target.value)}
                label="Hora de fin"
                disabled={!reservationData.hora_inicio || horasFinDisponibles.length === 0}
                variant="outlined"
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTime sx={{ 
                      color: reservationData.hora_fin && isHoraFinOk ? '#4caf50' : '#f44336', 
                      ml: 1 
                    }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Seleccionar hora</MenuItem>
                {horasFinDisponibles.map((hora) => {
                  const horaNum = parseInt(hora.split(':')[0]);
                  const inicioNum = parseInt(reservationData.hora_inicio.split(':')[0]);
                  
                  if (horaNum > inicioNum) {
                    return (
                      <MenuItem 
                        key={hora} 
                        value={hora}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{hora}</span>
                        <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                      </MenuItem>
                    );
                  }
                  return null;
                })}
              </Select>
              {reservationData.hora_fin && !isHoraFinOk && (
                <FormHelperText error sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Cancel sx={{ fontSize: 16 }} />
                  Esta hora no está disponible para terminar una reserva
                </FormHelperText>
              )}
              {horasFinDisponibles.length === 0 && reservationData.hora_inicio && (
                <Alert severity="info" sx={{ mt: 1, borderRadius: 1 }}>
                  No hay horas disponibles después de la hora seleccionada
                </Alert>
              )}
            </FormControl>
          </Grid>
        </Grid>

        {/* Estado del horario - Versión compacta */}
        <Collapse in={!!(reservationData.hora_inicio && reservationData.hora_fin)}>
          <Box sx={{ mt: 2 }}>
            <Chip
              label={horarioDisponible 
                ? `✅ El horario ${reservationData.hora_inicio} - ${reservationData.hora_fin} está disponible` 
                : `❌ El horario ${reservationData.hora_inicio} - ${reservationData.hora_fin} no está disponible`}
              color={horarioDisponible ? "success" : "error"}
              icon={horarioDisponible ? <CheckCircle /> : <Warning />}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 'medium',
                borderRadius: 1,
                backgroundColor: horarioDisponible ? '#e8f5e9' : '#ffebee',
                color: horarioDisponible ? '#2e7d32' : '#c62828',
                border: `1px solid ${horarioDisponible ? '#c8e6c9' : '#ffcdd2'}`,
                '& .MuiChip-icon': {
                  fontSize: '1.2rem',
                  ml: 0.5
                }
              }}
              onDelete={!horarioDisponible ? handleClearHours : undefined}
              deleteIcon={!horarioDisponible ? <Cancel /> : undefined}
            />
            
            {!horarioDisponible && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', ml: 1 }}>
                Haz clic en la X para limpiar y seleccionar otro horario
              </Typography>
            )}
          </Box>
        </Collapse>
      </Paper>

      {/* Cantidad de Asistentes y Controles */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#1a237e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <People sx={{ color: '#0f9fe1' }} />
            Cantidad de Asistentes
            <Chip 
              label={`${reservationData.cantidad_asistentes || 1}/${maxCapacity}`} 
              size="small" 
              color="primary"
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={`Capacidad máxima: ${maxCapacity} personas`}>
              <IconButton 
                size="small" 
                onClick={() => setShowCapacityInfo(!showCapacityInfo)}
                sx={{ color: '#0f9fe1' }}
              >
                <Info />
              </IconButton>
            </Tooltip>
            
            <IconButton
              size="small"
              onClick={removeAsistente}
              disabled={(reservationData.cantidad_asistentes || 1) <= 1}
              sx={{ 
                color: (reservationData.cantidad_asistentes || 1) > 1 ? '#f44336' : '#ccc',
                '&:hover': {
                  backgroundColor: (reservationData.cantidad_asistentes || 1) > 1 ? '#ffebee' : 'transparent'
                }
              }}
            >
              <RemoveCircle />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={addAsistente}
              disabled={(reservationData.cantidad_asistentes || 1) >= maxCapacity}
              sx={{ 
                color: (reservationData.cantidad_asistentes || 1) < maxCapacity ? '#4caf50' : '#ccc',
                '&:hover': {
                  backgroundColor: (reservationData.cantidad_asistentes || 1) < maxCapacity ? '#e8f5e9' : 'transparent'
                }
              }}
            >
              <AddCircle />
            </IconButton>
          </Box>
        </Box>
        
        {showCapacityInfo && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
            La capacidad máxima permitida es de {maxCapacity} personas
          </Alert>
        )}
        
        <TextField
          fullWidth
          type="number"
          value={reservationData.cantidad_asistentes || 1}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? 1 : parseInt(value, 10);
            
            if (!isNaN(numValue) && numValue > 0 && numValue <= maxCapacity) {
              onReservationChange({
                ...reservationData,
                cantidad_asistentes: numValue
              });
              
              // Si se redujo a 1, limpiar el formulario de asistentes
              if (numValue <= 1) {
                setShowAsistentesForm(false);
              }
            }
          }}
          inputProps={{ 
            min: 1, 
            max: maxCapacity,
            style: { textAlign: 'center' }
          }}
          required
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <People sx={{ color: '#0f9fe1' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Mostrar opción para completar datos solo si hay más de 1 asistente */}
        {tieneMasDeUnAsistente && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAsistentesForm(!showAsistentesForm)}
              sx={{ 
                color: '#0f9fe1',
                borderColor: '#0f9fe1',
                '&:hover': {
                  borderColor: '#0d8dc7',
                  backgroundColor: 'rgba(15, 159, 225, 0.04)'
                }
              }}
              startIcon={showAsistentesForm ? <ExpandLess /> : <ExpandMore />}
            >
              {showAsistentesForm ? 'Ocultar datos de asistentes' : 'Completar datos de asistentes'}
            </Button>
            
            {allAsistentesValid() && (
              <Chip
                label="✅ Todos los datos completos"
                color="success"
                size="small"
                sx={{ fontWeight: 'medium' }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Formulario de Asistentes (solo se muestra si hay más de 1 asistente) */}
      <Collapse in={showAsistentesForm && tieneMasDeUnAsistente}>
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ 
            color: '#2e7d32', 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            <PersonAdd sx={{ color: '#4caf50' }} />
            Información de Asistentes ({reservationData.cantidad_asistentes || 1})
          </Typography>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Cada asistente recibirá un código QR personal por email para acceder a la cancha.
          </Alert>

          {!allAsistentesValid() && asistentes.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              ⚠️ Por favor completa todos los campos de los asistentes
            </Alert>
          )}

          <Grid container spacing={3}>
            {asistentes.map((asistente, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ 
                  p: 2.5, 
                  borderRadius: 2,
                  backgroundColor: 'white',
                  border: '1px solid #c8e6c9',
                  position: 'relative',
                  mt: 2.5,
                  pt: 3.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Chip 
                    label={`Asistente ${index + 1}`}
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: -12,
                      left: 16,
                      backgroundColor: '#0f9fe1',
                      color: 'white',
                      fontWeight: 'bold',
                      height: 24,
                      fontSize: '0.75rem',
                      '& .MuiChip-label': {
                        px: 1.5,
                        py: 0.5
                      }
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nombre completo"
                        value={asistente.nombre}
                        onChange={(e) => handleAsistenteChange(index, 'nombre', e.target.value)}
                        required
                        variant="outlined"
                        size="medium"
                        error={!asistente.nombre && asistente.nombre !== ''}
                        helperText={!asistente.nombre && asistente.nombre !== '' ? 'Nombre requerido' : ''}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fafafa',
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <Person sx={{ color: '#0f9fe1', mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={asistente.email}
                        onChange={(e) => handleAsistenteChange(index, 'email', e.target.value)}
                        required
                        variant="outlined"
                        size="medium"
                        error={!!validationErrors[`email_${index}`]}
                        helperText={
                          validationErrors[`email_${index}`] 
                            ? 'Email inválido' 
                            : !asistente.email && asistente.email !== ''
                            ? 'Email requerido'
                            : 'Recibirá el código QR aquí'
                        }
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#fafafa',
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <Email sx={{ color: '#9eca3f', mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#c8e6c9', borderRadius: 2 }}>
            <Typography variant="body2" color="#2e7d32" sx={{ fontWeight: 'medium', mb: 1 }}>
              ℹ️ Información importante:
            </Typography>
            <Typography variant="body2" color="#2e7d32">
              • Cada asistente recibirá un email con código QR personal<br/>
              • El QR es válido solo para la fecha y hora de la reserva<br/>
              • Presentar el QR al personal de control de acceso<br/>
              • Los códigos son de un solo uso
            </Typography>
          </Box>
        </Paper>
      </Collapse>

      {/* Material Prestado */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#1a237e', mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsTennis sx={{ color: '#0f9fe1' }} />
          Material Prestado (Opcional)
        </Typography>
        <TextField
          fullWidth
          value={reservationData.material_prestado}
          onChange={(e) => onReservationChange({
            ...reservationData,
            material_prestado: e.target.value
          })}
          placeholder="Ej: Balones, redes, conos, etc."
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Especifica si necesitas material adicional para tu actividad
        </Typography>
      </Paper>
    </Box>
  );
}