import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Typography,
  CircularProgress,
  IconButton // Necesario para el menú del avatar, si el Header lo usa
} from '@mui/material';
import {
  Dashboard,
  SportsSoccer,
  CalendarMonth,
  Star,
  AccountBalanceWallet,
  Stadium,
  People,
  Logout,
  Category,
  QrCodeScanner,
  Assessment,
  Login,
  PersonAdd,
  Visibility,
  VisibilityOff // Importaciones necesarias
} from '@mui/icons-material';

// 💡 Importar el nuevo Header que creaste en components/Header.jsx
import Header from './Header'; 

// === PALETA DE COLORES Y TIPOGRAFÍA ===
const COLOR_AZUL_ELECTRICO = '#00BFFF'; // Primary 
const COLOR_VERDE_LIMA = '#A2E831';    // Secondary
const COLOR_NARANJA_VIBRANTE = '#FD7E14'; // Accent
const COLOR_GRIS_CLARO_FONDO = '#F9F9F9'; // Fondo claro para el sidebar
const COLOR_GRIS_OSCURO = '#333333';
const COLOR_BLANCO = '#FFFFFF';
const DRAWER_WIDTH = 240; // Tu ancho actual


const getRolDisplayName = (rol) => {
  const roles = {
    'admin': 'Administrador',
    'gestor': 'Gestor de Espacios',
    'control_acceso': 'Control de Acceso',
    'cliente': 'Cliente'
  };
  return roles[rol] || rol;
};

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // 💡 Hook para saber la ruta actual y resaltar el link activo
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setAnchorEl(null);
  };
  
  // Handlers para el menú de avatar
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen); // Handler para el botón del Header

  // Menú de navegación (se mantiene igual, es correcto)
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'gestor', 'control_acceso', 'cliente'], guest: true },
    { text: 'Reservar Cancha', icon: <CalendarMonth />, path: '/reservar', roles: ['cliente', 'gestor'], guest: true },
    { text: 'Espacios Deportivos', icon: <Stadium />, path: '/espacios', roles: ['admin', 'gestor'] },
    { text: 'Canchas', icon: <SportsSoccer />, path: '/canchas', roles: ['admin', 'gestor'] },
    { text: 'Disciplinas', icon: <Category />, path: '/disciplinas', roles: ['admin', 'gestor'] },
    { text: 'Mis Reservas', icon: <CalendarMonth />, path: '/mis-reservas', roles: ['cliente'] },
    { text: 'Calificaciones', icon: <Star />, path: '/calificaciones', roles: ['cliente'] },
    { text: 'Mi Billetera', icon: <AccountBalanceWallet />, path: '/wallet', roles: ['cliente'] },
    { text: 'Reservas', icon: <CalendarMonth />, path: '/reservas', roles: ['admin', 'gestor', 'control_acceso'] },
    { text: 'Control Acceso', icon: <QrCodeScanner />, path: '/control-acceso', roles: ['control_acceso'] },
    { text: 'Reportes', icon: <Assessment />, path: '/reportes', roles: ['admin'] },
    { text: 'Usuarios', icon: <People />, path: '/usuarios', roles: ['admin'] },
    { text: 'Cupones', icon: <Star />, path: '/cupones', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    (!user && item.guest) || 
    (user && item.roles.includes(profile?.rol)) 
  );

  const drawer = (
    <Box 
        className="h-full" 
        sx={{ 
            backgroundColor: COLOR_GRIS_CLARO_FONDO, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column' 
        }}
    >
        {/* Encabezado del Drawer (OlympiaHub y Rol) */}
        <Box 
            className="p-4"
            sx={{
                background: `linear-gradient(to right, ${COLOR_AZUL_ELECTRICO}, ${COLOR_VERDE_LIMA})`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        >
            <Typography variant="caption" className="text-white/80 text-center block mt-1" sx={{ fontWeight: 'bold', fontSize: '1.2rem', pb: 0.5, pt: 1 }}>
                {user ? getRolDisplayName(profile?.rol) : 'Modo Invitado'}
            </Typography>
        </Box>

        {/* Mensaje para invitados */}
        {!user && (
             <Box className="p-3 m-2 rounded"
                  sx={{ backgroundColor: `${COLOR_NARANJA_VIBRANTE}10`, borderLeft: `4px solid ${COLOR_NARANJA_VIBRANTE}` }}>
                 <Typography variant="caption" sx={{ color: COLOR_GRIS_OSCURO, fontWeight: 'medium' }}>
                     <strong>Modo Invitado</strong><br/>
                     Regístrate para acceder a todas las funciones
                 </Typography>
                 <Box className="flex flex-col gap-1 mt-2">
                     <Button
                         variant="contained"
                         size="small"
                         startIcon={<PersonAdd />}
                         onClick={() => navigate('/register')}
                         sx={{
                             backgroundColor: COLOR_AZUL_ELECTRICO,
                             '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 },
                             textTransform: 'none'
                         }}
                     >
                         Registrarse
                     </Button>
                     <Button
                         variant="outlined"
                         size="small"
                         startIcon={<Login />}
                         onClick={() => navigate('/login')}
                         sx={{
                             borderColor: COLOR_AZUL_ELECTRICO,
                             color: COLOR_AZUL_ELECTRICO,
                             textTransform: 'none'
                         }}
                     >
                         Iniciar Sesión
                     </Button>
                 </Box>
             </Box>
         )}

        {/* Lista de Items */}
        <List className="px-2 mt-2" sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path; // Verificar si el item está activo
                return (
                    <ListItem
                        key={item.text}
                        component={Link}
                        to={item.path}
                        onClick={() => setDrawerOpen(false)}
                        // 💡 Usamos `selected` para aplicar el estilo de activo
                        selected={isActive} 
                        sx={{
                            borderRadius: '8px', 
                            mb: 1,
                            paddingLeft: 2,
                            color: COLOR_GRIS_OSCURO,
                            fontWeight: 'medium',
                            
                            // Estilo de Hover Moderno
                            '&:hover': {
                                backgroundColor: `${COLOR_AZUL_ELECTRICO}10`, 
                                boxShadow: `0 1px 4px ${COLOR_AZUL_ELECTRICO}40`,
                                transform: 'translateX(3px)',
                                transition: 'all 0.3s ease-in-out',
                            },
                            // Estilo de Item Activo
                            '&.Mui-selected, &.Mui-selected:hover': {
                                backgroundColor: `${COLOR_AZUL_ELECTRICO}20`, 
                                borderLeft: `4px solid ${COLOR_VERDE_LIMA}`, // Borde lateral Lima
                                color: COLOR_GRIS_OSCURO,
                                fontWeight: 'bold',
                                '& .MuiListItemIcon-root': {
                                    color: COLOR_VERDE_LIMA, // Ícono se vuelve Lima
                                }
                            },
                            textDecoration: 'none',
                        }}
                    >
                        <ListItemIcon 
                            sx={{ 
                                color: isActive ? COLOR_VERDE_LIMA : COLOR_AZUL_ELECTRICO // Ícono en Azul si no activo
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                sx: {
                                    fontFamily: 'Roboto, sans-serif',
                                    fontWeight: 'medium' 
                                }
                            }}
                        />
                        {!user && item.guest && (
                            <Typography variant="caption" sx={{ color: COLOR_NARANJA_VIBRANTE }}>
                                Demo
                            </Typography>
                        )}
                    </ListItem>
                );
            })}
        </List>
        
        {/* Pie de página (Cerrar Sesión) */}
        {user && (
            <Box sx={{ p: 2, borderTop: `1px solid ${COLOR_GRIS_OSCURO}10` }}>
                <ListItem
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '8px',
                        color: '#F06A3F', // Naranja/Rojo para Cerrar Sesión
                        '&:hover': {
                            backgroundColor: '#F06A3F10', // Fondo rojo/naranja claro
                            transform: 'translateX(3px)',
                            transition: 'all 0.3s ease-in-out',
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: '#F06A3F' }}>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText
                        primary="Cerrar Sesión"
                        primaryTypographyProps={{ 
                            sx: { 
                                color: '#F06A3F', 
                                fontWeight: 'bold',
                                fontFamily: 'Roboto, sans-serif',
                            } 
                        }}
                    />
                </ListItem>
            </Box>
        )}
    </Box>
  );

  return (
    <Box className="flex min-h-screen bg-gray-50">
      
      {/* 1. USAR EL NUEVO HEADER EXTERNO (components/Header.jsx) */}
      <Header 
        onMenuClick={handleDrawerToggle}
        user={user}
        profile={profile}
        handleAvatarClick={handleAvatarClick}
      />

      {/* Menú de usuario (solo para autenticados) - Se mantiene aquí ya que usa el estado 'anchorEl' del Layout */}
      {user && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Typography className="font-body">{profile?.email}</Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography className="text-sm text-gray-500">
              {getRolDisplayName(profile?.rol)}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Cerrar Sesión
          </MenuItem>
        </Menu>
      )}

      {/* 2. DRAWER (SIDEBAR) */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: isMobile ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
          },
          display: { xs: 'block', md: 'block' }
        }}
      >
        {/* IMPORTANTE: Compensación para el Header fijo en el Drawer */}
        <Box sx={theme.mixins.toolbar} /> 
        {drawer}
      </Drawer>

      {/* 3. CONTENIDO PRINCIPAL */}
      <Box
        component="main"
        className="flex-grow p-4 transition-all duration-300"
        sx={{
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`, 
          marginLeft: isMobile ? 0 : `${DRAWER_WIDTH}px`,
        }}
      >
        {/* COMPENSACIÓN CRUCIAL PARA EL CONTENIDO */}
        <Box sx={theme.mixins.toolbar} /> 
        
        <Outlet />
      </Box>
    </Box>
  );
}