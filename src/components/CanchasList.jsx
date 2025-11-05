import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button
} from '@mui/material';
import {
  SportsSoccer,
  ArrowBack,
  Schedule
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const CanchasList = ({ espacio, canchas, onCanchaClick, onBack }) => {
  const getDisciplinaColor = (disciplina) => {
    const colors = {
      'fútbol': '#4caf50',
      'baloncesto': '#ff9800',
      'vóley': '#2196f3',
      'tenis': '#9c27b0',
      'paddle': '#f44336',
      'futbol': '#4caf50',
      'voleibol': '#2196f3',
      'basquetbol': '#ff9800'
    };
    return colors[disciplina?.toLowerCase()] || '#757575';
  };

  const getEstadoColor = (estado) => {
    return estado === 'activo' ? 'success' : 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box className="flex items-center gap-4 mb-6">
        <IconButton onClick={onBack} className="text-primary">
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" className="font-title text-primary">
            {espacio.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Canchas disponibles en este espacio
          </Typography>
        </Box>
      </Box>

      {/* Información del espacio */}
      <Card className="rounded-2xl shadow-lg mb-6">
        <CardContent className="p-4">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" className="font-body">
                <strong>Ubicación:</strong> {espacio.ubicacion}
              </Typography>
              <Typography variant="body1" className="font-body">
                <strong>Capacidad:</strong> {espacio.capacidad} personas
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" className="font-body">
                <strong>Estado:</strong> 
                <Chip 
                  label={espacio.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'} 
                  color={getEstadoColor(espacio.estado)}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              {espacio.descripcion && (
                <Typography variant="body2" className="text-gray-600 mt-1">
                  {espacio.descripcion}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de canchas */}
      <Grid container spacing={3}>
        {canchas.map((cancha, index) => (
          <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => onCanchaClick(cancha)}
              >
                <Box className="h-40 relative rounded-t-2xl overflow-hidden">
                  {cancha.imagen ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${cancha.imagen}`} 
                      alt={cancha.nombre} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box 
                      className="absolute inset-0 flex items-center justify-center"
                      sx={{ backgroundColor: getDisciplinaColor(cancha.disciplina) }}
                    >
                      <SportsSoccer sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
                    </Box>
                  )}
                  
                  <Box className="absolute top-3 right-3">
                    <Chip 
                      label={cancha.estado === 'activo' ? 'ACTIVA' : 'INACTIVA'}
                      color={getEstadoColor(cancha.estado)}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <CardContent>
                  <Typography variant="h6" className="font-title mb-2">
                    {cancha.nombre}
                  </Typography>
                  
                  <Box className="flex flex-wrap gap-1 mb-2">
                    <Chip 
                      label={cancha.disciplina || 'Sin disciplina'}
                      size="small"
                      sx={{ 
                        backgroundColor: getDisciplinaColor(cancha.disciplina),
                        color: 'white'
                      }}
                    />
                    <Chip 
                      label={`$${cancha.precio_hora || cancha.precio_por_hora || '0'}/hora`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" className="text-gray-600 font-body line-clamp-2 mb-3">
                    {cancha.descripcion || 'Sin descripción disponible'}
                  </Typography>

                  <Box className="flex justify-between items-center">
                    <Chip 
                      icon={<Schedule />}
                      label="Ver Horarios"
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" className="text-gray-500">
                      Capacidad: {cancha.capacidad || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {canchas.length === 0 && (
        <Box className="text-center py-12">
          <SportsSoccer sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
          <Typography variant="h6" className="text-gray-500">
            No hay canchas registradas en este espacio
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2">
            Contacta al administrador para agregar canchas
          </Typography>
        </Box>
      )}
    </Box>
  );
};
CanchasList.propTypes = {
  espacio: PropTypes.shape({
    nombre: PropTypes.string,
    ubicacion: PropTypes.string,
    capacidad: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    estado: PropTypes.string,
    descripcion: PropTypes.string,
  }),
  canchas: PropTypes.arrayOf(PropTypes.object),
  onCanchaClick: PropTypes.func,
  onBack: PropTypes.func,
};

CanchasList.defaultProps = {
  espacio: {
    nombre: '',
    ubicacion: '',
    capacidad: 0,
    estado: 'inactivo',
    descripcion: '',
  },
  canchas: [],
  onCanchaClick: () => {},
  onBack: () => {},
};

export default CanchasList;