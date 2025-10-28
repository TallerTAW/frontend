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
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../hooks/useContent';
import { notificationsApi } from '../api/notifications';

// === PALETA DE COLORES Y TIPOGRAFÍA ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_GRIS_OSCURO = '#333333';
const COLOR_BLANCO = '#FFFFFF';

export default function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const { content, loading, error } = useContent();
    const logoUrl = content.header_logo || '/static/uploads/team.jpg';
    
    // Estados para notificaciones
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    useEffect(() => {
        if (user && profile?.rol === 'admin') {
            fetchNotifications();
        }
    }, [user, profile]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationsApi.getUnread();
            setNotifications(data);
            setUnreadCount(data.length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationClick = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            // Actualizar lista local
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id_notificacion === notificationId 
                    ? { ...notif, leida: true } 
                    : notif
                )
            );
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleGoToUsers = () => {
        navigate('/usuarios');
        handleNotificationClose();
    };

    const getNotificationIcon = (tipo) => {
        switch (tipo) {
            case 'nuevo_usuario':
                return <PersonAddIcon color="primary" />;
            case 'usuario_aprobado':
                return <CheckCircleIcon color="success" />;
            default:
                return <EmailIcon color="info" />;
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

    // Función para obtener la inicial del nombre de usuario
    const getInitials = (name) => {
        if (!name) return 'A';
        return name.charAt(0).toUpperCase();
    };

    const handleAvatarClick = () => {
        navigate('/profile');
    };

    return (
        <AppBar 
            position="fixed"
            sx={{
                background: `linear-gradient(90deg, ${COLOR_AZUL_ELECTRICO} 0%, ${COLOR_VERDE_LIMA} 50%, ${COLOR_NARANJA_VIBRANTE} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                transition: 'background 0.3s ease-in-out',
            }}
        >
            <Toolbar sx={{ 
                justifyContent: 'space-between', 
                minHeight: { xs: '56px', sm: '64px' }
            }}>
                {/* Botón de Menú */}
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 2, display: { md: 'none' } }}
                    onClick={onMenuClick}
                >
                    <MenuIcon />
                </IconButton>

                {/* Título y Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <Typography
                        variant="h4"
                        component="div"
                        sx={{
                            mr: 1,
                            color: COLOR_BLANCO,
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                        }}
                    >
                        <img src={logoUrl} alt="Logo" style={{ width: '80px', height: 'auto', padding: '2px', borderRadius: '15px' }} />
                    </Typography>
                </Box>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold',
                        color: COLOR_BLANCO,
                        textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        ml: { xs: 0, sm: 2 }
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    OlympiaHub
                </Typography>

                {/* Nombre del usuario */}
                {profile && profile.nombre && (
                    <Typography variant="body2" sx={{ color: COLOR_BLANCO, mr: 2, fontSize: '1rem' }}>
                        {profile.nombre} {profile.apellido}
                    </Typography>
                )}

                {/* Icono de Notificaciones (solo para admin) */}
                {user && profile?.rol === 'admin' && (
                    <IconButton 
                        color="inherit" 
                        onClick={handleNotificationClick}
                        sx={{ mr: 1 }}
                    >
                        <Badge badgeContent={unreadCount} color="error">
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
                                        fontWeight: notification.leida ? 'normal' : 'bold'
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
                                        color: 'primary',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </MenuItem>
                        </>
                    )}
                </Menu>

                {/* Avatar del Usuario */}
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                    <Avatar 
                        sx={{ 
                            bgcolor: COLOR_BLANCO, 
                            color: COLOR_GRIS_OSCURO, 
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.1)',
                            }
                        }}
                    >
                        {getInitials(profile?.nombre || 'Administrador')}
                    </Avatar>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}