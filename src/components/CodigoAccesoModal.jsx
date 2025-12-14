import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  IconButton
} from '@mui/material';
import { QrCode, Person, Login, PersonAdd, Close, ContentCopy } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reservasApi } from '../api/reservas'; // ✅ Importar la API

export default function CodigoAccesoModal({ open, onClose }) {
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState(0);
  const [tipoRegistro, setTipoRegistro] = useState('visitante');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservaInfo, setReservaInfo] = useState(null); // ✅ Guardar info de la reserva
  
  const { profile } = useAuth();
  const navigate = useNavigate();

  const pasos = ['Ingresar Código', 'Elegir Método', 'Completar Registro'];

  const validarCodigo = async () => {
    if (!codigo.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // ✅ Usar la API en lugar de fetch directo
      const data = await reservasApi.getByCodigo(codigo.toUpperCase());
      
      // Verificar si hay cupo disponible
      const asistentesActuales = data.asistentes?.length || 0;
      const cuposDisponibles = data.cantidad_asistentes - (asistentesActuales + 1);
      
      if (cuposDisponibles <= 0) {
        setError('No hay cupo disponible en esta reserva');
        return;
      }
      
      // ✅ Guardar información de la reserva para mostrarla
      setReservaInfo({
        cancha: data.cancha?.nombre || 'Cancha no disponible',
        fecha: new Date(data.fecha_reserva).toLocaleDateString('es-ES'),
        horario: `${data.hora_inicio?.slice(0,5) || '--:--'} - ${data.hora_fin?.slice(0,5) || '--:--'}`,
        cuposDisponibles
      });
      
      setPaso(1);
    } catch (err) {
      console.error('Error validando código:', err);
      setError(err.response?.data?.detail || 'Código no válido o reserva no encontrada');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroVisitante = async () => {
    if (!nombre.trim() || !email.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await reservasApi.unirseConCodigo(codigo.toUpperCase(), { nombre, email });
      
      setSuccess('✅ Te has unido exitosamente a la reserva. Revisa tu email para obtener tu código QR.');
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } catch (err) {
      console.error('Error uniéndose a reserva:', err);
      setError(err.response?.data?.detail || 'Error al unirse a la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistroConCuenta = () => {
    if (profile) {
      // Si ya está logueado, intentar unirse directamente
      unirseDirectamente();
    } else {
      // Si no está logueado, ir a registro con código
      navigate('/register', { 
        state: { 
          codigoAcceso: codigo.toUpperCase(),
          returnTo: '/dashboard'
        } 
      });
      onClose();
    }
  };

  const unirseDirectamente = async () => {
    if (!profile) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await reservasApi.unirseConCodigo(codigo.toUpperCase(), {
        nombre: profile.nombre,
        email: profile.email
      });
      
      setSuccess('✅ Te has unido exitosamente a la reserva. Revisa tu email para obtener tu código QR.');
      
      setTimeout(() => {
        onClose();
        resetForm();
        navigate('/dashboard'); // Redirigir al dashboard
      }, 3000);
    } catch (err) {
      console.error('Error uniéndose directamente:', err);
      setError(err.response?.data?.detail || 'Error al unirse a la reserva');
      setLoading(false);
    }
  };

  const copiarCodigo = () => {
    if (codigo) {
      navigator.clipboard.writeText(codigo);
      toast.success('Código copiado al portapapeles');
    }
  };

  const resetForm = () => {
    setCodigo('');
    setPaso(0);
    setTipoRegistro('visitante');
    setNombre('');
    setEmail('');
    setError('');
    setSuccess('');
    setReservaInfo(null);
  };

  const renderPaso = () => {
    switch(paso) {
      case 0:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Ingresa el código que recibiste para unirte a una reserva.
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              label="Código de Acceso"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: RES-ABC123"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <QrCode sx={{ mr: 1, color: '#0f9fe1' }} />,
                endAdornment: codigo && (
                  <IconButton onClick={copiarCodigo} size="small">
                    <ContentCopy fontSize="small" />
                  </IconButton>
                )
              }}
            />
            
            <Button
              fullWidth
              variant="contained"
              onClick={validarCodigo}
              disabled={loading || !codigo.trim()}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Validar Código'}
            </Button>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            {/* ✅ Mostrar información de la reserva */}
            {reservaInfo && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  📋 Reserva encontrada:
                </Typography>
                <Typography variant="body2">
                  • Cancha: {reservaInfo.cancha}<br/>
                  • Fecha: {reservaInfo.fecha}<br/>
                  • Horario: {reservaInfo.horario}<br/>
                  • Cupos disponibles: {reservaInfo.cuposDisponibles}
                </Typography>
              </Alert>
            )}
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>⚠️ Importante:</strong> Si te registras como visitante, 
                perderás beneficios como historial de reservas y cupones.
              </Typography>
            </Alert>
            
            <RadioGroup value={tipoRegistro} onChange={(e) => setTipoRegistro(e.target.value)}>
              <FormControlLabel
                value="visitante"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAdd />
                    <Box>
                      <Typography>Registrarme como Visitante</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Solo necesitas nombre y email
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                value="cuenta"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Login />
                    <Box>
                      <Typography>{profile ? 'Unirme con mi cuenta' : 'Iniciar Sesión o Registrarme'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accede a todos los beneficios
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => setPaso(0)} fullWidth>
                Atrás
              </Button>
              <Button 
                variant="contained" 
                onClick={() => tipoRegistro === 'visitante' ? setPaso(2) : handleRegistroConCuenta()} 
                fullWidth
              >
                Continuar
              </Button>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Como visitante, solo recibirás el código QR para esta reserva específica.
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              label="Nombre Completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: '#0f9fe1' }} />,
              }}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: '#9eca3f' }} />,
              }}
              helperText="Recibirás tu código QR en este email"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => setPaso(1)} fullWidth>
                Atrás
              </Button>
              <Button 
                variant="contained" 
                onClick={handleRegistroVisitante}
                disabled={loading || !nombre.trim() || !email.trim()}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Registrarme'}
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => {
        resetForm();
        onClose();
      }}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode sx={{ color: '#0f9fe1' }} />
            <Typography variant="h6">Ingresar Código de Reserva</Typography>
          </Box>
          <IconButton onClick={() => { resetForm(); onClose(); }} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={paso} sx={{ mb: 3 }}>
          {pasos.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {renderPaso()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => { resetForm(); onClose(); }} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}