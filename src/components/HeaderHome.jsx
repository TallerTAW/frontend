import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../hooks/useContent';

const sportyBlue = "#4dc0b5";

export default function HeaderHome() {
  const navigate = useNavigate();
  const { content, loading, error } = useContent();

  const handleLoginClick = () => {
    navigate('/login'); 
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  // Valores por defecto en caso de error o carga
  const logoUrl = content.header_logo || '/static/uploads/team.jpg';
  const siteName = content.site_name || 'OLYMPIAHUB';

  if (loading) {
    return (
      <AppBar position="static" elevation={0} sx={{ backgroundColor: sportyBlue }}>
        <Toolbar>
          <Typography variant="h6">Cargando...</Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: sportyBlue }}>
      <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        {/* Logo + Texto juntos */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            flexGrow: 1, 
            cursor: "pointer" 
          }} 
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src={logoUrl}
            alt="Logo del sitio"
            sx={{ 
              width: 80, 
              height: 80,
              borderRadius: "8px", 
              mr: 1,
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Fallback si la imagen no carga
              e.target.src = '/static/uploads/team.jpg';
            }}
          />
          <Typography variant="h6" fontWeight="bold">
            {siteName}
          </Typography>
        </Box>

        {/* Enlaces de Navegación */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, mr: 3 }}>
          <Button color="inherit" sx={{ textTransform: 'none' }}>Complejas</Button>
          <Button color="inherit" sx={{ textTransform: 'none' }}>Acerca de</Button>
          <Button color="inherit" sx={{ textTransform: 'none' }}>Deportes</Button>
        </Box>

        

        {/* Botones de Inicio de Sesión y Registro */}
        <Box sx={{ display: 'flex', gap: 1 }}>
  {/* Botón NUEVO: Explora nuestra App */}
  <Button 
    variant="outlined" 
    onClick={() => navigate('/dashboard')}
    sx={{ 
      borderColor: 'white',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '20px',
      textTransform: 'none',
      px: 2,
      '&:hover': {
        borderColor: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }
    }}
  >
    Explora Nuestra App
  </Button>
          <Button 
            variant="outlined" 
            onClick={handleRegisterClick}
            sx={{ 
              borderColor: 'white',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Regístrate
          </Button>
          <Button 
            variant="contained" 
            onClick={handleLoginClick}
            sx={{ 
              backgroundColor: 'white', 
              color: sportyBlue,
              fontWeight: 'bold',
              borderRadius: '20px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
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