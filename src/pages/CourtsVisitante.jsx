import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  SportsSoccer, 
  SportsBasketball, 
  SportsVolleyball, 
  SportsTennis,
  CheckCircle,
  Block,
  LocationOn,
  Search,
  Refresh,
  Sort,
  Close,
  Login,
  Warning 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// === AJUSTA TU URL AQUÍ ===
const API_BASE_URL = 'http://127.0.0.1:8000'; 

// COLORES
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_NEON = '#39FF14';
const COLOR_NARANJA_VIBRANTE = '#A2E831';

export default function CourtsVisitante() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados
  const [canchas, setCanchas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [filteredCanchas, setFilteredCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisciplina, setFilterDisciplina] = useState('Todas');
  const [ordenarPor, setOrdenarPor] = useState('nombre');

  // Zoom de imagen
  const [imageZoom, setImageZoom] = useState({ open: false, src: '' });

  // 1. DETECTAR FILTRO DESDE EL HOME
  useEffect(() => {
    if (location.state && location.state.filterCategory) {
      setFilterDisciplina(location.state.filterCategory);
    }
  }, [location]);

  // 2. FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    const urlCanchas = `${API_BASE_URL}/canchas/public/all`; 
    const urlEspacios = `${API_BASE_URL}/espacios`; // Asegúrate de que esta ruta sea pública si falla

    try {
      const [resCanchas, resEspacios] = await Promise.all([
        fetch(urlCanchas, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch(urlEspacios, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
      ]);

      if (resCanchas.ok) {
        const data = await resCanchas.json();
        setCanchas(data || []);
      }

      if (resEspacios.ok) {
        const data = await resEspacios.json();
        setEspacios(data || []);
      }

    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. LÓGICA DE FILTRADO
  useEffect(() => {
    let result = [...canchas];

    // a) Búsqueda
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((cancha) =>
        cancha.nombre.toLowerCase().includes(lowerTerm) ||
        cancha.tipo.toLowerCase().includes(lowerTerm) ||
        getNombreEspacio(cancha.id_espacio_deportivo).toLowerCase().includes(lowerTerm)
      );
    }

    // b) Filtro Disciplina
    if (filterDisciplina !== 'Todas') {
      result = result.filter(cancha => {
          const tipoCancha = cancha.tipo?.toLowerCase() || '';
          const filtro = filterDisciplina.toLowerCase();
          
          if (filtro === 'fútbol' && (tipoCancha.includes('fut') || tipoCancha.includes('fút'))) return true;
          if (filtro === 'baloncesto' && (tipoCancha.includes('bas') || tipoCancha.includes('bás') || tipoCancha.includes('basket'))) return true;
          if (filtro === 'voleibol' && (tipoCancha.includes('vol'))) return true;
          
          return tipoCancha.includes(filtro);
      });
    }

    // c) Ordenamiento
    result.sort((a, b) => {
      if (ordenarPor === 'precioAsc') return parseFloat(a.precio_hora) - parseFloat(b.precio_hora);
      if (ordenarPor === 'precioDesc') return parseFloat(b.precio_hora) - parseFloat(a.precio_hora);
      return a.nombre.localeCompare(b.nombre);
    });

    setFilteredCanchas(result);
  }, [canchas, searchTerm, filterDisciplina, ordenarPor, espacios]);


  const getNombreEspacio = (id) => {
    if (!espacios || espacios.length === 0) return 'Cargando...';
    // Usamos '==' para evitar problemas de tipo (string vs number)
    const espacio = espacios.find(e => e.id_espacio_deportivo == id);
    return espacio ? espacio.nombre : 'Ubicación desconocida';
  };

  const getIconoDisciplina = (tipo) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('fut') || t.includes('fút')) return <SportsSoccer />;
    if (t.includes('bas') || t.includes('bás')) return <SportsBasketball />;
    if (t.includes('tenis')) return <SportsTennis />;
    if (t.includes('vol')) return <SportsVolleyball />;
    return <CheckCircle />;
  };

  return (
    // 🔥 CAMBIO CLAVE 1: Reduje el padding en 'xs' de 2 a 1 para ganar ancho en móviles
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem'} }}>
          Explora Nuestras Canchas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Encuentra el espacio perfecto para tu próximo partido.
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<Login />}
          onClick={() => navigate('/login')}
          sx={{ mt: 2, backgroundColor: COLOR_AZUL_ELECTRICO }}
        >
          Iniciar Sesión para Reservar
        </Button>
      </Box>

      {/* Barra de Filtros */}
      <Card sx={{ p: 2, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Buscador */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar cancha o sede..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="action" /></InputAdornment>)}}
              size="small"
            />
          </Grid>
          {/* Filtro Disciplina */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Disciplina</InputLabel>
              <Select value={filterDisciplina} label="Disciplina" onChange={(e) => setFilterDisciplina(e.target.value)}>
                <MenuItem value="Todas">Todas</MenuItem>
                <MenuItem value="Fútbol">Fútbol</MenuItem>
                <MenuItem value="Baloncesto">Baloncesto</MenuItem>
                <MenuItem value="Voleibol">Voleibol</MenuItem>
                <MenuItem value="Tenis">Tenis</MenuItem>
                <MenuItem value="Padel">Pádel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Ordenar */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select value={ordenarPor} label="Ordenar por" onChange={(e) => setOrdenarPor(e.target.value)} startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}>
                <MenuItem value="nombre">Nombre (A-Z)</MenuItem>
                <MenuItem value="precioAsc">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="precioDesc">Precio: Mayor a Menor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Botón Refrescar */}
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading} sx={{ height: '40px' }}>
              Refrescar
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Lista de Canchas */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : filteredCanchas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
            <Block sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">No se encontraron canchas</Typography>
            <Typography variant="body2">Intenta cambiar los filtros o recargar la página.</Typography>
          </Box>
        ) : (
          /* 🔥 CAMBIO CLAVE 2: Spacing responsivo. En 'xs' es 2 (16px), suficiente para separar verticalmente */
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {filteredCanchas.map((cancha) => (
              /* 🔥 CAMBIO CLAVE 3: xs={12} asegura que ocupe todo el ancho en móviles */
              <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Card sx={{ 
                    height: '100%', 
                    width: '410px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: '16px', 
                    transition: 'transform 0.2s', 
                    boxShadow: 3, // Sombra base para que destaque
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } 
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={cancha.url_imagen || "https://via.placeholder.com/400x200?text=Sin+Imagen"}
                        alt={cancha.nombre}
                        sx={{ cursor: 'pointer', objectFit: 'cover' }}
                        onClick={() => setImageZoom({ open: true, src: cancha.url_imagen || "https://via.placeholder.com/400x200" })}
                      />
                      <Chip label={cancha.tipo} icon={getIconoDisciplina(cancha.tipo)} size="small" sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO }} />
                      
                      {/* Estado de la cancha (Si no está disponible, mostramos aviso) */}
                      {cancha.estado !== 'disponible' && cancha.estado !== 'activa' && (
                         <Chip label={cancha.estado} icon={<Warning />} size="small" color="warning" sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }} />
                      )}

                      {/* Solo mostramos el precio si existe y es mayor a 0 */}
                      {cancha.precio_hora && (
                          <Chip 
                            label={`$${cancha.precio_hora}/h`} 
                            size="small" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 10, 
                              right: 10, 
                              backgroundColor: COLOR_NARANJA_VIBRANTE, 
                              color: '#fff', 
                              fontWeight: 'bold' 
                            }} 
                          />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>{cancha.nombre}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                        <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">{getNombreEspacio(cancha.id_espacio_deportivo)}</Typography>
                      </Box>
                      {cancha.techada && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                          <CheckCircle fontSize="small" sx={{ mr: 0.5, color: COLOR_VERDE_NEON }} />
                          <Typography variant="caption">Cancha Techada</Typography>
                        </Box>
                      )}
                      <Button fullWidth variant="contained" startIcon={<Login />} onClick={() => navigate('/login')} sx={{ mt: 2, backgroundColor: COLOR_NARANJA_VIBRANTE, color: '#fff', fontWeight: 'bold', borderRadius: '10px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: '#A2E831' } }}>
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

      {/* Modal Zoom */}
      <Dialog open={imageZoom.open} onClose={() => setImageZoom({ open: false, src: '' })} maxWidth="lg" PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton onClick={() => setImageZoom({ open: false, src: '' })} sx={{ position: 'absolute', right: 0, top: 0, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' }}><Close /></IconButton>
          <img src={imageZoom.src} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '10px' }} />
        </Box>
      </Dialog>
    </Box>
  );
}