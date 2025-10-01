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
  };

  const menuItems = [
    { text: 'Inicio', icon: <Dashboard />, path: '/', roles: ['admin_general', 'admin_facility', 'client', 'regulator'] },
    { text: 'Espacios Deportivos', icon: <Stadium />, path: '/facilities', roles: ['admin_general'] },
    { text: 'Deportes', icon: <Category />, path: '/sports', roles: ['admin_general'] },
    { text: 'Canchas', icon: <SportsSoccer />, path: '/courts', roles: ['admin_general', 'admin_facility'] },
    { text: 'Reservar', icon: <CalendarMonth />, path: '/book', roles: ['client'] },
    { text: 'Mis Reservas', icon: <CalendarMonth />, path: '/reservations', roles: ['client', 'admin_general', 'admin_facility'] },
    { text: 'Calificar', icon: <Star />, path: '/ratings', roles: ['client'] },
    { text: 'Billetera', icon: <AccountBalanceWallet />, path: '/wallet', roles: ['client'] },
    { text: 'Usuarios', icon: <People />, path: '/users', roles: ['admin_general', 'regulator'] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(profile?.role)
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
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            className="rounded-xl mb-2 hover:bg-primary/20 transition-all duration-300"
            sx={{
              '&:hover': {
                transform: 'translateX(8px)',
              },
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
              {profile?.full_name}
            </Typography>
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="text-white"
            >
              <Avatar className="bg-accent">
                {profile?.full_name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography className="font-body">{profile?.email}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography className="text-sm text-gray-500 capitalize">
                {profile?.role?.replace('_', ' ')}
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
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
