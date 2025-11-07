import React, { useState, useEffect } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Avatar, 
    Box,
    Badge,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme, 
    // useMediaQuery ya no es necesario aquí para el diseño principal
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// === PALETA DE COLORES (Definición para estilos consistentes) ===
const COLOR_AZUL_ELECTRICO = '#00BFFF'; 
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121'; // Nuevo: Para texto e íconos principales
const COLOR_GRIS_OSCURO = '#333333'; // Para texto secundario

// Función de mapeo de roles (simplificada para mostrar en el Header)
const getRolDisplayName = (rol) => {
    const roles = {
        'admin': 'Admin',
        'gestor': 'Gestor',
        'control_acceso': 'Control',
        'cliente': 'Cliente'
    };
    return roles[rol] || rol;
};

export default function Header({ onMenuClick, handleAvatarClick, drawerWidth = 240 }) {
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const theme = useTheme(); 
    
    // Usamos una URL genérica para el logo si el hook no está activo
    const logoUrl = '/ruta/a/tu/logo.png'; 
    
    // Estados y lógica de Notificaciones
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    useEffect(() => {
        if (user && profile?.rol === 'admin') {
            // fetchNotifications(); 
            setNotifications([{ id_notificacion: 1, tipo: 'nuevo_usuario', mensaje: 'Usuario pendiente', titulo: 'Nuevo Registro' }]);
            setUnreadCount(1);
        }
    }, [user, profile]);

    const handleNotificationClick = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        console.log(`Marcando notificación ${notificationId} como leída...`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.filter(notif => notif.id_notificacion !== notificationId));
    };

    const handleGoToUsers = () => {
        navigate('/usuarios');
        handleNotificationClose();
    };

    const getNotificationIcon = (tipo) => {
        switch (tipo) {
            case 'nuevo_usuario':
                // Ícono de color oscuro sobre fondo de notificación blanco
                return <PersonAddIcon sx={{ color: COLOR_AZUL_ELECTRICO }} />; 
            case 'usuario_aprobado':
                return <CheckCircleIcon sx={{ color: COLOR_VERDE_LIMA }} />;
            default:
                return <EmailIcon sx={{ color: COLOR_GRIS_OSCURO }} />;
        }
    };

    const getNotificationText = (notificacion) => {
        switch (notificacion.tipo) {
            case 'nuevo_usuario':
                return "Nuevo usuario registrado";
            default:
                return notificacion.titulo;
        }
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        return name.charAt(0).toUpperCase();
    };
    
    const handleAvatarClickInternal = (e) => {
        if (handleAvatarClick) {
            handleAvatarClick(e);
        } else {
            navigate('/profile');
        }
    };

    return (
        <AppBar 
            position="fixed"
            elevation={0} // Eliminamos la elevación por defecto
            sx={{
                // 🚀 ESTILOS MODERNIZADOS: Fondo blanco y sombra sutil
                backgroundColor: COLOR_BLANCO, 
                color: COLOR_NEGRO_SUAVE, // Color por defecto para íconos/texto
                borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
                boxShadow: '0 1px 10px rgba(0, 0, 0, 0.08)', // Sombra para efecto flotante
                
                // Estas líneas mantienen la barra alineada con el Drawer en desktop
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
                zIndex: theme.zIndex.drawer + 1, 
            }}
        >
            <Toolbar sx={{ 
                justifyContent: 'space-between', 
                minHeight: { xs: 56, sm: 64 },
                pr: { xs: 1, sm: 3 } // Padding a la derecha
            }}>
                
                {/* Botón de Menú (visible solo en móvil) */}
                <IconButton
                    size="large"
                    edge="start"
                    aria-label="open drawer"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' }, color: COLOR_NEGRO_SUAVE }} // <-- Ícono oscuro
                >
                    <MenuIcon />
                </IconButton>

                {/* Título y Logo: Solo visible en móvil (xs) */}
                <Box 
                    sx={{ 
                        display: { xs: 'flex', md: 'none' }, 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        flexGrow: { xs: 1, md: 0 },
                    }} 
                    onClick={() => navigate('/dashboard')}
                >
                    {/* Logo */}
                    <img src={logoUrl} alt="Logo" style={{ width: '40px', height: 'auto', padding: '2px', marginRight: '8px' }} />
                    
                    {/* Nombre App */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 'bold',
                            color: COLOR_NEGRO_SUAVE, // <-- Texto oscuro
                        }}
                    >
                        OlympiaHub
                    </Typography>
                </Box>

                {/* Este Box es el espaciador principal (flexGrow 1) */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Nombre del usuario (Oculto en xs) */}
                {profile && profile.nombre && (
                    <Typography variant="body2" sx={{ 
                        color: COLOR_NEGRO_SUAVE, // <-- Texto oscuro
                        mr: 2, 
                        fontSize: '1rem', 
                        fontWeight: 'medium',
                        display: { xs: 'none', sm: 'block' } 
                    }}>
                        {profile.nombre}
                    </Typography>
                )}

                {/* Icono de Notificaciones (solo para admin) */}
                {user && profile?.rol === 'admin' && (
                    <IconButton 
                        color="inherit" 
                        onClick={handleNotificationClick}
                        sx={{ mr: 1, color: COLOR_NEGRO_SUAVE }} // <-- Ícono oscuro
                    >
                        <Badge badgeContent={unreadCount} sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: COLOR_NARANJA_VIBRANTE 
                            }
                        }}>
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                )}

                {/* Menú de Notificaciones */}
                <Menu
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleNotificationClose}
                    PaperProps={{
                        sx: { width: 400, maxHeight: 400 }
                    }}
                >
                    <MenuItem disabled>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Notificaciones {unreadCount > 0 && `(${unreadCount})`}
                        </Typography>
                    </MenuItem>
                    <Divider />
                    
                    {notifications.length === 0 ? (
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                No hay notificaciones nuevas
                            </Typography>
                        </MenuItem>
                    ) : (
                        notifications.slice(0, 5).map((notification) => (
                            <MenuItem 
                                key={notification.id_notificacion}
                                onClick={() => handleMarkAsRead(notification.id_notificacion)}
                                sx={{ 
                                    borderLeft: notification.tipo === 'nuevo_usuario' ? `4px solid ${COLOR_AZUL_ELECTRICO}` : 'none'
                                }}
                            >
                                <ListItemIcon>
                                    {getNotificationIcon(notification.tipo)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={getNotificationText(notification)}
                                    secondary={notification.mensaje}
                                    primaryTypographyProps={{ 
                                        fontWeight: 'medium'
                                    }}
                                />
                            </MenuItem>
                        ))
                    )}
                    
                    {notifications.length > 0 && (
                        <>
                            <Divider />
                            <MenuItem onClick={handleGoToUsers}>
                                <ListItemText 
                                    primary="Ver todos los usuarios pendientes" 
                                    primaryTypographyProps={{ 
                                        textAlign: 'center',
                                        color: COLOR_AZUL_ELECTRICO,
                                        fontWeight: 'bold'
                                    }}
                                />
                            </MenuItem>
                        </>
                    )}
                </Menu>

                {/* Avatar del Usuario */}
                {user && (
                    <Box sx={{ p: 0.5 }}>
                        <IconButton onClick={handleAvatarClickInternal} sx={{ p: 0 }}>
                            <Avatar 
                                sx={{ 
                                    bgcolor: COLOR_VERDE_LIMA, 
                                    color: COLOR_NEGRO_SUAVE, // <-- Letra oscura para buen contraste con verde
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                {getInitials(profile?.nombre || 'A')}
                            </Avatar>
                        </IconButton>
                    </Box>
                )}

            </Toolbar>
        </AppBar>
    );
}