import { useState, useRef } from 'react';
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

      // En handleSubmit, después del registro exitoso:
      toast.success('¡Registro exitoso! Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por email cuando sea activada.');
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

  // ----------------------------------------------------------------------
  // CAMBIOS DE DISEÑO INICIAN AQUÍ
  // ----------------------------------------------------------------------
  
  // Estilo para los campos de texto oscuros
  const darkInputStyle = {
    // Estilo base para el contenedor del input
    '& .MuiInputBase-root': {
      backgroundColor: '#1c364f', // Fondo azul oscuro
      color: 'white', // Texto blanco
      borderRadius: '4px',
      // Estilo para el input en sí (texto)
      '& input': {
          color: 'white',
      },
      '& fieldset': {
        borderColor: 'transparent', // Sin borde visible
      },
      '&:hover fieldset': {
        borderColor: '#00BFFF !important', // Borde azul claro al pasar el ratón
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00BFFF !important', // Borde azul claro al estar enfocado
      },
    },
    // Estilo para la etiqueta (Label)
    '& .MuiInputLabel-root': {
      color: 'white', // Etiqueta blanca
      fontWeight: 'bold',
      '&.Mui-focused': {
        color: '#00BFFF', // Etiqueta azul claro al enfocar
      }
    },
    // Estilo para el helper text
    '& .MuiFormHelperText-root': {
        color: 'white !important', // Texto de ayuda blanco
    },
  };

  // Estilo para el Select (Tipo de Cuenta)
  const darkSelectStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#1c364f', // Fondo azul oscuro
      color: 'white', // Texto blanco
      '& .MuiSelect-select': {
        color: 'white',
      },
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: '#00BFFF !important',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00BFFF !important',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#1d5a73',
      fontWeight: 'bold',
      '&.Mui-focused': {
        color: '#00BFFF',
      }
    },
    '& .MuiSvgIcon-root': { // Icono de flecha del Select
        color: 'white',
    }
  };
  
  // Estilo para el campo de Email, que es blanco en la imagen
  const lightInputStyle = {
    // Estilo base para el contenedor del input
    '& .MuiInputBase-root': {
      backgroundColor: 'white', // Fondo blanco
      color: 'black', // Texto negro
      borderRadius: '4px',
      '& input': {
          color: 'black',
      },
      '& fieldset': {
        borderColor: '#ccc', // Borde gris suave
      },
      '&:hover fieldset': {
        borderColor: '#00BFFF !important', 
      },
      '&.Mui-focused fieldset': {
        borderColor: '#00BFFF !important', 
      },
    },
    // Estilo para la etiqueta (Label)
    '& .MuiInputLabel-root': {
      color: 'black', // Etiqueta negra
      fontWeight: 'normal',
      '&.Mui-focused': {
        color: '#00BFFF', // Etiqueta azul claro al enfocar
      }
    },
  };

  return (
    // CAMBIO: Fondo con imagen de estadio (simulado)
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("https://images.pexels.com/photos/15476801/pexels-photo-15476801.jpeg")', // Placeholder para la imagen de estadio
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1C3144', // Color de fallback
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* CAMBIO: Contenedor principal blanco con borde azul claro */}
          <Paper 
            elevation={8} 
            sx={{
                padding: '30px 40px', // Aumentar padding
                borderRadius: '8px',
                backgroundColor: '#226079d4', // Fondo blanco
                border: '3px solid #00BFFF' // Borde azul brillante
            }}
          >
     
            {/* CABECERA */}
            <Box className="text-center mb-6">
              <Typography 
                variant="h3" 
                sx={{ color: '#00BFFF', fontWeight: 'bold' }} // Azul brillante
              >
                OLYMPIAHUB
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ color: '#333', fontWeight: 'normal' }} // Color de texto normal
              >
                Crear Cuenta
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ color: '#666' }}
              >
                Únete a nuestra comunidad deportiva
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}> {/* Espaciado más reducido */}
                {/* Nombre */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Nombre **" // Doble asterisco para coincidir con la imagen
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={darkInputStyle} // Estilo oscuro
                    InputProps={{
                        endAdornment: (
                            <Box component="span" sx={{ color: 'white' }}>👤</Box> // Icono
                        ),
                    }}
                  />
                </Grid>
                {/* Apellido */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Apellido **" // Doble asterisco
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={darkInputStyle} // Estilo oscuro
                    InputProps={{
                        endAdornment: (
                            <Box component="span" sx={{ color: 'white' }}>👥</Box> // Icono
                        ),
                    }}
                  />
                </Grid>
                {/* Email (Campo Blanco en la imagen) */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Email **" // Doble asterisco
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={lightInputStyle} // Estilo claro
                  />
                </Grid>
                
                {/* Teléfono */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={loading}
                    sx={darkInputStyle} // Estilo oscuro
                    InputProps={{
                        endAdornment: (
                            <Box component="span" sx={{ color: 'white' }}>📞</Box> // Icono
                        ),
                    }}
                  />
                </Grid>
                
                {/* Tipo de Cuenta (Select) */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth sx={darkSelectStyle}> {/* Estilo oscuro */}
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

                {/* Contraseña */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contraseña **" // Doble asterisco
                    name="contrasenia"
                    type="password"
                    value={formData.contrasenia}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    helperText="Mínimo 6 caracteres"
                    sx={darkInputStyle} // Estilo oscuro
                    InputProps={{
                        endAdornment: (
                            <Box component="span" sx={{ color: 'white' }}>$</Box> // Icono
                        ),
                    }}
                  />
                </Grid>

                {/* Confirmar Contraseña (Ancho completo para seguir el flujo visual de la imagen) */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña **" // Doble asterisco
                    name="confirmarContrasenia"
                    type="password"
                    value={formData.confirmarContrasenia}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    sx={darkInputStyle} // Estilo oscuro
                  />
                </Grid>
                
                {/* ReCAPTCHA Visible (Centrado) */}
                <Grid item xs={12}>
                  <Box className="flex justify-center my-4">
                    <ReCAPTCHA
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      ref={recaptchaRef}
                      onChange={handleRecaptchaChange}
                      onExpired={handleRecaptchaExpire}
                      onErrored={handleRecaptchaError}
                      // CAMBIO: Agregar estilo para simular el 'No soy un robot' con fondo verde claro
                      sx={{ '& > div': { border: '2px solid #9eca3f', backgroundColor: '#e6ffe6' } }}
                    />
                  </Box>
                  {recaptchaVerified && (
                    <Alert severity="success" className="mb-2">
                      reCAPTCHA verificado correctamente
                    </Alert>
                  )}
                </Grid>
              </Grid>

              {/* Botón */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !recaptchaVerified}
                // CAMBIO: Color y estilo del botón (Azul sólido en la imagen)
                sx={{
                  mt: 3, // Margen superior para separarlo del ReCAPTCHA
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  padding: '12px 20px',
                  backgroundColor: '#1c364f', // Azul sólido
                  '&:hover': {
                    backgroundColor: '#102436', // Azul más oscuro al hover
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
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

            {/* SECCIÓN DE PIE DE PÁGINA */}
            <Box className="mt-4 text-center">
              <Typography variant="body2" className="text-gray-600 font-body">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  // CAMBIO: Color del link (Azul oscuro principal)
                  style={{ 
                    textDecoration: 'none', 
                    color: '#1c364f', 
                    fontWeight: 'bold',
                    transition: 'color 0.3s' 
                  }}
                >
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>

            <Box className="mt-2 p-2 rounded-lg">
              <Typography 
                variant="caption" 
                className="text-gray-500 block text-center"
                sx={{ color: '#1c364f', fontWeight: 'bold' }} // Color azul
              >
                ** Campos obligatorios
              </Typography>
              <Typography 
                variant="caption" 
                className="text-gray-500 block text-center mt-1"
                sx={{ color: '#666' }} // Color más suave para el texto legal
              >
                Al registrarte, aceptas nuestros términos y condiciones
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}