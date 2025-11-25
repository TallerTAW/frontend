// 📍 ARCHIVO: src/pages/Reservations.jsx (ACTUALIZADO)

import { useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Grid, Chip, Button } from '@mui/material';
import { CalendarMonth, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUserRatings } from '../hooks/useUserRatings'; // Importar el nuevo hook
import { useNavigate } from 'react-router-dom'; // Para la redirección

// Paleta de colores (Para mantener consistencia con Ratings.jsx)
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';

// Helper para iconos (copiado de Ratings.jsx)
const getSportIcon = (canchaTipo) => {
  const icons = {
    'Fútbol': '⚽',
    'Básquetbol': '🏀',
    'Tenis': '🎾',
    'Vóleibol': '🏐',
    'Rugby': '🏉',
    'Béisbol': '⚾',
    'Hockey': '🏒',
    'Ping Pong': '🏓',
    'Boxeo': '🥊',
    'Billar': '🎱',
    'Natación': '🏊',
    'Atletismo': '🏃'
  };
  return icons[canchaTipo] || '🏆';
};

export default function Reservations() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // USAMOS EL HOOK PARA OBTENER LAS RESERVAS PENDIENTES
  const { 
    reservasPendientes, 
    loadingReservas,
    fetchReservasPendientes // Para actualizar si es necesario
  } = useUserRatings();
  
  // Opcional: Recargar al montar, aunque el hook ya lo hace
  useEffect(() => {
    if (profile && profile.rol !== 'admin') {
      fetchReservasPendientes();
    }
  }, [profile, fetchReservasPendientes]);


  const redirectToRatings = () => {
    navigate('/ratings'); // Asumiendo que /ratings es la ruta para Ratings.jsx
  };


  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-2">
          {profile?.rol === 'cliente' ? 'Mis Reservas' : 'Gestión de Reservas'}
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6 font-body">
          {profile?.rol === 'cliente' 
            ? 'Consulta y gestiona tus reservas' 
            : 'Administra todas las reservas del sistema'
          }
        </Typography>
      </motion.div>

      {/* NUEVA SECCIÓN: Reservas Pendientes de Calificar */}
      {profile?.rol === 'cliente' && (
        <Card className="rounded-2xl shadow-lg p-6 mb-6" sx={{ border: `2px solid ${COLOR_NARANJA_VIBRANTE}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_NARANJA_VIBRANTE }}>
                Reservas Pendientes de Calificar ({reservasPendientes.length})
              </Typography>
              <Button
                variant="text"
                onClick={redirectToRatings}
                sx={{ color: COLOR_NARANJA_VIBRANTE, fontWeight: 'bold' }}
              >
                Ir a Calificar
              </Button>
            </Box>
            
            {loadingReservas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : reservasPendientes.length > 0 ? (
              <Grid container spacing={2}>
                {/* Mostramos solo una vista previa de 3 o 4 */}
                {reservasPendientes.slice(0, 3).map((reserva) => (
                  <Grid item xs={12} md={4} key={reserva.id_reserva}>
                    <Card 
                      onClick={redirectToRatings}
                      sx={{ 
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: 'warning.light', // Color para destacar
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: 'warning.main', color: 'white' }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ color: COLOR_BLANCO }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {reserva.cancha?.nombre || `Cancha ${reserva.id_cancha}`}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}
                        </Typography>
                        <Chip 
                          label="PENDIENTE" 
                          size="small" 
                          sx={{ 
                            mt: 1,
                            backgroundColor: COLOR_NARANJA_VIBRANTE,
                            color: COLOR_BLANCO,
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {reservasPendientes.length > 3 && (
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      +{reservasPendientes.length - 3} más. {' '}
                      <Button onClick={redirectToRatings} size="small">Ver todas</Button>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Star sx={{ fontSize: 40, color: COLOR_VERDE_LIMA, opacity: 0.5, mb: 1 }} />
                <Typography color="text.secondary">
                  ¡Genial! No tienes reservas pendientes de calificar.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}


      {/* CONTENIDO PRINCIPAL DE RESERVAS (PÁGINA EN CONSTRUCCIÓN) */}
      <Card className="rounded-2xl shadow-lg p-6">
        <CardContent className="text-center">
          <CalendarMonth sx={{ fontSize: 80, color: '#0f9fe1', opacity: 0.3, mb: 2 }} />
          <Typography variant="h5" className="font-title text-gray-600 mb-2">
            Página de Historial de Reservas
          </Typography>
          <Typography variant="body1" className="text-gray-500 font-body">
            Aquí se mostraría la lista completa de todas tus reservas (activas, canceladas, completadas).
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}