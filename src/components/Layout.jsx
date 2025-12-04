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
    Toolbar,
    IconButton,
    SwipeableDrawer,
    Badge
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
    Menu as MenuIcon,
    Close,
    Home,
    Sports
} from '@mui/icons-material';

import Header from './Header';

// === PALETA DE COLORES Y TIPOGRAFÍA ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_GRIS_CLARO_FONDO = '#F9F9F9';
const COLOR_GRIS_OSCURO = '#333333';
const DRAWER_WIDTH_MOBILE = 280;
const DRAWER_WIDTH_DESKTOP = 240;
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
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const location = useLocation();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
        setAnchorEl(null);
    };

    const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
    const handleDrawerClose = () => setDrawerOpen(false);

    // Menú de navegación optimizado para mobile
    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'gestor', 'control_acceso', 'cliente'], guest: true },
        { text: 'Reservar', icon: <CalendarMonth />, path: '/reservar', roles: ['cliente', 'gestor'], guest: true },
        { text: 'Espacios', icon: <Stadium />, path: '/espacios', roles: ['admin', 'gestor'] },
        { text: 'Canchas', icon: <SportsSoccer />, path: '/canchas', roles: ['admin', 'gestor'] },
        { text: 'Disciplinas', icon: <Category />, path: '/disciplinas', roles: ['admin'] },
        { text: 'Mis Reservas', icon: <CalendarMonth />, path: '/mis-reservas', roles: ['cliente'] },
        { text: 'Calificaciones', icon: <Star />, path: '/calificaciones', roles: ['cliente', 'admin'] },
        { text: 'Mi Billetera', icon: <AccountBalanceWallet />, path: '/wallet', roles: ['cliente'] },
        { text: 'Reservas', icon: <CalendarMonth />, path: '/reservas', roles: ['admin', 'gestor', 'control_acceso'] },
        { text: 'Control Acceso', icon: <QrCodeScanner />, path: '/control-acceso', roles: ['control_acceso'] },
        //{ text: 'Reportes', icon: <Assessment />, path: '/reportes', roles: ['admin'] },
        { text: 'Usuarios', icon: <People />, path: '/usuarios', roles: ['admin'] },
        { text: 'Cupones', icon: <Star />, path: '/cupones', roles: ['admin'] },
    ];

    // Versión mobile-friendly del menú (menos items visibles para roles específicos)
    const getMobileMenuItems = () => {
        if (isMobile) {
            // En móvil, mostramos menos items para mejor UX
            const essentialItems = menuItems.filter(item =>
                (!user && item.guest) ||
                (user && profile && item.roles.includes(profile.rol))
            );

            // Para cliente en móvil, priorizar items clave
            if (profile?.rol === 'cliente') {
                return essentialItems.filter(item =>
                    ['Dashboard', 'Reservar', 'Mis Reservas', 'Calificaciones', 'Mi Billetera'].includes(item.text)
                );
            }

            // Para admin en móvil, agrupar algunos items
            if (profile?.rol === 'admin') {
                return essentialItems.filter(item =>
                    !['Cupones', 'Reportes'].includes(item.text) // Estos podrían ir en submenú
                );
            }

            return essentialItems.slice(0, 6); // Limitar a 6 items en móvil
        }

        return menuItems.filter(item =>
            (!user && item.guest) ||
            (user && profile && item.roles.includes(profile.rol))
        );
    };

    const filteredMenuItems = getMobileMenuItems();

    const logoUrl = '/logo.png';

    const drawer = (
        <Box
            className="h-full"
            sx={{
                backgroundColor: COLOR_NEGRO_SUAVE,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                width: isMobile ? DRAWER_WIDTH_MOBILE : DRAWER_WIDTH_DESKTOP
            }}
        >
            {/* Header del drawer móvil */}
            {isMobile && (
                <Box sx={{
                    backgroundColor: COLOR_VERDE_LIMA,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderBottom: `2px solid ${COLOR_AZUL_ELECTRICO}`
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <img
                            src={logoUrl}
                            alt="Logo OlympiaHub"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                objectFit: 'contain'
                            }}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/vite.svg"; }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 'bold',
                                color: COLOR_NEGRO_SUAVE,
                            }}
                        >
                            OlympiaHub
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleDrawerClose}
                        size="small"
                        sx={{
                            color: COLOR_NEGRO_SUAVE,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            )}

            {/* Toolbar con logo y nombre: VERDE LIMA (solo en desktop) */}
            {!isMobile && (
                <Toolbar
                    sx={{
                        backgroundColor: COLOR_VERDE_LIMA,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '64px !important',
                        px: 2,
                    }}
                >
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
                        <img
                            src={logoUrl}
                            alt="Logo OlympiaHub"
                            style={{
                                width: '40px',
                                height: 'auto',
                                padding: '2px',
                                marginRight: '8px'
                            }}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/vite.svg"; }}
                        />
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            sx={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 'bold',
                                color: COLOR_NEGRO_SUAVE,
                                textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                                fontSize: { md: '1.25rem', lg: '1.5rem' }
                            }}
                        >
                            OlympiaHub
                        </Typography>
                    </Box>
                </Toolbar>
            )}

            {/* Información del usuario en móvil */}
            {isMobile && user && (
                <Box sx={{
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderBottom: `1px solid ${COLOR_GRIS_OSCURO}20`
                }}>
                    <Typography variant="subtitle1" sx={{
                        color: COLOR_BLANCO,
                        fontWeight: 'bold',
                        fontFamily: 'Montserrat, sans-serif',
                        mb: 0.5
                    }}>
                        {profile?.nombre} {profile?.apellido || ''}
                    </Typography>
                    <Typography variant="caption" sx={{
                        color: COLOR_VERDE_LIMA,
                        display: 'block'
                    }}>
                        {getRolDisplayName(profile?.rol)}
                    </Typography>
                    <Typography variant="caption" sx={{
                        color: 'rgba(255,255,255,0.7)',
                        display: 'block',
                        mt: 0.5
                    }}>
                        {profile?.email}
                    </Typography>
                </Box>
            )}

            {/* Mensaje para invitados */}
            {!user && (
                <Box sx={{
                    p: 2,
                    m: 1.5,
                    borderRadius: '8px',
                    backgroundColor: `${COLOR_NARANJA_VIBRANTE}15`,
                    borderLeft: `3px solid ${COLOR_NARANJA_VIBRANTE}`
                }}>
                    <Typography variant="body2" sx={{
                        color: COLOR_BLANCO,
                        fontWeight: 'medium',
                        mb: 1.5
                    }}>
                        <Box component="strong" sx={{ color: COLOR_VERDE_LIMA }}>
                            Modo Invitado
                        </Box>
                        <br />
                        Regístrate para acceder a todas las funciones
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PersonAdd />}
                            onClick={() => {
                                navigate('/register');
                                handleDrawerClose();
                            }}
                            fullWidth={isMobile}
                            sx={{
                                backgroundColor: COLOR_AZUL_ELECTRICO,
                                '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 },
                                textTransform: 'none',
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                py: 0.5
                            }}
                        >
                            Registrarse
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Login />}
                            onClick={() => {
                                navigate('/login');
                                handleDrawerClose();
                            }}
                            fullWidth={isMobile}
                            sx={{
                                borderColor: COLOR_BLANCO,
                                color: COLOR_BLANCO,
                                textTransform: 'none',
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                py: 0.5,
                                '&:hover': {
                                    borderColor: COLOR_VERDE_LIMA,
                                    color: COLOR_VERDE_LIMA
                                }
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Lista de Items */}
            <List sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 1,
                py: 0,
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255,255,255,0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: COLOR_AZUL_ELECTRICO,
                    borderRadius: '3px',
                }
            }}>
                {filteredMenuItems.map((item) => {
                    const isActive = location.pathname.includes(item.path) && item.path !== '/'
                        ? location.pathname.startsWith(item.path)
                        : location.pathname === item.path;

                    return (
                        <ListItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            onClick={handleDrawerClose}
                            selected={isActive}
                            sx={{
                                borderRadius: '8px',
                                mb: 0.5,
                                px: 2,
                                py: isMobile ? 1.25 : 1,
                                color: COLOR_BLANCO,
                                fontWeight: 'normal',
                                minHeight: isMobile ? '48px' : '44px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&.Mui-selected, &.Mui-selected:hover': {
                                    backgroundColor: COLOR_GRIS_OSCURO,
                                    color: COLOR_VERDE_LIMA,
                                    fontWeight: 'bold',
                                    '& .MuiListItemIcon-root': {
                                        color: COLOR_VERDE_LIMA,
                                    }
                                },
                                textDecoration: 'none',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive ? COLOR_VERDE_LIMA : COLOR_BLANCO,
                                    minWidth: isMobile ? '48px' : '40px'
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    sx: {
                                        fontFamily: 'Roboto, sans-serif',
                                        fontWeight: 'medium',
                                        fontSize: isMobile ? '0.9rem' : '0.875rem'
                                    }
                                }}
                            />
                            {!user && item.guest && (
                                <Typography variant="caption" sx={{
                                    color: COLOR_NARANJA_VIBRANTE,
                                    fontSize: '0.65rem',
                                    ml: 1
                                }}>
                                    Demo
                                </Typography>
                            )}
                            {isActive && (
                                <Box sx={{
                                    width: '4px',
                                    height: '20px',
                                    backgroundColor: COLOR_VERDE_LIMA,
                                    borderRadius: '2px',
                                    ml: 1
                                }} />
                            )}
                        </ListItem>
                    );
                })}
            </List>

            {/* Pie de página (Cerrar Sesión o más items en mobile) */}
            {user && (
                <Box sx={{
                    p: 1.5,
                    borderTop: `1px solid ${COLOR_GRIS_OSCURO}20`,
                    backgroundColor: 'rgba(0,0,0,0.2)'
                }}>
                    <ListItem
                        onClick={handleLogout}
                        sx={{
                            borderRadius: '8px',
                            color: COLOR_NARANJA_VIBRANTE,
                            py: isMobile ? 1.25 : 1,
                            '&:hover': {
                                backgroundColor: `${COLOR_NARANJA_VIBRANTE}15`,
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: COLOR_NARANJA_VIBRANTE, minWidth: isMobile ? '48px' : '40px' }}>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText
                            primary="Cerrar Sesión"
                            primaryTypographyProps={{
                                sx: {
                                    color: COLOR_NARANJA_VIBRANTE,
                                    fontWeight: 'bold',
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: isMobile ? '0.9rem' : '0.875rem'
                                }
                            }}
                        />
                    </ListItem>
                </Box>
            )}

            {/* Versión mobile: indicador de más items disponibles */}
            {isMobile && filteredMenuItems.length < menuItems.filter(item =>
                (user && profile && item.roles.includes(profile.rol)) || (!user && item.guest)
            ).length && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Más opciones disponibles en la versión de escritorio
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: COLOR_GRIS_CLARO_FONDO,
            flexDirection: { xs: 'column', md: 'row' }
        }}>
            {/* 1. HEADER (AppBar fijo) */}
            <Header
                onMenuClick={handleDrawerToggle}
                user={user}
                profile={profile}
                handleAvatarClick={handleAvatarClick}
                headerColor={COLOR_AZUL_ELECTRICO}
                drawerWidth={isMobile ? 0 : DRAWER_WIDTH_DESKTOP}
                logoUrl={logoUrl}
            />

            {/* Menú de usuario (al hacer click en el avatar) */}
            {user && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{
                        mt: '45px',
                        '& .MuiPaper-root': {
                            borderRadius: '12px',
                            minWidth: '200px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }
                    }}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem disabled sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: COLOR_GRIS_OSCURO }}>
                            {profile?.nombre} {profile?.apellido || ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLOR_AZUL_ELECTRICO }}>
                            {getRolDisplayName(profile?.rol)}
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            navigate('/dashboard');
                            handleMenuClose();
                        }}
                        sx={{ py: 1.25 }}
                    >
                        <ListItemIcon>
                            <Dashboard fontSize="small" sx={{ color: COLOR_AZUL_ELECTRICO }} />
                        </ListItemIcon>
                        Dashboard
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            navigate('/perfil');
                            handleMenuClose();
                        }}
                        sx={{ py: 1.25 }}
                    >
                        <ListItemIcon>
                            <People fontSize="small" sx={{ color: COLOR_VERDE_LIMA }} />
                        </ListItemIcon>
                        Mi Perfil
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.25 }}>
                        <ListItemIcon>
                            <Logout fontSize="small" sx={{ color: COLOR_NARANJA_VIBRANTE }} />
                        </ListItemIcon>
                        Cerrar Sesión
                    </MenuItem>
                </Menu>
            )}

            {/* 2. DRAWER (SIDEBAR) */}
            {isMobile ? (
                <SwipeableDrawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={handleDrawerClose}
                    onOpen={() => setDrawerOpen(true)}
                    swipeAreaWidth={20}
                    disableSwipeToOpen={false}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH_MOBILE,
                            borderRight: 'none',
                            boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
                        },
                    }}
                >
                    {drawer}
                </SwipeableDrawer>
            ) : (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH_DESKTOP,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: DRAWER_WIDTH_DESKTOP,
                            boxSizing: 'border-box',
                            height: '100vh',
                            borderRight: 'none',
                            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                            top: 0,
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.leavingScreen,
                            }),
                        },
                        display: { xs: 'none', md: 'block' }
                    }}
                >
                    {drawer}
                </Drawer>
            )}

            {/* 3. CONTENIDO PRINCIPAL */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    width: '100%',
                    ml: { md: `${DRAWER_WIDTH_DESKTOP}px` },
                    mt: { xs: '56px', sm: '64px' }, // Compensar altura del header
                    minHeight: 'calc(100vh - 56px)',
                    [theme.breakpoints.up('sm')]: {
                        mt: '64px',
                        minHeight: 'calc(100vh - 64px)'
                    }
                }}
            >
                <Outlet />
            </Box>

            {/* 4. BOTTOM NAVIGATION PARA MÓVIL (Opcional) */}
            {isMobile && user && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: COLOR_NEGRO_SUAVE,
                        borderTop: `1px solid ${COLOR_GRIS_OSCURO}`,
                        display: 'flex',
                        justifyContent: 'space-around',
                        py: 1,
                        zIndex: 1100,
                        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {[
                        { icon: <Dashboard />, label: 'Inicio', path: '/dashboard' },
                        { icon: <CalendarMonth />, label: 'Reservar', path: '/reservar' },
                        { icon: <SportsSoccer />, label: 'Canchas', path: '/canchas' },
                        { icon: <People />, label: 'Perfil', onClick: handleAvatarClick },
                    ].filter(item => {
                        if (item.path === '/reservar' && profile?.rol !== 'cliente' && profile?.rol !== 'gestor') return false;
                        if (item.path === '/canchas' && !['admin', 'gestor'].includes(profile?.rol)) return false;
                        return true;
                    }).map((item, index) => (
                        <IconButton
                            key={index}
                            onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                            sx={{
                                flexDirection: 'column',
                                color: location.pathname === item.path ? COLOR_VERDE_LIMA : 'rgba(255,255,255,0.7)',
                                padding: '8px',
                                minWidth: '64px'
                            }}
                        >
                            {item.icon}
                            <Typography variant="caption" sx={{
                                fontSize: '0.6rem',
                                mt: 0.5,
                                color: location.pathname === item.path ? COLOR_VERDE_LIMA : 'rgba(255,255,255,0.7)'
                            }}>
                                {item.label}
                            </Typography>
                        </IconButton>
                    ))}
                </Box>
            )}
        </Box>
    );
}