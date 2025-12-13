import { useState } from 'react'; // Asegúrate de importar useState
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../hooks/useContent';
// NUEVO: Importamos el ícono del "hombrecito"
import PersonIcon from '@mui/icons-material/Person';
import logo from '../assets/team.png';

// Colores de tu paleta:
const COLOR_DARK = '#333333';        
const COLOR_PRIMARY = '#00BFFF';     
const COLOR_ACCENT_RED = '#FD7E14';  
const COLOR_LIGHT = '#FFFFFF';       

export default function HeaderHome() {
  const navigate = useNavigate();
  const { content, loading, error } = useContent();

  // NUEVO: Estado para controlar el menú desplegable en móvil
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleLoginClick = () => {
    navigate('/login');
    handleCloseMenu(); // Cerramos menú al navegar
  };

  const handleRegisterClick = () => {
    navigate('/register');
    handleCloseMenu(); // Cerramos menú al navegar
  };

  const handleAppExploreClick = () => {
    navigate('/dashboard');
  }

  // NUEVO: Funciones para abrir/cerrar el menú del hombrecito
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Valores por defecto en caso de error o carga
  const logoUrl = logo;
  const siteName = content.site_name || 'OLYMPIAHUB';

  if (loading) {
    return (
      <AppBar position="static" sx={{ backgroundColor: COLOR_DARK }}>
        <Toolbar><Typography>Cargando...</Typography></Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: COLOR_DARK, paddingY: 1 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* LOGO Y NOMBRE */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box 
            component="img"
            src={logoUrl}
            alt="Logo"
            sx={{
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid ${COLOR_PRIMARY}`
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_LIGHT, letterSpacing: 1 }}>
            {siteName}
          </Typography>
        </Box>

        {/* ========================================================= */}
        {/* VISTA DE ESCRITORIO (PC) - Se oculta en móviles (xs: none) */}
        {/* ========================================================= */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
          
          <Button 
            onClick={handleAppExploreClick}
            sx={{ 
              color: COLOR_LIGHT,
              fontWeight: '500',
              textTransform: 'none',
              '&:hover': { color: COLOR_PRIMARY, backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Explora Nuestra App
          </Button>

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
                backgroundColor: 'rgba(253, 126, 20, 0.1)'
              }
            }}
          >
            Regístrate
          </Button>

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
                backgroundColor: COLOR_PRIMARY,
                opacity: 0.9,
              }
            }}
          >
            Inicio de Sesión
          </Button>
        </Box>


        {/* ========================================================= */}
        {/* VISTA MÓVIL (CELULAR) - Solo visible en xs (xs: flex)     */}
        {/* ========================================================= */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton 
                onClick={handleOpenMenu}
                sx={{ 
                    color: COLOR_PRIMARY, 
                    border: `1px solid ${COLOR_PRIMARY}`,
                    padding: 1
                }}
            >
                <PersonIcon />
            </IconButton>

            {/* Menú desplegable con las 2 opciones */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        backgroundColor: '#FFF', // Fondo blanco limpio
                        mt: 1.5,
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.1)'
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Opción 1: Regístrate (Color Naranja) */}
                <MenuItem onClick={handleRegisterClick} sx={{ color: COLOR_ACCENT_RED, fontWeight: 'bold' }}>
                    Regístrate
                </MenuItem>

                {/* Opción 2: Inicio de Sesión (Color Azul) */}
                <MenuItem onClick={handleLoginClick} sx={{ color: COLOR_PRIMARY, fontWeight: 'bold' }}>
                    Inicio de Sesión
                </MenuItem>
            </Menu>
        </Box>

      </Toolbar>
    </AppBar>
  );
}