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
    Toolbar 
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
    PersonAdd
} from '@mui/icons-material';

import Header from './Header'; 

// === PALETA DE COLORES Y TIPOGRAFÍA ===
const COLOR_AZUL_ELECTRICO = '#00BFFF'; 
const COLOR_VERDE_LIMA = '#A2E831';    
const COLOR_NARANJA_VIBRANTE = '#FD7E14'; 
const COLOR_GRIS_CLARO_FONDO = '#F9F9F9';
const COLOR_GRIS_OSCURO = '#333333';
const DRAWER_WIDTH = 240; 
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121'; 

// Función de mapeo de roles
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
    const location = useLocation();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
        setAnchorEl(null);
    };
    
    const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen); 

    // Menú de navegación
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
        (user && profile && item.roles.includes(profile.rol)) 
    );

    // Ruta del logo: Asegúrate de que tu logo se llame 'logo.png' y esté en la carpeta 'public'.
    const logoUrl = '/logo.png'; 

    const drawer = (
        <Box 
            className="h-full" 
            sx={{ 
                backgroundColor: COLOR_NEGRO_SUAVE, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column' 
            }}
        >
            {/* Toolbar con logo y nombre: VERDE LIMA */}
            <Toolbar 
                sx={{ 
                    backgroundColor: COLOR_VERDE_LIMA, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    ...theme.mixins.toolbar, 
                    px: 2, 
                }}
            >
                {/* Logo y Nombre App SOLO EN MODO ESCRITORIO */}
                {!isMobile && (
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            cursor: 'pointer', 
                            flexGrow: 1, 
                            justifyContent: 'center', 
                        }} 
                        onClick={() => navigate('/dashboard')}
                    >
                        {/* Logo */}
                        <img 
                            src={logoUrl} 
                            alt="Logo OlympiaHub" 
                            style={{ width: '40px', height: 'auto', padding: '2px', marginRight: '8px' }} 
                            onError={(e) => { e.target.onerror = null; e.target.src="/vite.svg"; }}
                        />
                        
                        {/* Nombre App */}
                        <Typography
                            variant="h5" 
                            noWrap
                            component="div"
                            sx={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 'bold',
                                color: COLOR_NEGRO_SUAVE, 
                                textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                            }}
                        >
                            OlympiaHub
                        </Typography>
                    </Box>
                )}
            </Toolbar>


            {/* Mensaje para invitados */}
            {!user && (
                <Box className="p-3 m-2 rounded"
                    sx={{ backgroundColor: `${COLOR_NARANJA_VIBRANTE}10`, borderLeft: `4px solid ${COLOR_NARANJA_VIBRANTE}` }}>
                    <Typography variant="caption" sx={{ color: COLOR_BLANCO, fontWeight: 'medium' }}>
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
                                borderColor: COLOR_BLANCO, 
                                color: COLOR_BLANCO, 
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
                    // LÓGICA DE ACTIVACIÓN:
                    const isActive = location.pathname.includes(item.path) && item.path !== '/'
                        ? location.pathname.startsWith(item.path)
                        : location.pathname === item.path;
                    
                    return (
                        <ListItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            onClick={() => setDrawerOpen(false)}
                            selected={isActive} 
                            sx={{
                                borderRadius: '8px', 
                                mb: 0.5, 
                                paddingLeft: 2,
                                // Color por defecto: BLANCO (sobre fondo negro)
                                color: COLOR_BLANCO, 
                                fontWeight: 'normal',
                                
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                    transform: 'none', 
                                    transition: 'all 0.1s ease-in-out',
                                },
                                // 🚀 ESTILO CLAVE PARA RESALTAR LA OPCIÓN ACTIVA
                                '&.Mui-selected, &.Mui-selected:hover': {
                                    // Fondo: Gris Oscuro (sutil, como en tu última imagen)
                                    backgroundColor: COLOR_GRIS_OSCURO, 
                                    borderLeft: 'none', 
                                    // Texto: ¡VERDE LIMA!
                                    color: COLOR_VERDE_LIMA, 
                                    fontWeight: 'bold',
                                    boxShadow: 'none',
                                    '& .MuiListItemIcon-root': {
                                        // Ícono: ¡VERDE LIMA!
                                        color: COLOR_VERDE_LIMA, 
                                    }
                                },
                                textDecoration: 'none',
                            }}
                        >
                            <ListItemIcon 
                                sx={{ 
                                    // Si está activo (selected), usa VERDE LIMA, si no, usa BLANCO
                                    color: isActive ? COLOR_VERDE_LIMA : COLOR_BLANCO 
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
                                <Typography variant="caption" sx={{ color: COLOR_NARANJA_VIBRANTE, fontSize: '0.65rem' }}>
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
                            color: COLOR_NARANJA_VIBRANTE, 
                            '&:hover': {
                                backgroundColor: `${COLOR_NARANJA_VIBRANTE}10`,
                                transform: 'translateX(3px)',
                                transition: 'all 0.3s ease-in-out',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: COLOR_NARANJA_VIBRANTE }}>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText
                            primary="Cerrar Sesión"
                            primaryTypographyProps={{ 
                                sx: { 
                                    color: COLOR_NARANJA_VIBRANTE, 
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
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: COLOR_GRIS_CLARO_FONDO }}>
            
            {/* 1. HEADER (AppBar fijo) */}
            <Header 
                onMenuClick={handleDrawerToggle}
                user={user}
                profile={profile}
                handleAvatarClick={handleAvatarClick}
                headerColor={COLOR_AZUL_ELECTRICO} 
                drawerWidth={DRAWER_WIDTH} 
                logoUrl={logoUrl} 
            />

            {/* Menú de usuario (al hacer click en el avatar) */}
            {user && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{ mt: '45px' }}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem disabled>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {profile?.email}
                        </Typography>
                    </MenuItem>
                    <MenuItem disabled>
                        <Typography variant="caption" color="text.secondary">
                            {getRolDisplayName(profile?.rol)}
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <Logout fontSize="small" sx={{ color: COLOR_NARANJA_VIBRANTE }}/>
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
                    [`& .MuiDrawer-paper`]: {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        height: '100vh', 
                        borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                        top: 0,
                    },
                    display: { xs: 'block', md: 'block' }
                }}
            >
                {drawer} 
            </Drawer>

            {/* 3. CONTENIDO PRINCIPAL */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, 
                    ml: { md: `${DRAWER_WIDTH}px` }, 
                }}
            >
                <Toolbar /> 
                
                <Outlet />
            </Box>
        </Box>
    );
}