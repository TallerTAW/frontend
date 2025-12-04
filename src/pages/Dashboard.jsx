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

// === PALETA DE COLORES PERSONALIZADA (ACTUALIZADA con Paleta de Colores de la imagen) ===
const COLOR_AZUL_ELECTRICO = '#00BFFF'; // Azul Eléctrico (Card 1: Espacios Deportivos)
const COLOR_VERDE_LIMA = '#A2E831'; // Verde Lima (Card 2: Canchas)
const COLOR_NARANJA_VIBRANTE = '#FFC107'; // Naranja Vibrante (Card 3: Reservas) - USADO AQUÍ COMO NARANJA CLARO
const COLOR_NARANJA_OSCURO = '#FD7E14'; // fd7e14 (Card 4: Usuarios) - USADO AQUÍ COMO NARANJA OSCURO
const COLOR_NEGRO_FONDO = '#212121'; // Negro/Gris Oscuro para texto principal
const COLOR_BLANCO = '#FFFFFF';        // Text Light

// Notas de Mapeo:
// Card 1 (Espacios): Azul Eléctrico
// Card 2 (Canchas): Verde Lima
// Card 3 (Reservas): Naranja Vibrante
// Card 4 (Usuarios): Naranja Oscuro (#FD7E14)

// Función para mapear las clases de color a los códigos hexadecimales
function getColorValue(colorClass) {
    const colors = {
        // Mapeo directo a los colores de las 4 cards según la imagen
        'from-primary': COLOR_AZUL_ELECTRICO, // Espacios Deportivos (Azul)
        'to-primary': COLOR_AZUL_ELECTRICO, // Usamos color sólido
        'from-secondary': COLOR_VERDE_LIMA, // Canchas Disponibles (Verde)
        'to-secondary': COLOR_VERDE_LIMA, // Usamos color sólido
        'from-accent': COLOR_NARANJA_VIBRANTE, // Reservas Activas (Naranja Claro)
        'to-accent': COLOR_NARANJA_VIBRANTE, // Usamos color sólido
        'from-highlight': COLOR_NARANJA_OSCURO, // Usuarios (Naranja Oscuro #FD7E14)
        'to-highlight': COLOR_NARANJA_OSCURO, // Usamos color sólido
        
        // Colores de componentes usados en el código
        'bg-primary': COLOR_AZUL_ELECTRICO,
        'bg-secondary': COLOR_VERDE_LIMA,
        'bg-accent': COLOR_NARANJA_OSCURO,
        'text-primary': COLOR_AZUL_ELECTRICO,
        'text-secondary': COLOR_VERDE_LIMA,
        'text-gray-600': COLOR_NARANJA_VIBRANTE, // Naranja para texto secundario (p. ej. en subtítulos)
        'text-gray-700': COLOR_NEGRO_FONDO, // Usamos Negro Oscuro para texto oscuro
    };
    return colors[colorClass] || COLOR_AZUL_ELECTRICO;
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
          <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
          <Typography variant="h6" sx={{ ml: 2, fontFamily: 'Roboto, sans-serif', color: COLOR_NEGRO_FONDO }}>
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
            {/* ENCABEZADO: Título y Botón - RESPONSIVE APLICADO */}
            <Box 
                sx={{ 
                    display: 'flex', 
                    // RESPONSIVE: Cambia a columna en xs (móvil)
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    // RESPONSIVE: Alinear arriba en xs
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: 6 
                }}
            >
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
                            color: COLOR_AZUL_ELECTRICO 
                        }}
                    >
                        {isGuest ? 'Bienvenido a OlympiaHub' : `Bienvenido, ${profile?.nombre}`}
                    </Typography>
              
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontFamily: 'Roboto, sans-serif', 
                            // Color Naranja Vibrante para texto secundario (similar al subtítulo de la imagen)
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
                            // NUEVO ESTILO: Fondo Verde Lima, Borde Azul Eléctrico
                            background: COLOR_VERDE_LIMA, 
                            border: `1px solid ${COLOR_AZUL_ELECTRICO}`,
                            color: COLOR_NEGRO_FONDO // Texto oscuro para contraste en fondo claro
                           }}>
                            <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', mb: 1.5, color: COLOR_NEGRO_FONDO }}>
                                <Box component="strong" sx={{ color: COLOR_NEGRO_FONDO }}>
                                    💡 ¿Qué puedes hacer como invitado?
                                </Box>
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'Roboto, sans-serif', color: COLOR_NEGRO_FONDO }}>
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
                                        // BOTÓN DE REGISTRO EN AZUL ELÉCTRICO (Primario)
                                        backgroundColor: COLOR_AZUL_ELECTRICO, 
                                        color: COLOR_BLANCO,
                                        '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 },
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
                                        // BOTÓN DE LOGIN EN AZUL ELÉCTRICO (Outlined)
                                        color: COLOR_AZUL_ELECTRICO, 
                                        borderColor: COLOR_AZUL_ELECTRICO,
                                        '&:hover': { borderColor: COLOR_AZUL_ELECTRICO, backgroundColor: `${COLOR_AZUL_ELECTRICO}10` },
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
                
                {/* BOTÓN ACTUALIZAR */}
                {!isGuest && (
                    <Button
                        startIcon={<Refresh />}
                        onClick={fetchStats}
                        variant="outlined"
                        sx={{ 
                            // RESPONSIVE AÑADIDO: Margen superior en móvil para separación
                            mt: { xs: 3, sm: 0 }, 
                            // BOTÓN ACTUALIZAR EN NARANJA OSCURO (#FD7E14)
                            color: COLOR_NARANJA_OSCURO, 
                            borderColor: COLOR_NARANJA_OSCURO,
                            '&:hover': { 
                                borderColor: COLOR_NARANJA_OSCURO, 
                                backgroundColor: `${COLOR_NARANJA_OSCURO}10` 
                            },
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 'bold'
                        }}
                    >
                        Actualizar
                    </Button>
                )}
            </Box>

            {/* Grid de estadísticas (RESPONSIVE APLICADO) */}
            <Grid container spacing={3}>
                {(isGuest 
                    ? [
                        // Stats de demo para invitado (4 tarjetas)
                        { title: 'Espacios Deportivos', value: guestStats.espacios, icon: <Stadium />, color: 'from-primary to-primary', section: 'espacios', guest: true },
                        { title: 'Canchas Disponibles', value: guestStats.canchas, icon: <SportsSoccer />, color: 'from-secondary to-secondary', section: 'canchas', guest: true },
                        { title: 'Reservas Activas', value: guestStats.reservas, icon: <CalendarMonth />, color: 'from-accent to-accent', section: 'reservas', guest: true },
                        { title: 'Disciplinas', value: '6+', icon: <People />, color: 'from-highlight to-highlight', section: 'deportes', guest: true }
                    ] 
                    : statCards
                ).map((card, index) => (
                    <Grid 
                        item 
                        key={index} 
                        xs={12} // 1 card por fila en móvil
                        sm={6} // 2 cards por fila en tablet
                        lg={4} // 3 cards por fila en escritorio pequeño
                        xl={3} // 4 cards por fila en escritorio grande
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card 
                                sx={{ 
                                    cursor: (isGuest && card.guest) ? 'default' : 'pointer',
                                    borderRadius: '16px', 
                                    height: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: (isGuest && card.guest) ? 'none' : 'translateY(-5px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                                    },
                                    background: `linear-gradient(135deg, ${getColorValue(card.color.split(' ')[0])} 0%, ${getColorValue(card.color.split(' ')[1])} 100%)`,
                                }} 
                                onClick={card.guest ? undefined : () => handleCardClick(card.section)}
                            >
                                <CardContent sx={{ color: COLOR_BLANCO, p: 3 }}>
                                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: '8px', backdropFilter: 'blur(5px)' }}>
                                        {card.icon}
                                    </Box>
                                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2, mb: 1, fontFamily: 'Montserrat, sans-serif' }}>
                                        {card.value}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontFamily: 'Roboto, sans-serif' }}>
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
                    transition={{ duration: 0.5, delay: 0.4 }}
                    style={{ marginTop: '48px' }}
                >
                    <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO, mb: 4 }}>
                        Información del Sistema
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                <Box component="strong" sx={{ fontWeight: 'bold' }}>Usuario:</Box> {profile?.nombre} {profile?.apellido || ''}
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                <Box component="strong" sx={{ fontWeight: 'bold' }}>Rol:</Box> {getRolDisplayName(profile?.rol)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                <Box component="strong" sx={{ fontWeight: 'bold' }}>Último Acceso:</Box> {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'Roboto, sans-serif', color: getColorValue('text-gray-700'), mb: 1 }}>
                                <Box component="strong" sx={{ fontWeight: 'bold' }}>Fecha:</Box> {new Date().toLocaleDateString('es-ES', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Acciones Rápidas */}
                    <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', mt: 6, color: COLOR_VERDE_LIMA, mb: 2 }}>
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
                                            backgroundColor: COLOR_AZUL_ELECTRICO, 
                                            color: COLOR_BLANCO, 
                                            fontWeight: 'bold',
                                            fontFamily: 'Roboto, sans-serif', 
                                            '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 }
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
                                            backgroundColor: COLOR_VERDE_LIMA, 
                                            color: COLOR_NEGRO_FONDO, // Texto oscuro para contraste
                                            fontWeight: 'bold',
                                            fontFamily: 'Roboto, sans-serif', 
                                            '&:hover': { backgroundColor: COLOR_VERDE_LIMA, opacity: 0.9 }
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
                                        // BOTÓN EN AZUL ELÉCTRICO 
                                        backgroundColor: COLOR_AZUL_ELECTRICO, 
                                        color: COLOR_BLANCO, 
                                        fontWeight: 'bold',
                                        fontFamily: 'Roboto, sans-serif', 
                                        '&:hover': { backgroundColor: COLOR_AZUL_ELECTRICO, opacity: 0.9 }
                                    }}
                                >
                                    Crear Nueva Reserva
                                </Button>
                            </Grid>
                        )}
                        {profile?.rol === 'control_acceso' && (
                            <Grid item>
                                <Button 
                                    variant="contained" 
                                    onClick={() => navigate('/reservas')}
                                    sx={{ 
                                        // BOTÓN EN NARANJA VIBRANTE 
                                        backgroundColor: COLOR_NARANJA_VIBRANTE, 
                                        color: COLOR_NEGRO_FONDO, // Texto oscuro para contraste
                                        fontWeight: 'bold',
                                        fontFamily: 'Roboto, sans-serif', 
                                        '&:hover': { backgroundColor: COLOR_NARANJA_VIBRANTE, opacity: 0.9 }
                                    }}
                                >
                                    Validar Reservas
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </motion.div>
            )}
        </Box>
    );
}