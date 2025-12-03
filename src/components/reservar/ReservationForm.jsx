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
} from '@mui/material';
import { 
  CalendarToday, 
  AccessTime, 
  People, 
  SportsTennis,
  Info,
  CheckCircle,
  Cancel,
  Warning
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
}) {
  const today = new Date().toISOString().split('T')[0];
  const [showCapacityInfo, setShowCapacityInfo] = useState(false);
  const [horarioDisponible, setHorarioDisponible] = useState(true);

  // Verificar si el horario está disponible
  useEffect(() => {
    if (reservationData.hora_inicio && reservationData.hora_fin) {
      const disponible = isHorarioDisponible();
      setHorarioDisponible(disponible);
    } else {
      setHorarioDisponible(true);
    }
  }, [reservationData.hora_inicio, reservationData.hora_fin, isHorarioDisponible]);

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

  const horasInicioDisponibles = getHorasInicioDisponiblesList();
  const horasFinDisponibles = reservationData.hora_inicio 
    ? getHorasFinDisponiblesList(reservationData.hora_inicio)
    : [];

  const isHoraInicioOk = reservationData.hora_inicio ? isHoraInicioValida(reservationData.hora_inicio) : true;
  const isHoraFinOk = reservationData.hora_fin ? isHoraFinValida(reservationData.hora_fin) : true;

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
          onChange={(e) => onReservationChange({
            ...reservationData,
            fecha_reserva: e.target.value,
            hora_inicio: '',
            hora_fin: ''
          })}
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

      {/* Cantidad de Asistentes */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#1a237e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <People sx={{ color: '#0f9fe1' }} />
            Cantidad de Asistentes
          </Typography>
          <Tooltip title={`Capacidad máxima: ${selectedEspacio?.capacidad || 100} personas`}>
            <IconButton 
              size="small" 
              onClick={() => setShowCapacityInfo(!showCapacityInfo)}
              sx={{ color: '#0f9fe1' }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
        
        {showCapacityInfo && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
            La capacidad máxima permitida es de {selectedEspacio?.capacidad || 100} personas
          </Alert>
        )}
        
        <TextField
          fullWidth
          type="number"
          value={reservationData.cantidad_asistentes || ''}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? '' : parseInt(value, 10);
            const maxCapacity = selectedEspacio?.capacidad || 100;
            
            if (value === '' || (!isNaN(numValue) && numValue > 0 && numValue <= maxCapacity)) {
              onReservationChange({
                ...reservationData,
                cantidad_asistentes: numValue === '' ? 1 : numValue
              });
            }
          }}
          inputProps={{ 
            min: 1, 
            max: selectedEspacio?.capacidad || 100,
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
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" color="text.secondary">
                  / {selectedEspacio?.capacidad || 100} máx.
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

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