import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TextField, 
  Button, 
  Container, 
  Box, 
  Typography, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    clearError(); // Limpiar errores anteriores

    console.log('Enviando formulario de login...');
    
    const { error: authError } = await signIn(email, password);
    
    console.log('Resultado del login:', { authError });
    
    if (!authError) {
      console.log('Login exitoso, redirigiendo...');
      navigate('/dashboard');
    } else {
      console.log('Error en login:', authError);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={8} className="p-8 rounded-2xl backdrop-blur-lg bg-white/95">
            <Box className="text-center mb-8">
              <Typography variant="h3" className="font-title text-primary mb-2">
                ReservaDeportiva
              </Typography>
              <Typography variant="body1" className="text-gray-600 font-body">
                Inicia sesión en el sistema
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                className="mb-4"
                onClose={clearError}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                disabled={isLoading}
                error={!!error}
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

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                disabled={isLoading}
                error={!!error}
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                className="py-3 rounded-xl font-title text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                sx={{
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  },
                }}
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
            </form>

            <Box className="mt-6 text-center">
              <Typography variant="body2" className="text-gray-600 font-body">
                Sistema de gestión de reservas deportivas
              </Typography>
              <Typography variant="caption" className="text-gray-400 mt-2 block">
                Backend: http://127.0.0.1:8000
              </Typography>
            </Box>

            {/* Información de debug (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && (
              <Box className="mt-4 p-3 bg-gray-100 rounded-lg">
                <Typography variant="caption" className="text-gray-600">
                  <strong>Debug:</strong> {email ? `Email: ${email}` : 'Sin email'} | 
                  {password ? ` Contraseña: ${'*'.repeat(password.length)}` : ' Sin contraseña'}
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}