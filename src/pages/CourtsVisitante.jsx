import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Para navegación y recibir datos del Home
import { canchasApi } from '../api/canchas';
import { espaciosApi } from '../api/espacios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  IconButton
} from '@mui/material';
import { 
  SportsSoccer, 
  SportsBasketball, 
  SportsVolleyball, 
  SportsTennis,
  CheckCircle,
  Block,
  LocationOn,
  Schedule,
  AttachMoney,
  Search,
  Refresh,
  Sort,
  Close,
  Login // Icono para indicar login
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// === PALETA DE COLORES (Consistente con Courst.jsx) ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_NEON = '#39FF14';
const COLOR_GRIS_OSCURO = '#121212'; // Fondo oscuro
const COLOR_GRIS_MEDIO = '#1E1E1E'; // Tarjetas
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';

export default function CourtsVisitante() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para leer el estado enviado desde Home

  // Estado principal
  const [canchas, setCanchas] = useState([]);
  const [filteredCanchas, setFilteredCanchas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inicializamos la categoría con lo que venga del Home, o 'Todas' por defecto
  const [filterCategory, setFilterCategory] = useState(location.state?.filterCategory || 'Todas');
  
  const [sortOrder, setSortOrder] = useState('nombre');

  // Estado para Zoom de Imagen
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });

  // --- EFECTO: Cargar Datos ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- EFECTO: Filtrado Automático ---
  useEffect(() => {
    applyFilters();
  }, [canchas, searchTerm, filterCategory, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Ejecutamos ambas peticiones en paralelo
      const [canchasData, espaciosData] = await Promise.all([
        canchasApi.getAll(),
        espaciosApi.getAll()
      ]);
      
      setCanchas(canchasData);
      setEspacios(espaciosData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar las canchas disponibles");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const applyFilters = useCallback(() => {
    let result = [...canchas];

    // 1. Filtro por búsqueda (Nombre o Ubicación)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.nombre.toLowerCase().includes(lowerTerm) ||
        getEspacioName(c.id_espacio_deportivo).toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filtro por Categoría/Deporte
    if (filterCategory !== 'Todas') {
      result = result.filter(c => {
         // Ajusta esto según cómo guardes el "tipo" en tu BD (ej: "Fútbol 5", "Baloncesto", etc.)
         return c.tipo && c.tipo.toLowerCase().includes(filterCategory.toLowerCase());
      });
    }

    // 3. Ordenamiento
    result.sort((a, b) => {
      if (sortOrder === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (sortOrder === 'precio_asc') return parseFloat(a.precio_por_hora) - parseFloat(b.precio_por_hora);
      if (sortOrder === 'precio_desc') return parseFloat(b.precio_por_hora) - parseFloat(a.precio_por_hora);
      return 0;
    });

    setFilteredCanchas(result);
  }, [canchas, searchTerm, filterCategory, sortOrder, espacios]);

  // --- HELPERS ---
  const getEspacioName = (idEspacio) => {
    const espacio = espacios.find(e => e.id_espacio_deportivo === idEspacio);
    return espacio ? espacio.nombre : 'Ubicación desconocida';
  };

  const getDeporteIcon = (tipo) => {
    if (!tipo) return <SportsSoccer />;
    const t = tipo.toLowerCase();
    if (t.includes('fut') || t.includes('soccer')) return <SportsSoccer />;
    if (t.includes('basquet') || t.includes('baloncesto') || t.includes('basket')) return <SportsBasketball />;
    if (t.includes('voley') || t.includes('volleyball')) return <SportsVolleyball />;
    if (t.includes('tenis') || t.includes('tennis')) return <SportsTennis />;
    return <SportsSoccer />;
  };

  // --- ACCIÓN PRINCIPAL: REDIRIGIR AL LOGIN ---
  const handleCardClick = () => {
    toast.info("Inicia sesión para reservar esta cancha");
    navigate('/login');
  };

  // --- RENDER ---
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', pb: 8 }}>
      
      {/* HEADER TIPO HERO */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${COLOR_GRIS_OSCURO} 0%, ${COLOR_GRIS_MEDIO} 100%)`,
          color: COLOR_BLANCO,
          py: 8,
          px: 3,
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          textAlign: 'center'
        }}
      >
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: 'Montserrat, sans-serif', mb: 1 }}>
            Nuestras Canchas
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: '300' }}>
            Explora los mejores espacios deportivos de La Paz
          </Typography>
        </motion.div>
      </Box>

      {/* BARRA DE HERRAMIENTAS (Búsqueda y Filtros) */}
      <Box sx={{ px: { xs: 2, md: 6 }, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          
          {/* Buscador */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nombre o lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: COLOR_AZUL_ELECTRICO }} />
                  </InputAdornment>
                ),
                sx: { backgroundColor: COLOR_BLANCO, borderRadius: '12px' }
              }}
            />
          </Grid>

          {/* Filtro Categoría */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined" sx={{ backgroundColor: COLOR_BLANCO, borderRadius: '12px' }}>
              <InputLabel>Deporte</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Deporte"
              >
                <MenuItem value="Todas">Todos</MenuItem>
                <MenuItem value="Fútbol">Fútbol</MenuItem>
                <MenuItem value="Baloncesto">Baloncesto</MenuItem>
                <MenuItem value="Voleibol">Voleibol</MenuItem>
                <MenuItem value="Tenis">Tenis</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Ordenar */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth variant="outlined" sx={{ backgroundColor: COLOR_BLANCO, borderRadius: '12px' }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Ordenar por"
                startAdornment={<Sort sx={{ mr: 1, color: COLOR_AZUL_ELECTRICO }} />}
              >
                <MenuItem value="nombre">Nombre (A-Z)</MenuItem>
                <MenuItem value="precio_asc">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="precio_desc">Precio: Mayor a Menor</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botón Reset */}
          <Grid item xs={12} md={1}>
             <Button 
               fullWidth 
               variant="text" 
               onClick={() => {
                 setSearchTerm('');
                 setFilterCategory('Todas');
                 setSortOrder('nombre');
               }}
               sx={{ height: '56px', color: COLOR_GRIS_OSCURO }}
             >
               <Refresh />
             </Button>
          </Grid>
        </Grid>
      </Box>

      {/* GRID DE CANCHAS */}
      <Box sx={{ px: { xs: 2, md: 6 } }}>
        {loading ? (
           <Typography textAlign="center" sx={{ mt: 4 }}>Cargando canchas...</Typography>
        ) : filteredCanchas.length === 0 ? (
           <Box textAlign="center" py={5}>
             <Typography variant="h5" color="textSecondary">No se encontraron canchas con estos filtros.</Typography>
           </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCanchas.map((cancha) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={cancha.id_cancha}>
                <motion.div 
                  whileHover={{ y: -8 }} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    // Evento Click en toda la tarjeta
                    onClick={handleCardClick}
                    sx={{ 
                      borderRadius: '20px', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      overflow: 'visible',
                      position: 'relative',
                      transition: '0.3s',
                      cursor: 'pointer', // Cursor de mano
                      backgroundColor: COLOR_BLANCO,
                      '&:hover': {
                         boxShadow: `0 15px 35px rgba(0, 191, 255, 0.25)`
                      }
                    }}
                  >
                    {/* Imagen de la Cancha */}
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                       <CardMedia
                         component="img"
                         height="200"
                         image={cancha.imagen || "/static/uploads/bannercancha.jpg"} // Fallback image
                         alt={cancha.nombre}
                         sx={{ 
                           objectFit: 'cover',
                           transition: 'transform 0.5s',
                           '&:hover': { transform: 'scale(1.1)' }
                         }}
                         // Prevenir que el click en la imagen abra el login si queremos zoom (opcional, aqui dejamos que todo lleve a login)
                         // Si quieres zoom, descomenta abajo y maneja stopPropagation
                         /*
                         onClick={(e) => {
                            e.stopPropagation();
                            setImageZoom({ open: true, src: cancha.imagen });
                         }}
                         */
                       />
                       
                       {/* Badge de Precio */}
                       <Box
                         sx={{
                           position: 'absolute',
                           top: 15,
                           right: 15,
                           backgroundColor: 'rgba(0,0,0,0.7)',
                           backdropFilter: 'blur(4px)',
                           padding: '6px 12px',
                           borderRadius: '12px',
                           color: COLOR_VERDE_NEON,
                           fontWeight: 'bold',
                           display: 'flex',
                           alignItems: 'center',
                           boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                         }}
                       >
                         <AttachMoney fontSize="small" /> {cancha.precio_por_hora} / hr
                       </Box>

                       {/* Badge de Estado */}
                       <Box
                         sx={{
                           position: 'absolute',
                           bottom: 15,
                           left: 15,
                           backgroundColor: cancha.estado === 'activa' ? COLOR_VERDE_NEON : '#ff4444',
                           color: cancha.estado === 'activa' ? '#000' : '#fff',
                           padding: '4px 10px',
                           borderRadius: '8px',
                           fontSize: '0.75rem',
                           fontWeight: 'bold',
                           display: 'flex',
                           alignItems: 'center',
                           gap: 0.5
                         }}
                       >
                         {cancha.estado === 'activa' ? <CheckCircle fontSize="small" /> : <Block fontSize="small" />}
                         {cancha.estado === 'activa' ? 'Disponible' : 'No Disponible'}
                       </Box>
                    </Box>

                    <CardContent sx={{ pt: 3, px: 3 }}>
                      {/* Tipo de deporte */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: COLOR_AZUL_ELECTRICO, textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: 1 }}>
                         {getDeporteIcon(cancha.tipo)}
                         <Typography sx={{ ml: 1, fontSize: 'inherit' }}>{cancha.tipo}</Typography>
                      </Box>

                      {/* Nombre Cancha */}
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.2 }}>
                        {cancha.nombre}
                      </Typography>

                      {/* Espacio Deportivo */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                        <LocationOn fontSize="small" sx={{ mr: 0.5, color: COLOR_NARANJA_VIBRANTE }} />
                        <Typography variant="body2" noWrap>
                          {getEspacioName(cancha.id_espacio_deportivo)}
                        </Typography>
                      </Box>

                      {/* Horario */}
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                        <Schedule fontSize="small" sx={{ mr: 0.5, color: COLOR_AZUL_ELECTRICO }} />
                        <Typography variant="body2">
                          {cancha.hora_apertura?.slice(0, 5)} - {cancha.hora_cierre?.slice(0, 5)}
                        </Typography>
                      </Box>
                      
                      {/* Botón de llamada a la acción visual */}
                      <Button 
                        fullWidth 
                        variant="contained" 
                        endIcon={<Login />}
                        sx={{ 
                          backgroundColor: COLOR_NARANJA_VIBRANTE, 
                          color: '#fff',
                          fontWeight: 'bold',
                          borderRadius: '10px',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: '#e66b0d'
                          }
                        }}
                      >
                        Reservar Ahora
                      </Button>

                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Modal para ver imagen en grande (Opcional, si decides habilitarlo) */}
      <Dialog
        open={imageZoom.open}
        onClose={() => setImageZoom({ open: false, src: '' })}
        maxWidth="lg"
        PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
             onClick={() => setImageZoom({ open: false, src: '' })}
             sx={{ position: 'absolute', right: 0, top: 0, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <Close />
          </IconButton>
          <img src={imageZoom.src} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '10px' }} />
        </Box>
      </Dialog>

    </Box>
  );
}