// 📍 ARCHIVO: src/components/reservar/Step2CanchasFiltradas.jsx
import { useState, useEffect } from 'react';
import { 
  Button, 
  Grid, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack, 
  FilterList, 
  LocationOn, 
  Stadium,
  MyLocation,
  Sort
} from '@mui/icons-material';
import CanchaCard from './CanchaCard';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import { motion } from 'framer-motion';

// Función para calcular distancia usando la fórmula del haversine
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en kilómetros
};

// Función para formatear distancia
const formatearDistancia = (km) => {
  if (km === null || km === undefined) return 'N/A';
  
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${km.toFixed(0)} km`;
};

export default function Step2CanchasFiltradas({
  selectedDisciplina,
  canchas,
  espacios,
  onCanchaSelect,
  onBack,
  loading,
  espacioFiltro,
  setEspacioFiltro,
  filtrarCanchasPorEspacio,
  getEspaciosDisponibles,
  ubicacionUsuario,
  ordenarPorDistancia,
  obteniendoUbicacion,
  obtenerUbicacion,
  limpiarUbicacion,
  getCanchasOrdenadasPorDistancia
}) {
  const [canchasOrdenadas, setCanchasOrdenadas] = useState([]);

  // Ordenar canchas cuando cambian los parámetros
  useEffect(() => {
    if (ordenarPorDistancia && ubicacionUsuario && canchas.length > 0) {
      const ordenadas = getCanchasOrdenadasPorDistancia();
      setCanchasOrdenadas(ordenadas);
    } else {
      // Restaurar orden original
      const canchasConEspacio = canchas.map(cancha => ({
        ...cancha,
        espacio: espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo)
      }));
      setCanchasOrdenadas(canchasConEspacio);
    }
  }, [canchas, espacios, ordenarPorDistancia, ubicacionUsuario, getCanchasOrdenadasPorDistancia]);

  // Aplicar filtro de espacio a las canchas ordenadas
  const canchasFiltradas = filtrarCanchasPorEspacio(espacioFiltro, canchasOrdenadas);

  const espaciosDisponibles = getEspaciosDisponibles();

  if (loading) {
    return <LoadingState message="Cargando canchas..." />;
  }

  if (canchas.length === 0) {
    return (
      <Box>
        <Box className="flex items-center gap-4 mb-6">
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
          >
            Atrás
          </Button>
          <Typography variant="h6" className="font-bold">
            Canchas de {selectedDisciplina?.nombre}
          </Typography>
        </Box>
        <EmptyState 
          message={`No se encontraron canchas de ${selectedDisciplina?.nombre} disponibles`}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header con filtros */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 3,
          mb: 4
        }}>
          {/* Botón atrás y título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 'bold',
                minWidth: 'auto'
              }}
            >
              Atrás
            </Button>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Canchas de {selectedDisciplina?.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canchasFiltradas.length} cancha{canchasFiltradas.length !== 1 ? 's' : ''} disponible{canchasFiltradas.length !== 1 ? 's' : ''}
                {ordenarPorDistancia && ubicacionUsuario && ' • Ordenadas por cercanía'}
              </Typography>
            </Box>
          </Box>

          {/* Controles de filtros y ubicación */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            minWidth: { md: 400 }
          }}>
            {/* Botón de ubicación */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={ordenarPorDistancia ? "Ordenar por cercanía" : "Ordenar alfabéticamente"}>
                <IconButton
                  onClick={() => {
                    if (ubicacionUsuario) {
                      // Si ya tenemos ubicación, solo alternar ordenamiento
                      // Si no tenemos ubicación, obtenerla primero
                    }
                  }}
                  disabled={!ubicacionUsuario}
                  sx={{
                    bgcolor: ordenarPorDistancia ? 'primary.main' : 'transparent',
                    color: ordenarPorDistancia ? 'white' : 'primary.main',
                    '&:hover': {
                      bgcolor: ordenarPorDistancia ? 'primary.dark' : 'action.hover'
                    },
                    border: '1px solid',
                    borderColor: ordenarPorDistancia ? 'primary.main' : 'divider'
                  }}
                >
                  <Sort />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={ubicacionUsuario ? "Ubicación obtenida" : "Obtener mi ubicación"}>
                <Button
                  variant={ubicacionUsuario ? "contained" : "outlined"}
                  startIcon={obteniendoUbicacion ? <CircularProgress size={20} color="inherit" /> : <MyLocation />}
                  onClick={() => {
                    if (!ubicacionUsuario) {
                      obtenerUbicacion();
                    }
                  }}
                  disabled={obteniendoUbicacion}
                  sx={{
                    minWidth: 'auto',
                    bgcolor: ubicacionUsuario ? '#4caf50' : undefined,
                    '&:hover': {
                      bgcolor: ubicacionUsuario ? '#388e3c' : undefined
                    }
                  }}
                >
                  {obteniendoUbicacion ? 'Obteniendo...' : 'Ubicación'}
                </Button>
              </Tooltip>
            </Box>

            {/* Filtro de espacios */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <FilterList color="primary" />
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por espacio</InputLabel>
                <Select
                  value={espacioFiltro}
                  onChange={(e) => setEspacioFiltro(e.target.value)}
                  label="Filtrar por espacio"
                >
                  <MenuItem value="todos">Todos los espacios</MenuItem>
                  {espaciosDisponibles.map((espacio) => (
                    <MenuItem key={espacio.id_espacio_deportivo} value={espacio.id_espacio_deportivo}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        {espacio.nombre}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Información de ubicación */}
        {ubicacionUsuario && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={limpiarUbicacion}
              >
                Limpiar
              </Button>
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" fontWeight="medium">
                📍 Ubicación obtenida • Precisión: {ubicacionUsuario.precision?.toFixed(0) || 'N/A'}m
              </Typography>
              {ordenarPorDistancia && (
                <Typography variant="caption">
                  Canchas ordenadas por cercanía a tu ubicación
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* Chips de espacios disponibles */}
        <Paper elevation={0} sx={{ 
          p: 2, 
          mb: 4, 
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
              Espacios disponibles para {selectedDisciplina?.nombre}:
            </Typography>
            {ordenarPorDistancia && ubicacionUsuario && (
              <Chip
                label="Ordenado por cercanía"
                color="success"
                size="small"
                icon={<MyLocation fontSize="small" />}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Todos"
              color={espacioFiltro === 'todos' ? 'primary' : 'default'}
              onClick={() => setEspacioFiltro('todos')}
              clickable
              icon={<Stadium fontSize="small" />}
              sx={{ mb: 1 }}
            />
            {espaciosDisponibles.map((espacio) => (
              <Chip
                key={espacio.id_espacio_deportivo}
                label={espacio.nombre}
                color={espacioFiltro === espacio.id_espacio_deportivo ? 'primary' : 'default'}
                onClick={() => setEspacioFiltro(espacio.id_espacio_deportivo)}
                clickable
                icon={<LocationOn fontSize="small" />}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </Paper>
      </motion.div>

      {/* Grid de canchas */}
      {canchasFiltradas.length === 0 ? (
        <EmptyState 
          message={`No hay canchas de ${selectedDisciplina?.nombre} disponibles en el espacio seleccionado`}
        />
      ) : (
        <Grid container spacing={3}>
          {canchasFiltradas.map((cancha, index) => {
            const espacioCancha = espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo);
            
            return (
              <Grid 
                item 
                xs={12}
                sm={6}
                md={4}
                key={cancha.id_cancha}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  style={{ height: '100%' }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease'
                      }
                    }}
                  >
                    <CanchaCard
                      cancha={cancha}
                      espacio={espacioCancha}
                      onClick={() => onCanchaSelect(cancha)}
                      index={index}
                      distancia={cancha.distancia}
                      mostrarDistancia={ordenarPorDistancia}
                    />
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}