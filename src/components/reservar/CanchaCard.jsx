import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { SportsSoccer, LocationOn, People, AccessTime } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function CanchaCard({ cancha, espacio, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)'
          }
        }}
        onClick={onClick}
        elevation={2}
      >
        {/* Imagen de la cancha */}
        <Box
          sx={{
            height: 180,
            background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <SportsSoccer sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
          
          {/* Estado de la cancha */}
          <Chip
            label={cancha.estado}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: cancha.estado === 'disponible' ? '#16a34a' : '#dc2626',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
          
          {/* Nombre del espacio deportivo */}
          {espacio && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                color: 'white',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LocationOn sx={{ fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                {espacio.nombre}
              </Typography>
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          {/* Nombre de la cancha */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            {cancha.nombre}
          </Typography>
          
          {/* Tipo de cancha */}
          {cancha.tipo && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tipo: {cancha.tipo}
            </Typography>
          )}
          
          {/* Información del espacio deportivo */}
          {espacio && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {espacio.ubicacion}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Capacidad: {espacio.capacidad} personas
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Horario de la cancha */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            p: 1.5,
            bgcolor: 'action.hover',
            borderRadius: 1
          }}>
            <AccessTime sx={{ fontSize: 18, color: 'primary.main', mr: 1.5 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Horario operativo
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {cancha.hora_apertura?.slice(0,5) || '08:00'} - {cancha.hora_cierre?.slice(0,5) || '22:00'}
              </Typography>
            </Box>
          </Box>
          
          {/* Precio */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary">
              Precio por hora:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f9fe1' }}>
              ${cancha.precio_por_hora}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}