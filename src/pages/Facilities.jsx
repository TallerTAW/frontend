import { useEffect, useState, useCallback } from 'react';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  CardActions,
  Chip,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Stadium,
  SportsSoccer,
  Schedule,
  Home
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Componentes que vamos a crear
import CanchasList from '../components/CanchasList';
import HorariosCancha from '../components/HorariosCancha';

export default function Facilities() {
  const [espacios, setEspacios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [view, setView] = useState('espacios'); // 'espacios', 'canchas', 'horarios'
  const { profile } = useAuth();

  useEffect(() => {
    if (view === 'espacios') {
      fetchEspacios();
    }
  }, [view]);

  const fetchEspacios = async () => {
    try {
      const data = await espaciosApi.getMisEspacios();
      setEspacios(data);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const fetchCanchasByEspacio = async (espacioId) => {
    try {
      const data = await canchasApi.getByEspacio(espacioId);
      setCanchas(data);
    } catch (error) {
      toast.error('Error al cargar las canchas');
    }
  };

  const handleEspacioClick = (espacio) => {
    setSelectedEspacio(espacio);
    fetchCanchasByEspacio(espacio.id_espacio_deportivo);
    setView('canchas');
  };

  const handleCanchaClick = (cancha) => {
    setSelectedCancha(cancha);
    setView('horarios');
  };

  const handleBackToEspacios = () => {
    setSelectedEspacio(null);
    setSelectedCancha(null);
    setView('espacios');
  };

  const handleBackToCanchas = () => {
    setSelectedCancha(null);
    setView('canchas');
  };

  // Renderizar breadcrumbs de navegación
  const renderBreadcrumbs = () => (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      <Link
        component="button"
        onClick={handleBackToEspacios}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: view === 'espacios' ? 'text.primary' : 'primary.main',
          cursor: 'pointer'
        }}
      >
        <Home sx={{ mr: 0.5 }} fontSize="small" />
        Espacios Deportivos
      </Link>
      
      {selectedEspacio && (
        <Link
          component="button"
          onClick={handleBackToCanchas}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: view === 'canchas' ? 'text.primary' : 'primary.main',
            cursor: view === 'horarios' ? 'pointer' : 'default'
          }}
        >
          <Stadium sx={{ mr: 0.5 }} fontSize="small" />
          {selectedEspacio.nombre}
        </Link>
      )}
      
      {selectedCancha && (
        <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
          <SportsSoccer sx={{ mr: 0.5 }} fontSize="small" />
          {selectedCancha.nombre}
        </Typography>
      )}
    </Breadcrumbs>
  );

  // Vista de lista de espacios
  const renderEspaciosView = () => (
    <>
      <Box className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" className="font-title text-primary">
            Mis Espacios Deportivos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus espacios deportivos y sus canchas
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {espacios.map((espacio, index) => (
          <Grid item xs={12} sm={6} md={4} key={espacio.id_espacio_deportivo}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => handleEspacioClick(espacio)}
              >
                <Box className="h-48 relative rounded-t-2xl overflow-hidden">
                  {espacio.imagen ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${espacio.imagen}`} 
                      alt={espacio.nombre} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box className="absolute inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                    </Box>
                  )}
                  
                  <Box className="absolute top-3 right-3">
                    <Chip 
                      label={espacio.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                      color={espacio.estado === 'activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <CardContent>
                  <Typography variant="h6" className="font-title mb-2">
                    {espacio.nombre}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    📍 {espacio.ubicacion}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 font-body">
                    👥 Capacidad: {espacio.capacidad} personas
                  </Typography>
                  
                  <Box className="mt-3 flex justify-between items-center">
                    <Chip 
                      icon={<SportsSoccer />}
                      label={`Ver Canchas`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="caption" className="text-gray-500">
                      Click para ver detalles
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {espacios.length === 0 && (
        <Box className="text-center py-12">
          <Stadium sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
          <Typography variant="h6" className="text-gray-500">
            No hay espacios deportivos asignados
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <Box sx={{ mt: 12, p: 3 }}>
      {renderBreadcrumbs()}
      
      {view === 'espacios' && renderEspaciosView()}
      {view === 'canchas' && (
        <CanchasList 
          espacio={selectedEspacio}
          canchas={canchas}
          onCanchaClick={handleCanchaClick}
          onBack={handleBackToEspacios}
        />
      )}
      {view === 'horarios' && (
        <HorariosCancha 
          cancha={selectedCancha}
          espacio={selectedEspacio}
          onBack={handleBackToCanchas}
        />
      )}
    </Box>
  );
}