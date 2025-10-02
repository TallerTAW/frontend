import { Box, Typography, Card, CardContent } from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Reservations() {
  const { profile } = useAuth();

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

      <Card className="rounded-2xl shadow-lg p-6">
        <CardContent className="text-center">
          <CalendarMonth sx={{ fontSize: 80, color: '#0f9fe1', opacity: 0.3, mb: 2 }} />
          <Typography variant="h5" className="font-title text-gray-600 mb-2">
            Página en Construcción
          </Typography>
          <Typography variant="body1" className="text-gray-500 font-body">
            Esta funcionalidad estará disponible próximamente.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}