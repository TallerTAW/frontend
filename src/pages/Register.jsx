import { useState } from 'react';
import { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasenia: '',
    confirmarContrasenia: '',
    telefono: '',
    rol: 'cliente'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleRecaptchaChange = (token) => {
    console.log('reCAPTCHA token:', token ? '✅ Verificado' : '❌ No verificado');
    setRecaptchaVerified(!!token);
  };

  const handleRecaptchaExpire = () => {
    console.log('reCAPTCHA expirado');
    setRecaptchaVerified(false);
    setError('El reCAPTCHA ha expirado. Por favor, verifica nuevamente.');
  };

  const handleRecaptchaError = () => {
    console.error('Error en reCAPTCHA');
    setRecaptchaVerified(false);
    setError('Error en la verificación reCAPTCHA. Intenta nuevamente.');
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contrasenia) {
      setError('Todos los campos marcados con * son obligatorios');
      return false;
    }

    if (formData.contrasenia.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.contrasenia !== formData.confirmarContrasenia) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('El formato del email no es válido');
      return false;
    }

    if (!recaptchaVerified) {
      setError('Por favor, verifica que no eres un robot');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = recaptchaRef.current.getValue();
      
      if (!token) {
        throw new Error('No se pudo obtener el token reCAPTCHA');
      }

      console.log("Token reCAPTCHA obtenido:", token);

      console.log('Enviando datos de registro:', { 
        ...formData, 
        contrasenia: '***',
        confirmarContrasenia: '***',
        captcha_token: token
      });

      const { confirmarContrasenia, ...registerData } = formData;

      const response = await authApi.register({
        ...registerData,
        captcha_token: token  
      });

      console.log('Respuesta del registro:', response);

      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Error completo en registro:', error);

      let errorMessage = 'Error al registrar usuario';

      if (error.response) {
        const serverError = error.response.data;

        if (typeof serverError === 'string') {
          errorMessage = serverError;
        } else if (serverError?.detail) {
          errorMessage = typeof serverError.detail === 'string' 
            ? serverError.detail 
            : JSON.stringify(serverError.detail);
        } else if (serverError?.message) {
          errorMessage = serverError.message;
        } else {
          errorMessage = `Error del servidor: ${error.response.status}`;
        }

        if (error.response.status === 422) {
          errorMessage = 'Datos de formulario inválidos';
        } else if (error.response.status === 400) {
          if (errorMessage.includes('Captcha') || errorMessage.includes('captcha')) {
            errorMessage = 'Error de verificación reCAPTCHA. Por favor, verifica el reCAPTCHA nuevamente.';
          } else {
            errorMessage = 'Datos incorrectos o usuario ya existe';
          }
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        errorMessage = error.message || 'Error de configuración';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      recaptchaRef.current.reset();
      setRecaptchaVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={8} className="p-8 rounded-2xl backdrop-blur-lg bg-white/95">
            <Box className="text-center mb-8">
              <Typography variant="h3" className="font-title text-primary mb-2">
                OLYMPIAHUB
              </Typography>
              <Typography variant="h5" className="font-title text-secondary mb-2">
                Crear Cuenta
              </Typography>
              <Typography variant="body1" className="text-gray-600 font-body">
                Únete a nuestra comunidad deportiva
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre *"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#0f9fe1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0f9fe1',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido *"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#0f9fe1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0f9fe1',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#0f9fe1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0f9fe1',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#0f9fe1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0f9fe1',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Cuenta</InputLabel>
                    <Select
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      disabled={loading}
                      label="Tipo de Cuenta"
                    >
                      <MenuItem value="cliente">Cliente</MenuItem>
                      <MenuItem value="gestor">Gestor de Espacios</MenuItem>
                      <MenuItem value="control_acceso">Control de Acceso</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contraseña *"
                    name="contrasenia"
                    type="password"
                    value={formData.contrasenia}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    helperText="Mínimo 6 caracteres"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#0f9fe1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0f9fe1',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña *"
                    name="confirmarContrasenia"
                    type="password"
                    value={formData.confirmarContrasenia}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#0f9fe1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#0f9fe1',
                        },
                      },
                    }}
                  />
                </Grid>
                
                {/* ReCAPTCHA Visible */}
                <Grid item xs={12}>
                  <Box className="flex justify-center my-4">
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      ref={recaptchaRef}
                      onChange={handleRecaptchaChange}
                      onExpired={handleRecaptchaExpire}
                      onErrored={handleRecaptchaError}
                    />
                  </Box>
                  {recaptchaVerified && (
                    <Alert severity="success" className="mb-2">
                      reCAPTCHA verificado correctamente
                    </Alert>
                  )}
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !recaptchaVerified}
                className="mt-6 py-3 rounded-xl font-title text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                sx={{
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                    transform: 'none',
                  },
                }}
              >
                {loading ? (
                  <Box className="flex items-center gap-2">
                    <CircularProgress size={20} color="inherit" />
                    Creando cuenta...
                  </Box>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>

            <Box className="mt-6 text-center">
              <Typography variant="body2" className="text-gray-600 font-body">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-secondary font-bold transition-colors"
                  style={{ textDecoration: 'none' }}
                >
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>

            <Box className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Typography variant="caption" className="text-gray-500 block text-center">
                * Campos obligatorios
              </Typography>
              <Typography variant="caption" className="text-gray-500 block text-center mt-1">
                Al registrarte, aceptas nuestros términos y condiciones
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}