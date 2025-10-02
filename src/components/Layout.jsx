import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
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
  Payment,
} from '@mui/icons-material';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setAnchorEl(null);
  };

  // Menú basado en los roles REALES de tu backend
  const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['admin', 'gestor', 'control_acceso', 'cliente'] },
  
  // Admin y Gestor
  { text: 'Espacios Deportivos', icon: <Stadium />, path: '/espacios', roles: ['admin', 'gestor'] },
  { text: 'Canchas', icon: <SportsSoccer />, path: '/canchas', roles: ['admin', 'gestor'] },
  { text: 'Disciplinas', icon: <Category />, path: '/disciplinas', roles: ['admin', 'gestor'] },
  
  // Cliente
  { text: 'Reservar Cancha', icon: <CalendarMonth />, path: '/reservar', roles: ['cliente'] },
  { text: 'Mis Reservas', icon: <CalendarMonth />, path: '/mis-reservas', roles: ['cliente'] },
  { text: 'Calificaciones', icon: <Star />, path: '/calificaciones', roles: ['cliente'] },
  { text: 'Mi Billetera', icon: <AccountBalanceWallet />, path: '/wallet', roles: ['cliente'] },
  
  // Gestor y Admin para reservas generales
  { text: 'Reservas', icon: <CalendarMonth />, path: '/reservas', roles: ['admin', 'gestor', 'control_acceso'] },
  
  // Control de acceso
  { text: 'Control Acceso', icon: <QrCodeScanner />, path: '/control-acceso', roles: ['control_acceso'] },
  
  // Reportes (Admin)
  { text: 'Reportes', icon: <Assessment />, path: '/reportes', roles: ['admin'] },
  
  // Usuarios (Solo admin)
  { text: 'Usuarios', icon: <People />, path: '/usuarios', roles: ['admin'] },
  
  // Cupones (Admin)
  { text: 'Cupones', icon: <Star />, path: '/cupones', roles: ['admin'] },
];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(profile?.rol)
  );

  const drawer = (
    <Box className="h-full bg-gradient-to-b from-primary/10 to-secondary/10">
      <Box className="p-4 bg-gradient-to-r from-primary to-secondary">
        <Typography variant="h6" className="text-white font-title text-center">
          ReservaDeportiva
        </Typography>
      </Box>
      <List className="px-2 mt-4">
        {filteredMenuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            className="rounded-xl mb-2 hover:bg-primary/20 transition-all duration-300"
            sx={{
              '&:hover': {
                transform: 'translateX(8px)',
              },
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <ListItemIcon className="text-primary">{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              className="font-body"
              primaryTypographyProps={{
                className: "font-medium"
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const getRolDisplayName = (rol) => {
    const roles = {
      'admin': 'Administrador',
      'gestor': 'Gestor de Espacios',
      'control_acceso': 'Control de Acceso',
      'cliente': 'Cliente'
    };
    return roles[rol] || rol;
  };

  return (
    <Box className="flex min-h-screen bg-gray-50">
      <AppBar
        position="fixed"
        className="bg-gradient-to-r from-primary via-secondary to-accent shadow-lg"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(to right, #0f9fe1, #9eca3f, #fbab22)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="mr-4"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" className="flex-grow font-title">
            Sistema de Reservas
          </Typography>

          <Box className="flex items-center gap-2">
            <Typography className="hidden sm:block text-white font-body">
              {profile?.nombre || 'Usuario'}
            </Typography>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="text-white"
            >
              <Avatar className="bg-accent">
                {profile?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
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
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        className="flex-grow p-6 mt-16 transition-all duration-300"
        sx={{
          marginLeft: isMobile ? 0 : '240px',
          width: isMobile ? '100%' : 'calc(100% - 240px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}