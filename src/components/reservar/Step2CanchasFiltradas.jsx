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
import { toast } from 'react-toastify';

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
  fetchCanchasByDisciplina,
  setOrdenarPorDistancia
}) {
  const [canchasOrdenadas, setCanchasOrdenadas] = useState([]);

  useEffect(() => {
    const canchasConEspacio = canchas.map(cancha => ({
      ...cancha,
      espacio: cancha.espacio || espacios.find(e => e.id_espacio_deportivo === cancha.id_espacio_deportivo)
    }));
    
    setCanchasOrdenadas(canchasConEspacio);
    
    // Depuración
    console.log('🔍 Estado actual:');
    console.log(`- Ordenar por distancia: ${ordenarPorDistancia}`);
    console.log(`- Ubicación disponible: ${!!ubicacionUsuario}`);
    console.log(`- Total canchas: ${canchasConEspacio.length}`);
  }, [canchas, espacios, ordenarPorDistancia, ubicacionUsuario]);

  const canchasFiltradas = filtrarCanchasPorEspacio(espacioFiltro, canchasOrdenadas);
  const espaciosDisponibles = getEspaciosDisponibles();

  // Función para manejar el clic en el botón de ordenar
  const handleOrdenarClick = async () => {
    if (!ubicacionUsuario) {
      // No hay ubicación → obtenerla
      try {
        console.log('📍 Obteniendo ubicación...');
        await obtenerUbicacion();
        // Después de obtener ubicación, recargar canchas automáticamente
        // porque ordenarPorDistancia se activa en obtenerUbicacion
        setTimeout(() => {
          if (selectedDisciplina) {
            fetchCanchasByDisciplina(selectedDisciplina.id_disciplina);
          }
        }, 500);
      } catch (error) {
        console.error("Error al obtener ubicación:", error);
      }
    } else {
      // Ya hay ubicación → alternar entre los dos modos
      const nuevoOrden = !ordenarPorDistancia;
      console.log(`🔄 Cambiando orden: ${ordenarPorDistancia ? 'Distancia' : 'Alfabético'} → ${nuevoOrden ? 'Distancia' : 'Alfabético'}`);
      
      setOrdenarPorDistancia(nuevoOrden);
      
      // Recargar canchas con el nuevo ordenamiento
      if (selectedDisciplina) {
        try {
          await fetchCanchasByDisciplina(selectedDisciplina.id_disciplina);
          if (nuevoOrden) {
            toast.success("Canchas ordenadas por cercanía");
          } else {
            toast.info("Canchas ordenadas alfabéticamente");
          }
        } catch (error) {
          console.error("Error al recargar canchas:", error);
        }
      }
    }
  };

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
          {/* Título */}
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
                {ordenarPorDistancia && ubicacionUsuario ? ' • Ordenadas por cercanía' : ' • Ordenadas alfabéticamente'}
              </Typography>
            </Box>
          </Box>

          {/* Controles */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            minWidth: { md: 400 }
          }}>
            {/* Botón de ordenar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={ordenarPorDistancia ? "Ordenar alfabéticamente" : "Ordenar por cercanía"}>
                <IconButton
                  onClick={handleOrdenarClick}
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

        {/* Alerta de ubicación */}
        {ubicacionUsuario && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  limpiarUbicacion();
                }}
              >
                Limpiar
              </Button>
            }
          >
            <Typography variant="body2" fontWeight="medium">
              📍 Ubicación obtenida • Precisión: {ubicacionUsuario.precision?.toFixed(0) || 'N/A'}m
              {ordenarPorDistancia ? ' • Ordenando por cercanía' : ' • Ordenando alfabéticamente'}
            </Typography>
          </Alert>
        )}

        {/* Espacios disponibles */}
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
          {canchasFiltradas.map((cancha, index) => (
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
                <Box sx={{ height: '100%' }}>
                  <CanchaCard
                    cancha={cancha}
                    espacio={cancha.espacio}
                    onClick={() => onCanchaSelect(cancha)}
                    index={index}
                  />
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}