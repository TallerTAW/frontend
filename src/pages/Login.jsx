import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Container, Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (!error) {
      navigate('/');
    }
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
                Inicia sesión para gestionar tus reservas
              </Typography>
            </Box>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
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
                disabled={loading}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 py-3 rounded-xl font-title text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                sx={{
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                  },
                }}
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <Box className="mt-6 text-center">
              <Typography variant="body2" className="text-gray-600 font-body">
                Sistema de gestión de reservas deportivas
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}
