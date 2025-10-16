import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography, 
  Paper, // Se puede cambiar por Box para mayor control del estilo
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const { signIn, error, clearError } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const handleRecaptchaChange = (token) => {
    setRecaptchaVerified(!!token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Por favor, completa email y contraseña');
      return;
    }

    if (!recaptchaVerified) {
      alert('Por favor, verifica que no eres un robot');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const token = recaptchaRef.current.getValue();
      if (!token) {
        throw new Error('No se pudo obtener el token reCAPTCHA');
      }

      console.log('Token de reCAPTCHA:', token);

      const { error: authError } = await signIn(email, password, token);
      if (!authError) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error en el login:', err);
      recaptchaRef.current.reset();
      setRecaptchaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // CAMBIOS DE DISEÑO INICIAN AQUÍ
  // ----------------------------------------------------------------------
  
  // Estilo del input según la imagen (color de fondo, sin borde visible)
  const inputStyle = {
    // Estilo base para el contenedor del input y el texto
    '& .MuiInputBase-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo semi-transparente
      color: 'white', // Texto blanco
      '& fieldset': {
        borderColor: 'transparent', // Sin borde visible
      },
      '&:hover fieldset': {
        borderColor: 'transparent !important', // Sin borde al pasar el ratón
      },
      '&.Mui-focused fieldset': {
        borderColor: 'transparent !important', // Sin borde al estar enfocado
      },
    },
    // Estilo para la etiqueta (Label)
    '& .MuiInputLabel-root': {
      color: 'white', // Etiqueta blanca
      '&.Mui-focused': {
        color: 'white', // Etiqueta blanca al enfocar
      }
    },
    // Icono (para simular el diseño de la imagen)
    '& .MuiInputAdornment-root': {
      color: 'white'
    }
  };


  return (
    // CAMBIO: Fondo con imagen de estadio (simulado con color y gradiente/imagen real en CSS si fuera necesario)
    // El fondo de la imagen original parece ser un estadio desenfocado.
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      // CAMBIO DE ESTILO PRINCIPAL: Usamos un fondo que simula el estadio desenfocado
      style={{
        backgroundImage: 'url("https://images.pexels.com/photos/15476801/pexels-photo-15476801.jpeg")', // Aquí iría la URL de la imagen de estadio
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1C3144', // Color de fallback
      }}
    >
      <Container maxWidth="xs"> {/* CAMBIO: Usamos 'xs' para un contenedor más estrecho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* CAMBIO: Usamos Box en lugar de Paper para un control de estilo más libre, 
             simulando la "caja" central del login */}
          <Box 
            elevation={0} // Sin elevación ya que no es un Paper
            // Estilos para el contenedor principal azul/turquesa de la imagen
            sx={{
              backgroundColor: '#1d5a73', // Fondo del contenedor principal
              borderRadius: '8px',
              overflow: 'hidden', // Para contener bien las secciones
              border: '2px solid #00BFFF', // Borde más claro simulado del diseño
            }}
          >
            {/* 1. SECCIÓN DE CABECERA (Azul Oscuro) */}
            <Box sx={{
              backgroundColor: '#103949', // Azul más oscuro para la cabecera
              padding: '20px 30px',
              textAlign: 'center',
            }}>
              <Typography 
                variant="h4" 
                sx={{
                  color: '#00BFFF', // Color azul brillante
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}
              >
                ReservaDeportiva
              </Typography>
              <Typography 
                variant="body1" 
                sx={{
                  color: 'white', // Texto blanco
                  fontWeight: '500'
                }}
              >
                Inicia sesión en el sistema
              </Typography>
            </Box>

            {/* 2. SECCIÓN DEL FORMULARIO Y ALERTA (Azul principal) */}
            <Box className="p-4" sx={{ padding: '20px 30px' }}>
              {error && (
                <Alert 
                  severity="error" 
                  className="mb-4"
                  onClose={clearError}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4"> {/* Reducimos el espaciado */}
                {/* Email Field */}
                <TextField
                  fullWidth
                  label="Email *" // Etiqueta con asterisco
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                  disabled={isLoading}
                  error={!!error}
                  sx={inputStyle} // Aplicamos el nuevo estilo
                  InputProps={{
                    // Simula el icono de la imagen
                    startAdornment: (
                      <Box component="span" sx={{ marginRight: 1, color: 'white' }}>📧</Box> 
                    ),
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  label="Contraseña *" // Etiqueta con asterisco
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  disabled={isLoading}
                  error={!!error}
                  sx={inputStyle} // Aplicamos el nuevo estilo
                  InputProps={{
                    // Simula el icono de la imagen
                    startAdornment: (
                      <Box component="span" sx={{ marginRight: 1, color: 'white' }}>🔒</Box> 
                    ),
                  }}
                />
                
                {/* ReCAPTCHA */}
                {/* NOTA: El componente ReCAPTCHA tiene un estilo fijo. 
                   La imagen lo muestra con fondo verde. Dejamos el componente
                   pero lo centramos. */}
                <Box className="flex justify-center pt-2 pb-2"> {/* Espaciado para centrar */}
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    ref={recaptchaRef}
                    onChange={handleRecaptchaChange}
                  />
                </Box>
                
                {/* Button - Se movió para que esté en una sección distinta en la imagen */}
                {/* El botón de la imagen es de color naranja. */}
              
              </form>
            </Box>
            
            {/* 3. SECCIÓN DEL BOTÓN (Naranja) */}
            <Box sx={{ 
                backgroundColor: '#FF6F00', // Naranja/anaranjado del botón
                padding: '0px 0px 0px 0px', // Quitamos padding para que ocupe todo el ancho de la caja
              }}
            >
                <Button
                    type="submit" // El submit handler está en el Box que contiene el botón
                    fullWidth
                    variant="contained"
                    disabled={isLoading || !recaptchaVerified}
                    // Estilos para simular el diseño del botón naranja
                    sx={{
                        backgroundColor: '#FF6F00',
                        color: 'white',
                        padding: '12px 20px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: '0', // Borde plano para que se mezcle con el Box
                        '&:hover': {
                          backgroundColor: '#E65100', // Naranja más oscuro al pasar el ratón
                        },
                        '&:disabled': {
                            backgroundColor: '#ccc',
                            color: '#666',
                        },
                    }}
                    // Se aplica la acción del formulario en este botón/sección.
                    onClick={handleSubmit} 
                >
                    {isLoading ? (
                        <Box className="flex items-center gap-2">
                            <CircularProgress size={20} color="inherit" />
                            Iniciando sesión...
                        </Box>
                    ) : (
                        'Iniciar Sesión'
                    )}
                </Button>
            </Box>

            {/* 4. SECCIÓN DE PIE DE PÁGINA (Azul Oscuro/Verde) */}
            <Box sx={{
                backgroundColor: '#103949', // Azul oscuro
                padding: '10px 30px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#90EE90', fontWeight: 'bold' }}> {/* Verde claro para el texto */}
                Sistema de gestión de reservas deportivas
              </Typography>
              <Typography variant="caption" sx={{ color: '#90EE90', display: 'block', marginTop: '2px' }}>
                Backend: http://127.0.0.1:8000
              </Typography>
            </Box>
            
            {/* 5. SECCIÓN DE DEBUG (Azul Oscuro/Verde) */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{
                backgroundColor: '#103949', // Mismo azul oscuro para el debug
                padding: '5px 30px',
                borderTop: '1px dashed #00BFFF' // Separador
              }}>
                <Typography variant="caption" sx={{ color: '#90EE90' }}>
                  <strong>Debug:</strong> {email ? `Email: ${email}` : 'Sin email'} | 
                  {password ? ` Contraseña: ${'*'.repeat(password.length)}` : ' Sin contraseña'} |
                  reCAPTCHA: {recaptchaVerified ? 'Verificado' : 'No verificado'}
                </Typography>
              </Box>
            )}

          </Box>
        </motion.div>
      </Container>
    </div>
  );
}