import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { usuariosApi } from '../api/usuarios';
import { Grid, Card, CardContent, Typography, Box, Button, CircularProgress, IconButton, useTheme, useMediaQuery, Paper, TextField } from '@mui/material';
import { Stadium, SportsSoccer, CalendarMonth, People, Refresh, Menu, AccountCircle, Sports } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import UnirseReservaButton from '../components/UnirseReservaButton';

// === PALETA DE COLORES PERSONALIZADA ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FFC107';
const COLOR_NARANJA_OSCURO = '#FD7E14';
const COLOR_NEGRO_FONDO = '#212121';
const COLOR_BLANCO = '#FFFFFF';

// Función para mapear las clases de color
function getColorValue(colorClass) {
    const colors = {
        'from-primary': COLOR_AZUL_ELECTRICO,
        'to-primary': COLOR_AZUL_ELECTRICO,
        'from-secondary': COLOR_VERDE_LIMA,
        'to-secondary': COLOR_VERDE_LIMA,
        'from-accent': COLOR_NARANJA_VIBRANTE,
        'to-accent': COLOR_NARANJA_VIBRANTE,
        'from-highlight': COLOR_NARANJA_OSCURO,
        'to-highlight': COLOR_NARANJA_OSCURO,
        'bg-primary': COLOR_AZUL_ELECTRICO,
        'bg-secondary': COLOR_VERDE_LIMA,
        'bg-accent': COLOR_NARANJA_OSCURO,
        'text-primary': COLOR_AZUL_ELECTRICO,
        'text-secondary': COLOR_VERDE_LIMA,
        'text-gray-600': COLOR_NARANJA_VIBRANTE,
        'text-gray-700': COLOR_NEGRO_FONDO,
    };
    return colors[colorClass] || COLOR_AZUL_ELECTRICO;
}

export default function Dashboard() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const isGuest = !user;
    
    // Detectar tamaño de pantalla
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    
    const [stats, setStats] = useState({
        espacios: 0,
        canchas: 0,
        reservas: 0,
        usuarios: 0,
    });
    
    const guestStats = {
        espacios: 5,
        canchas: 12,
        reservas: 0,
        usuarios: 0
    };
    
    const [loading, setLoading] = useState(true);
    const displayStats = isGuest ? guestStats : stats;
    const [showMobileInfo, setShowMobileInfo] = useState(false);
    const [codigoInput, setCodigoInput] = useState('');
    
    useEffect(() => {
        if (!isGuest) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [profile, isGuest]);
    
    const fetchStats = async () => {
        try {
            setLoading(true);
            if (profile?.rol === 'admin') {
                const [espaciosData, canchasData, reservasData, usuariosData] = await Promise.all([
                    espaciosApi.getAll().catch(() => []),
                    canchasApi.getAll().catch(() => []),
                    reservasApi.getAll().catch(() => []),
                    usuariosApi.getAll().catch(() => [])
                ]);

                setStats({
                    espacios: espaciosData.length || 0,
                    canchas: canchasData.length || 0,
                    reservas: reservasData.length || 0,
                    usuarios: usuariosData.length || 0,
                });
            } else if (profile?.rol === 'gestor') {
                const [canchasData, reservasData] = await Promise.all([
                    canchasApi.getAll().catch(() => []),
                    reservasApi.getAll().catch(() => [])
                ]);
                setStats({
                    canchas: canchasData.length || 0,
                    reservas: reservasData.length || 0,
                    espacios: 0,
                    usuarios: 0
                });
            } else if (profile?.rol === 'cliente') {
                const reservasData = await reservasApi.getByUsuario(profile.id).catch(() => []);
                setStats({
                    reservas: reservasData.length || 0,
                    espacios: 0,
                    canchas: 0,
                    usuarios: 0
                });
            } else if (profile?.rol === 'control_acceso') {
                const reservasData = await reservasApi.getAll().catch(() => []);
                setStats({
                    reservas: reservasData.length || 0,
                    espacios: 0,
                    canchas: 0,
                    usuarios: 0
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCardClick = (section) => {
        if (isGuest) {
            if (section === 'reservas' || section === 'deportes') {
                navigate('/login');
                return;
            }
        }
        
        switch(section) {
            case 'espacios':
                navigate('/espacios');
                break;
            case 'canchas':
                navigate('/canchas');
                break;
            case 'reservas':
                if (profile?.rol === 'cliente') {
                    navigate('/mis-reservas');
                } else {
                    navigate('/reservas');
                }
                break;
            case 'usuarios':
                navigate('/usuarios');
                break;
            case 'deportes':
                navigate('/deportes');
                break;
            default:
                break;
        }
    };
    
    // Creación de tarjetas según rol
    const statCards = [];
    if (profile?.rol === 'admin') {
        statCards.push(
            { title: 'Espacios Deportivos', value: stats.espacios, icon: <Stadium />, color: 'from-primary to-primary', section: 'espacios' },
            { title: 'Canchas', value: stats.canchas, icon: <SportsSoccer />, color: 'from-secondary to-secondary', section: 'canchas' },
            { title: 'Reservas', value: stats.reservas, icon: <CalendarMonth />, color: 'from-accent to-accent', section: 'reservas' },
            { title: 'Usuarios', value: stats.usuarios, icon: <People />, color: 'from-highlight to-highlight', section: 'usuarios' }
        );
    } else if (profile?.rol === 'gestor') {
        statCards.push(
            { title: 'Canchas Gestionadas', value: stats.canchas, icon: <SportsSoccer />, color: 'from-primary to-primary', section: 'canchas' },
            { title: 'Reservas', value: stats.reservas, icon: <CalendarMonth />, color: 'from-secondary to-secondary', section: 'reservas' }
        );
    } else if (profile?.rol === 'cliente') {
        statCards.push(
            { title: 'Mis Reservas', value: stats.reservas, icon: <CalendarMonth />, color: 'from-primary to-primary', section: 'reservas' }
        );
    } else if (profile?.rol === 'control_acceso') {
        statCards.push(
            { title: 'Reservas Hoy', value: stats.reservas, icon: <CalendarMonth />, color: 'from-primary to-primary', section: 'reservas' }
        );
    }

    const getRolDisplayName = (rol) => {
        const roles = {
            'admin': 'Administrador',
            'gestor': 'Gestor de Espacios',
            'control_acceso': 'Control de Acceso',
            'cliente': 'Cliente'
        };
        return roles[rol] || rol;
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                p: 2 
            }}>
                <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
                <Typography variant={isMobile ? "body1" : "h6"} sx={{ 
                    ml: 2, 
                    fontFamily: 'Roboto, sans-serif', 
                    color: COLOR_NEGRO_FONDO 
                }}>
                    Cargando estadísticas...
                </Typography>
            </Box>
        );
    }

    // Tarjetas para invitados
    const guestCards = [
        { title: 'Espacios Deportivos', value: displayStats.espacios, icon: <Stadium />, color: 'from-primary to-primary', section: 'espacios', guest: true },
        { title: 'Canchas Disponibles', value: displayStats.canchas, icon: <SportsSoccer />, color: 'from-secondary to-secondary', section: 'canchas', guest: true },
        { title: 'Reservas Activas', value: displayStats.reservas, icon: <CalendarMonth />, color: 'from-accent to-accent', section: 'reservas', guest: true },
        { title: 'Deportes', value: '6+', icon: <Sports />, color: 'from-highlight to-highlight', section: 'deportes', guest: true }
    ];

    return (
        <Box 
            sx={{ 
                p: { xs: 1, sm: 2, md: 4 },
                backgroundColor: COLOR_BLANCO,
                minHeight: '100vh'
            }}
        >
            {/* HEADER RESPONSIVE */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                mb: { xs: 4, sm: 6 },
                gap: { xs: 2, sm: 0 }
            }}>
                <Box sx={{ flex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography 
                            variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
                            sx={{ 
                                fontFamily: 'Montserrat, sans-serif', 
                                fontWeight: 'bold', 
                                mb: 1,
                                color: COLOR_AZUL_ELECTRICO,
                                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                            }}
                        >
                            {isGuest ? 'Bienvenido a OlympiaHub' : `Bienvenido, ${profile?.nombre}`}
                        </Typography>
                        <Typography 
                            variant={isMobile ? "body2" : "body1"}
                            sx={{ 
                                fontFamily: 'Roboto, sans-serif', 
                                color: getColorValue('text-gray-600'),
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            {isGuest 
                                ? 'Explora nuestras funcionalidades. Regístrate para comenzar a reservar.' 
                                : `Panel de control - ${getRolDisplayName(profile?.rol)}`
                            }
                        </Typography>
                    </motion.div>
                </Box>

                {/* BOTÓN ACTUALIZAR - RESPONSIVE */}
                {!isGuest && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 2
                    }}>
                        {isMobile ? (
                            <IconButton
                                onClick={fetchStats}
                                sx={{ 
                                    color: COLOR_NARANJA_OSCURO,
                                    backgroundColor: `${COLOR_NARANJA_OSCURO}15`,
                                    '&:hover': { 
                                        backgroundColor: `${COLOR_NARANJA_OSCURO}25` 
                                    }
                                }}
                            >
                                <Refresh />
                            </IconButton>
                        ) : (
                            <Button
                                startIcon={<Refresh />}
                                onClick={fetchStats}
                                variant="outlined"
                                size={isTablet ? "medium" : "large"}
                                sx={{ 
                                    color: COLOR_NARANJA_OSCURO, 
                                    borderColor: COLOR_NARANJA_OSCURO,
                                    '&:hover': { 
                                        borderColor: COLOR_NARANJA_OSCURO, 
                                        backgroundColor: `${COLOR_NARANJA_OSCURO}10` 
                                    },
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 'bold',
                                    fontSize: { sm: '0.875rem', md: '1rem' }
                                }}
                            >
                                Actualizar
                            </Button>
                        )}
                    </Box>
                )}
            </Box>

            {/* MENSAJE PARA INVITADOS - RESPONSIVE */}
            {isGuest && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Box sx={{ 
                        mt: 3, 
                        p: { xs: 2, sm: 3 },
                        mb: { xs: 4, sm: 6 },
                        borderRadius: '12px', 
                        background: COLOR_VERDE_LIMA, 
                        border: `1px solid ${COLOR_AZUL_ELECTRICO}`,
                        color: COLOR_NEGRO_FONDO
                    }}>
                        <Typography variant={isMobile ? "body2" : "body1"} sx={{ 
                            fontFamily: 'Roboto, sans-serif', 
                            mb: 1.5, 
                            color: COLOR_NEGRO_FONDO,
                            fontWeight: 'bold'
                        }}>
                            💡 ¿Qué puedes hacer como invitado?
                        </Typography>
                        <Typography variant={isMobile ? "caption" : "body2"} sx={{ 
                            fontFamily: 'Roboto, sans-serif', 
                            color: COLOR_NEGRO_FONDO,
                            mb: 2,
                            display: 'block'
                        }}>
                            • Explorar el dashboard y ver estadísticas generales<br/>
                            • Navegar por el proceso de reserva hasta el último paso<br/>
                            • Conocer nuestros espacios y disciplinas disponibles
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 1, sm: 2 },
                            mt: 2
                        }}>
                            <Button 
                                variant="contained" 
                                onClick={() => navigate('/register')}
                                size={isMobile ? "small" : "medium"}
                                fullWidth={isMobile}
                                sx={{ 
                                    backgroundColor: COLOR_AZUL_ELECTRICO, 
                                    color: COLOR_BLANCO,
                                    '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 },
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                Regístrate Gratis
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/login')}
                                size={isMobile ? "small" : "medium"}
                                fullWidth={isMobile}
                                sx={{ 
                                    color: COLOR_AZUL_ELECTRICO, 
                                    borderColor: COLOR_AZUL_ELECTRICO,
                                    '&:hover': { borderColor: COLOR_AZUL_ELECTRICO, backgroundColor: `${COLOR_AZUL_ELECTRICO}10` },
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}
                            >
                                Iniciar Sesión
                            </Button>
                        </Box>
                    </Box>
                </motion.div>
            )}

            {/* GRID DE ESTADÍSTICAS - COMPLETAMENTE RESPONSIVE */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {(isGuest ? guestCards : statCards).map((card, index) => (
                    <Grid item key={index} xs={6} sm={4} md={3} lg={3}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={{ height: '100%' }}
                        >
                            <Card
                                sx={{
                                    borderRadius: { xs: '12px', sm: '16px' },
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
                                        transform: 'translateY(-4px)',
                                    },
                                    cursor: card.guest ? 'default' : 'pointer',
                                    background: `linear-gradient(135deg, ${getColorValue(card.color.split(' ')[0])} 0%, ${getColorValue(card.color.split(' ')[1])} 100%)`,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onClick={card.guest ? undefined : () => handleCardClick(card.section)}
                            >
                                <CardContent sx={{ 
                                    color: COLOR_BLANCO, 
                                    p: { xs: 2, sm: 3 },
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{ 
                                        backgroundColor: 'rgba(255,255,255,0.2)', 
                                        p: { xs: 1, sm: 1.5 }, 
                                        borderRadius: '8px', 
                                        backdropFilter: 'blur(5px)',
                                        alignSelf: 'flex-start',
                                        mb: { xs: 1.5, sm: 2 }
                                    }}>
                                        {card.icon}
                                    </Box>
                                    <Typography 
                                        variant={isMobile ? "h4" : isTablet ? "h3" : "h3"}
                                        sx={{ 
                                            fontFamily: 'Montserrat, sans-serif', 
                                            fontWeight: 'bold',
                                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                                            mb: { xs: 0.5, sm: 1 }
                                        }}
                                    >
                                        {card.value}
                                    </Typography>
                                    <Typography 
                                        variant={isMobile ? "subtitle2" : "h6"}
                                        sx={{ 
                                            fontFamily: 'Roboto, sans-serif', 
                                            fontWeight: 'medium',
                                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {card.title}
                                    </Typography>
                                    {card.guest && (
                                        <Typography variant="caption" sx={{ 
                                            color: COLOR_BLANCO, 
                                            opacity: 0.8, 
                                            display: 'block', 
                                            mt: 'auto',
                                            pt: 1,
                                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                        }}>
                                            Demo para invitados
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* INFORMACIÓN ADICIONAL - SOLO PARA USUARIOS AUTENTICADOS */}
            {!isGuest && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ marginTop: isMobile ? '24px' : '32px' }}
                >
                    {/* BOTÓN PARA MOSTRAR/OCULTAR INFORMACIÓN EN MÓVIL */}
                    {isMobile && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => setShowMobileInfo(!showMobileInfo)}
                                startIcon={<AccountCircle />}
                                size="small"
                                fullWidth
                                sx={{
                                    color: COLOR_AZUL_ELECTRICO,
                                    borderColor: COLOR_AZUL_ELECTRICO,
                                    '&:hover': { borderColor: COLOR_AZUL_ELECTRICO },
                                    fontFamily: 'Roboto, sans-serif'
                                }}
                            >
                                {showMobileInfo ? 'Ocultar Información' : 'Ver Información'}
                            </Button>
                        </Box>
                    )}

                    {/* CONTENIDO DE INFORMACIÓN - RESPONSIVE */}
                    {(isMobile ? showMobileInfo : true) && (
                        <Card sx={{ 
                            borderRadius: { xs: '12px', sm: '16px' }, 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}>
                            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                                <Typography variant={isMobile ? "h6" : "h5"} sx={{ 
                                    fontFamily: 'Montserrat, sans-serif', 
                                    fontWeight: 'bold', 
                                    color: COLOR_AZUL_ELECTRICO, 
                                    mb: 3,
                                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
                                }}>
                                    Información del Sistema
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ 
                                                fontFamily: 'Roboto, sans-serif', 
                                                color: getColorValue('text-gray-700'), 
                                                mb: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box component="span" sx={{ 
                                                    fontWeight: 'bold',
                                                    minWidth: '80px'
                                                }}>
                                                    Usuario:
                                                </Box>
                                                {profile?.nombre} {profile?.apellido || ''}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                fontFamily: 'Roboto, sans-serif', 
                                                color: getColorValue('text-gray-700'), 
                                                mb: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box component="span" sx={{ 
                                                    fontWeight: 'bold',
                                                    minWidth: '80px'
                                                }}>
                                                    Email:
                                                </Box>
                                                {profile?.email}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                fontFamily: 'Roboto, sans-serif', 
                                                color: getColorValue('text-gray-700'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box component="span" sx={{ 
                                                    fontWeight: 'bold',
                                                    minWidth: '80px'
                                                }}>
                                                    Rol:
                                                </Box>
                                                {getRolDisplayName(profile?.rol)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ 
                                                fontFamily: 'Roboto, sans-serif', 
                                                color: getColorValue('text-gray-700'), 
                                                mb: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box component="span" sx={{ 
                                                    fontWeight: 'bold',
                                                    minWidth: '80px'
                                                }}>
                                                    Fecha:
                                                </Box>
                                                {new Date().toLocaleDateString('es-ES', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                                fontFamily: 'Roboto, sans-serif', 
                                                color: getColorValue('text-gray-700'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Box component="span" sx={{ 
                                                    fontWeight: 'bold',
                                                    minWidth: '80px'
                                                }}>
                                                    Hora:
                                                </Box>
                                                {new Date().toLocaleTimeString('es-ES')}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* seccion para poner reservas rapidas */}
                                <Grid item xs={12} sm={6} md="auto" clear="both">
                                    <UnirseReservaButton />
                                </Grid>

                                {/* ACCIONES RÁPIDAS - RESPONSIVE */}
                                <Box sx={{ 
                                    mt: 4, 
                                    pt: 3, 
                                    borderTop: `1px solid ${COLOR_NEGRO_FONDO}10` 
                                }}>
                                    <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ 
                                        fontFamily: 'Montserrat, sans-serif', 
                                        fontWeight: 'bold', 
                                        color: COLOR_VERDE_LIMA, 
                                        mb: 2,
                                        fontSize: { xs: '1rem', sm: '1.125rem' }
                                    }}>
                                        Acciones Rápidas
                                    </Typography>
                                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                                        {profile?.rol === 'admin' && (
                                            <>
                                                <Grid item xs={12} sm={6} md="auto">
                                                    <Button 
                                                        variant="contained" 
                                                        onClick={() => navigate('/espacios')}
                                                        fullWidth={isMobile || isTablet}
                                                        size={isMobile ? "small" : "medium"}
                                                        sx={{ 
                                                            backgroundColor: COLOR_AZUL_ELECTRICO,
                                                            color: COLOR_BLANCO, 
                                                            fontFamily: 'Roboto, sans-serif',
                                                            fontWeight: 'bold',
                                                            '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 },
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        {isMobile ? 'Espacios' : 'Gestionar Espacios'}
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md="auto">
                                                    <Button 
                                                        variant="contained" 
                                                        onClick={() => navigate('/usuarios')}
                                                        fullWidth={isMobile || isTablet}
                                                        size={isMobile ? "small" : "medium"}
                                                        sx={{ 
                                                            backgroundColor: COLOR_VERDE_LIMA,
                                                            color: COLOR_NEGRO_FONDO,
                                                            fontFamily: 'Roboto, sans-serif',
                                                            fontWeight: 'bold',
                                                            '&:hover': { backgroundColor: COLOR_VERDE_LIMA, opacity: 0.9 },
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                        }}
                                                    >
                                                        {isMobile ? 'Usuarios' : 'Gestionar Usuarios'}
                                                    </Button>
                                                </Grid>
                                            </>
                                        )}
                                        {profile?.rol === 'cliente' && (
                                            <Grid item xs={12} sm={6} md="auto">
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => navigate('/reservar')}
                                                    fullWidth={isMobile || isTablet}
                                                    size={isMobile ? "small" : "medium"}
                                                    sx={{ 
                                                        backgroundColor: COLOR_AZUL_ELECTRICO,
                                                        color: COLOR_BLANCO, 
                                                        fontFamily: 'Roboto, sans-serif',
                                                        fontWeight: 'bold',
                                                        '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 },
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                >
                                                    {isMobile ? 'Nueva Reserva' : 'Nueva Reserva'}
                                                </Button>
                                            </Grid>
                                        )}
                                        {profile?.rol === 'control_acceso' && (
                                            <Grid item xs={12} sm={6} md="auto">
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => navigate('/control-acceso')}
                                                    fullWidth={isMobile || isTablet}
                                                    size={isMobile ? "small" : "medium"}
                                                    sx={{ 
                                                        backgroundColor: COLOR_NARANJA_OSCURO,
                                                        color: COLOR_BLANCO, 
                                                        fontFamily: 'Roboto, sans-serif',
                                                        fontWeight: 'bold',
                                                        '&:hover': { backgroundColor: COLOR_NARANJA_OSCURO, opacity: 0.9 },
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }}
                                                >
                                                    {isMobile ? 'Control Acceso' : 'Control de Acceso'}
                                                </Button>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </Box>
                        </Card>
                    )}
                </motion.div>
            )}
        </Box>
    );
}