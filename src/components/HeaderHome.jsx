// src/components/HeaderHome.jsx
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const sportyBlue = "#4dc0b5"; // Color turquesa/azul verdoso de tu diseño

export default function HeaderHome() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // Redirige a la ruta definida para Login.jsx
    navigate('/login'); 
  };

  return (
    // AppBar con el color de fondo de tu diseño
    <AppBar position="static" elevation={0} sx={{ backgroundColor: sportyBlue }}>
      <Toolbar>
        {/* SPORTIFY - Logo/Título a la izquierda */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          SPORTIFY
        </Typography>

        {/* Enlaces de Navegación (Complejas, Acerca de, Deportes) */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, mr: 3 }}>
          <Button color="inherit" sx={{ textTransform: 'none' }}>Complejas</Button>
          <Button color="inherit" sx={{ textTransform: 'none' }}>Acerca de</Button>
          <Button color="inherit" sx={{ textTransform: 'none' }}>Deportes</Button>
        </Box>

        {/* Botón de Inicio de Sesión */}
        <Button 
          variant="contained" 
          onClick={handleLoginClick}
          sx={{ 
            backgroundColor: 'white', 
            color: sportyBlue, // Color del texto igual al fondo de la barra
            fontWeight: 'bold',
            borderRadius: '20px', // Estilo de botón pill
            textTransform: 'none',
            px: 2 
          }}
        >
          Inicio de Sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
}