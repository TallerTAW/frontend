import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { usuariosApi } from '../api/usuarios';
import { Grid, Card, CardContent, Typography, Box, Button, CircularProgress } from '@mui/material';
import { Stadium, SportsSoccer, CalendarMonth, People, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// === PALETA DE COLORES PERSONALIZADA (Basada en tu solicitud) ===
const COLOR_NEGRO_OSCURO = '#040404'; // Texto Principal
const COLOR_VERDE_LIMA_SUAVE = '#c1db8b'; // Secundario (Verde Claro)
const COLOR_AZUL_CIELO = '#2d9fce'; // Primario (Azul Claro)
const COLOR_AZUL_OSCURO = '#2d9fce '; // Contraste Azul (Darker Blue)
const COLOR_VERDE_OLIVA = '#c1db8b '; // Fondo de Banner Invitado
const COLOR_VERDE_BOSQUE = '#275042 '; // Contraste Verde (Dark Green)
const COLOR_BLANCO = '#FFFFFF';        // Text Light

// Función para mapear las clases de color a los códigos hexadecimales
function getColorValue(colorClass) {
    const colors = {
        // Mapeo directo a los colores de las 4 cards en la imagen
        'from-primary': COLOR_AZUL_CIELO, // Espacios Deportivos (Azul Claro)
        'to-primary': COLOR_AZUL_OSCURO,
        'from-secondary': COLOR_VERDE_LIMA_SUAVE, // Canchas Disponibles (Verde Lima Suave)
        'to-secondary': COLOR_VERDE_OLIVA, // Un poco de verde oscuro
        'from-accent': COLOR_VERDE_BOSQUE, // Reservas Activas (Verde Oscuro)
        'to-accent': COLOR_VERDE_BOSQUE,
        'from-highlight': COLOR_AZUL_OSCURO, // Deportes/Usuarios (Azul Oscuro)
        'to-highlight': COLOR_AZUL_OSCURO,
        
        // Colores de componentes usados en el código
        'bg-primary': COLOR_AZUL_CIELO,
        'bg-secondary': COLOR_VERDE_LIMA_SUAVE,
        'bg-accent': COLOR_VERDE_BOSQUE,
        'text-primary': COLOR_AZUL_CIELO,
        'text-secondary': COLOR_VERDE_LIMA_SUAVE,
        'text-gray-600': COLOR_VERDE_OLIVA, // Usamos Oliva para texto secundario
        'text-gray-700': COLOR_NEGRO_OSCURO, // Usamos Negro para texto oscuro
    };
    return colors[colorClass] || COLOR_AZUL_CIELO;
}

export default function Dashboard() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const isGuest = !user; 
    
    const [stats, setStats] = useState({
      espacios: 0,
      canchas: 0,
      reservas: 0,
      usuarios: 0,
    });
    // Stats de demo para invitado
    const guestStats = {
      espacios: 5,  
      canchas: 12,  
      reservas: 0,
      usuarios: 0
    };
    const [loading, setLoading] = useState(true);
    const displayStats = isGuest ? guestStats : stats;
    
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
        // Lógica de fetchStats: Se mantiene igual
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
        // Lógica de handleCardClick: Se mantiene igual
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
          default:
            break;
        }
      };
      
    // Creación de tarjetas (se mantiene igual)
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 256, p: 4 }}>
          {/* COLOR MODIFICADO */}
          <CircularProgress sx={{ color: COLOR_VERDE_LIMA_SUAVE }} />
          <Typography variant="h6" sx={{ ml: 2, fontFamily: 'Roboto, sans-serif', color: COLOR_NEGRO_OSCURO }}>
            Cargando estadísticas...
          </Typography>
        </Box>
      );
    }

    return (
        <Box 
            sx={{ 
                p: { xs: 2, sm: 4 },
                backgroundColor: COLOR_BLANCO 
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontFamily: 'Montserrat, sans-serif', 
                            fontWeight: 'bold', 
                            mb: 1, 
                            // COLOR MODIFICADO
                            color: COLOR_AZUL_CIELO 
                        }}
                    >
                        {isGuest ? 'Bienvenido a OlympiaHub' : `Bienvenido, ${profile?.nombre}`}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontFamily: 'Roboto, sans-serif', 
                            color: getColorValue('text-gray-600') 
                        }}
                    >
                        {isGuest 
                            ? 'Explora nuestras funcionalidades. Regístrate para comenzar a reservar.' 
                            : `Panel de control - ${getRolDisplayName(profile?.rol)}`
                        }
                    </Typography>

                    {/* Mensaje para invitados (Estilizado para parecerse a la imagen) */}
                    {isGuest && (
                        <Box sx={{ 
                            mt: 3, 
                            p: 3, 
                            borderRadius: '12px', 
                            // NUEVO ESTILO: Fondo Verde Oliva, Borde Azul Cielo
                            background: COLOR_VERDE_OLIVA, 
                            border: `1px solid ${COLOR_AZUL_CIELO}`,
                            color: COLOR_BLANCO // Texto en blanco para contraste
                           }}>
                            <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', mb: 1.5, color: COLOR_BLANCO }}>
                                <Box component="strong" sx={{ color: '#000000ff' }}>
                                    💡 ¿Qué puedes hacer como invitado?
                                </Box>
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Roboto, sans-serif', color: '#000000ff' }}>
                                • Explorar el dashboard y ver estadísticas generales<br/>
                                • Navegar por el proceso de reserva hasta el último paso<br/>
                                • Conocer nuestros espacios y disciplinas disponibles
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button 
                                    variant="contained" 
                                    onClick={() => navigate('/register')}
                                    size="small"
                                    sx={{ 
                                        // BOTÓN DE REGISTRO EN AZUL CIELO (Primario)
                                        backgroundColor: COLOR_AZUL_CIELO, 
                                        color: COLOR_BLANCO,
                                        '&:hover': { backgroundColor: COLOR_AZUL_CIELO, opacity: 0.9 },
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Regístrate Gratis
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => navigate('/login')}
                                    size="small"
                                    sx={{ 
                                        // BOTÓN DE LOGIN EN AZUL CIELO (Outlined)
                                        color: COLOR_AZUL_CIELO, 
                                        borderColor: COLOR_AZUL_CIELO,
                                        '&:hover': { borderColor: COLOR_AZUL_CIELO, backgroundColor: `${COLOR_AZUL_CIELO}10` },
                                        fontFamily: 'Montserrat, sans-serif',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Iniciar Sesión
                                </Button>
                            </Box>
                        </Box>
                    )}
                </motion.div>
                
                {!isGuest && (
                    <Button
                        startIcon={<Refresh />}
                        onClick={fetchStats}
                        variant="outlined"
                        sx={{ 
                            // BOTÓN ACTUALIZAR EN VERDE LIMA SUAVE (Secundario)
                            color: COLOR_VERDE_LIMA_SUAVE, 
                            borderColor: COLOR_VERDE_LIMA_SUAVE,
                            '&:hover': { 
                                borderColor: COLOR_VERDE_LIMA_SUAVE, 
                                backgroundColor: `${COLOR_VERDE_LIMA_SUAVE}10` 
                            },
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 'bold'
                        }}
                    >
                        Actualizar
                    </Button>
                )}
            </Box>

            {/* Grid de estadísticas (Card styles updated via getColorValue) */}
            <Grid container spacing={3}>
                {(isGuest ? [
                    { title: 'Espacios Deportivos', value: displayStats.espacios, icon: <Stadium />, color: 'from-primary to-primary', section: 'espacios', guest: true },
                    { title: 'Canchas Disponibles', value: displayStats.canchas, icon: <SportsSoccer />, color: 'from-secondary to-secondary', section: 'canchas', guest: true },
                    { title: 'Reservas Activas', value: displayStats.reservas, icon: <CalendarMonth />, color: 'from-accent to-accent', section: 'reservas', guest: true },
                    { title: 'Deportes', value: '6+', icon: <People />, color: 'from-highlight to-highlight', section: 'deportes', guest: true }
                ] : statCards).map((card, index) => (
                    <Grid item key={index} xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card
                                sx={{
                                    borderRadius: '16px', 
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
                                        transform: 'translateY(-4px)',
                                    },
                                    cursor: card.guest ? 'default' : 'pointer',
                                    // El background ahora usa la nueva paleta y los colores de la card
                                    background: `linear-gradient(135deg, ${getColorValue(card.color.split(' ')[0])} 0%, ${getColorValue(card.color.split(' ')[1])} 100%)`,
                                }}
                                onClick={card.guest ? undefined : () => handleCardClick(card.section)}
                            >
                                <CardContent sx={{ color: COLOR_BLANCO, p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ backgroundColor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: '8px', backdropFilter: 'blur(5px)' }}>
                                            {card.icon}
                                        </Box>
                                        <Typography variant="h3" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold' }}>
                                            {card.value}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 'medium' }}>
                                        {card.title}
                                    </Typography>
                                    {card.guest && (
                                        <Typography variant="caption" sx={{ color: COLOR_BLANCO, opacity: 0.8, display: 'block', mt: 1 }}>
                                            Demo para invitados
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Información adicional - Solo para usuarios autenticados */}
            {!isGuest && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{ marginTop: '32px' }}
                >
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                       <Box sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', 
                                // COLOR MODIFICADO
                                color: COLOR_AZUL_CIELO, mb: 3 }}>
                                Información del Sistema
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                        <Box component="strong" sx={{ fontWeight: 'bold' }}>Usuario:</Box> {profile?.nombre} {profile?.apellido || ''}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                        <Box component="strong" sx={{ fontWeight: 'bold' }}>Email:</Box> {profile?.email}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700') }}>
                                        <Box component="strong" sx={{ fontWeight: 'bold' }}>Rol:</Box> {getRolDisplayName(profile?.rol)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                        <Box component="strong" sx={{ fontWeight: 'bold' }}>Fecha:</Box> {new Date().toLocaleDateString('es-ES', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700') }}>
                                        <Box component="strong" sx={{ fontWeight: 'bold' }}>Hora:</Box> {new Date().toLocaleTimeString('es-ES')}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Acciones rápidas */}
                            <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${COLOR_NEGRO_OSCURO}10` }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', 
                                    // COLOR MODIFICADO
                                    color: COLOR_VERDE_LIMA_SUAVE, mb: 2 }}>
                                    Acciones Rápidas
                                </Typography>
                                <Grid container spacing={2}>
                                    {profile?.rol === 'admin' && (
                                        <>
                                            <Grid item>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => navigate('/espacios')}
                                                    sx={{ 
                                                        // BOTÓN EN AZUL CIELO
                                                        backgroundColor: COLOR_AZUL_CIELO,
                                                        color: COLOR_BLANCO, 
                                                        fontFamily: 'Roboto, sans-serif',
                                                        '&:hover': { backgroundColor: COLOR_AZUL_CIELO, opacity: 0.9 } 
                                                    }}
                                                >
                                                    Gestionar Espacios
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button 
                                                    variant="contained" 
                                                    onClick={() => navigate('/usuarios')}
                                                    sx={{ 
                                                        // BOTÓN EN VERDE LIMA SUAVE
                                                        backgroundColor: COLOR_VERDE_LIMA_SUAVE,
                                                        color: COLOR_NEGRO_OSCURO, // Texto oscuro para contraste
                                                        fontFamily: 'Roboto, sans-serif',
                                                        fontWeight: 'bold',
                                                        '&:hover': { backgroundColor: COLOR_VERDE_LIMA_SUAVE, opacity: 0.9 } 
                                                    }}
                                                >
                                                    Gestionar Usuarios
                                                </Button>
                                            </Grid>
                                        </>
                                    )}
                                    {profile?.rol === 'cliente' && (
                                        <Grid item>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => navigate('/reservar')}
                                                sx={{ 
                                                    // BOTÓN EN AZUL CIELO
                                                    backgroundColor: COLOR_AZUL_CIELO,
                                                    color: COLOR_BLANCO, 
                                                    fontFamily: 'Roboto, sans-serif',
                                                    fontWeight: 'bold',
                                                    '&:hover': { backgroundColor: COLOR_AZUL_CIELO, opacity: 0.9 } 
                                                }}
                                            >
                                                Nueva Reserva
                                            </Button>
                                        </Grid>
                                    )}
                                    {profile?.rol === 'control_acceso' && (
                                        <Grid item>
                                            <Button 
                                                variant="contained" 
                                                onClick={() => navigate('/control-acceso')}
                                                sx={{ 
                                                    // BOTÓN EN AZUL OSCURO
                                                    backgroundColor: COLOR_AZUL_OSCURO,
                                                    color: COLOR_BLANCO, 
                                                    fontFamily: 'Roboto, sans-serif',
                                                    '&:hover': { backgroundColor: COLOR_AZUL_OSCURO, opacity: 0.9 } 
                                                }}
                                            >
                                                Control de Acceso
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Box>
                    </Card>
                </motion.div>
            )}
        </Box>
    );
}