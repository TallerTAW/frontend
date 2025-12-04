import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
// Asegúrate de que tu Theme global de MUI ya tenga configuradas las fuentes Montserrat y Roboto.
// Si no lo están, las propiedades fontWeight, fontStyle y la configuración de Typography no se aplicarán correctamente.

// Colores de tu paleta:
const COLOR_DARK = '#333333';        // Gris Oscuro para el fondo del Header
const COLOR_PRIMARY = '#00BFFF';     // Azul Eléctrico
const COLOR_ACCENT_RED = '#FD7E14';  // Naranja/Rojo para el botón "Regístrate"
const COLOR_LIGHT = '#FFFFFF';       // Blanco

export default function HeaderHome() {
  const navigate = useNavigate();
  const { content, loading, error } = useContent();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleAppExploreClick = () => {
    navigate('/dashboard'); // Usamos dashboard como ruta sugerida para la app
  }

  // Valores por defecto en caso de error o carga
  const logoUrl = content.header_logo ||
  '/static/uploads/team.jpg';
  const siteName = content.site_name || 'OLYMPIAHUB';

  if (loading) {
    return (
      <AppBar position="static" elevation={0} sx={{ backgroundColor: COLOR_DARK }}>
        <Toolbar>
          {/* Usamos fontWeight y fontFamily si están definidas en el Theme, o Typography para el texto */}
          <Typography variant="h6" sx={{ color: COLOR_LIGHT, fontWeight: 'bold' }}>Cargando...</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    // Aplicamos el color oscuro al fondo del AppBar
    <AppBar position="fixed" elevation={0} sx={{ backgroundColor: COLOR_DARK }}>
      <Toolbar 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          minHeight: '64px', 
          // RESPONSIVE: Padding reducido en móvil (xs)
          px: { xs: 2, sm: 4, md: 5 } 
        }}
      >
        
        {/* Logo + Texto OLYMPIAHUB */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            flexGrow: 1, 
            cursor: "pointer",
            py: 1 // Pequeño padding vertical para mejor alineación
          }} 
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src={logoUrl}
            alt="Logo del sitio"
            sx={{ 
              width: 40, // Tamaño más pequeño y adecuado para un header
              height: 40,
              borderRadius: "4px", // Bordes cuadrados o ligeramente redondeados
              mr: 1.5,
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.src = '/static/uploads/team.jpg';
            }}
          />
          {/* Usamos el color de texto blanco y el estilo Montserrat/Bold */}
          <Typography variant="h6" fontWeight="bold" sx={{ color: COLOR_LIGHT, fontFamily: 'Montserrat, sans-serif' }}>
            {siteName}
          </Typography>
        </Box>

        

        {/* Botones de Explorar, Registro y Login */}
        <Box 
          sx={{ 
            display: 'flex', 
            // RESPONSIVE: Gap ajustado para móvil
            gap: { xs: 1, sm: 1.5 } 
          }}
        >
          
          {/* 1. Botón EXPLORAR NUESTRA APP (Oculto en xs para ahorrar espacio en móvil) */}
          <Button 
            variant="outlined" 
            onClick={handleAppExploreClick}
            sx={{ 
              // RESPONSIVE: Ocultar en xs, mostrar a partir de sm
              display: { xs: 'none', sm: 'flex' },
              borderColor: COLOR_PRIMARY,
              color: COLOR_PRIMARY,
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                borderColor: COLOR_PRIMARY,
                backgroundColor: 'rgba(0, 191, 255, 0.1)' // Azul Eléctrico ligero
              }
            }}
          >
            Explora Nuestra App
          </Button>

          {/* 2. Botón REGÍSTRATE (Outlined con borde Naranja/Rojo) */}
          <Button 
            variant="outlined" 
            onClick={handleRegisterClick}
            sx={{ 
              borderColor: COLOR_ACCENT_RED,
              color: COLOR_ACCENT_RED,
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                borderColor: COLOR_ACCENT_RED,
                backgroundColor: 'rgba(253, 126, 20, 0.1)' // Naranja/Rojo ligero
              }
            }}
          >
            Regístrate
          </Button>

          {/* 3. Botón INICIO DE SESIÓN (Contained con fondo Azul Eléctrico) */}
          <Button 
            variant="contained" 
            onClick={handleLoginClick}
            sx={{ 
              backgroundColor: COLOR_PRIMARY, 
              color: COLOR_LIGHT,
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: COLOR_PRIMARY, // Mantenemos el azul primario
                opacity: 0.9,
              }
            }}
          >
            Inicio de Sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}