import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { usuariosApi } from '../api/usuarios';
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { Stadium, SportsSoccer, CalendarMonth, People, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile, user } = useAuth(); // ✅ AGREGAR user aquí
  const navigate = useNavigate();
  const isGuest = !user; // ✅ Ahora user está definido
  const [stats, setStats] = useState({
    espacios: 0,
    canchas: 0,
    reservas: 0,
    usuarios: 0,
  });
  const guestStats = {
    espacios: 5,  // Ejemplo
    canchas: 12,  // Ejemplo  
    reservas: 0,
    usuarios: 0
  };
  const [loading, setLoading] = useState(true);
  // Usar stats reales o de invitado
  const displayStats = isGuest ? guestStats : stats;

  useEffect(() => {
    // Solo hacer fetch de stats si NO es invitado
    if (!isGuest) {
      fetchStats();
    } else {
      setLoading(false); // Para invitados, no cargar
    }
  }, [profile, isGuest]); // ✅ Agregar isGuest como dependencia

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching stats for role:', profile?.rol);

      if (profile?.rol === 'admin') {
        const [espaciosData, canchasData, reservasData, usuariosData] = await Promise.all([
          espaciosApi.getAll().catch(() => []),
          canchasApi.getAll().catch(() => []),
          reservasApi.getAll().catch(() => []),
          usuariosApi.getAll().catch(() => [])
        ]);

        console.log('Datos obtenidos:', {
          espacios: espaciosData.length,
          canchas: canchasData.length,
          reservas: reservasData.length,
          usuarios: usuariosData.length
        });

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
    // Para invitados, algunas secciones redirigen a login
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

  const statCards = [];

  if (profile?.rol === 'admin') {
    statCards.push(
      { 
        title: 'Espacios Deportivos', 
        value: stats.espacios, 
        icon: <Stadium />, 
        color: 'from-primary to-secondary',
        section: 'espacios'
      },
      { 
        title: 'Canchas', 
        value: stats.canchas, 
        icon: <SportsSoccer />, 
        color: 'from-secondary to-accent',
        section: 'canchas'
      },
      { 
        title: 'Reservas', 
        value: stats.reservas, 
        icon: <CalendarMonth />, 
        color: 'from-accent to-highlight',
        section: 'reservas'
      },
      { 
        title: 'Usuarios', 
        value: stats.usuarios, 
        icon: <People />, 
        color: 'from-highlight to-primary',
        section: 'usuarios'
      }
    );
  } else if (profile?.rol === 'gestor') {
    statCards.push(
      { 
        title: 'Canchas Gestionadas', 
        value: stats.canchas, 
        icon: <SportsSoccer />, 
        color: 'from-primary to-secondary',
        section: 'canchas'
      },
      { 
        title: 'Reservas', 
        value: stats.reservas, 
        icon: <CalendarMonth />, 
        color: 'from-secondary to-accent',
        section: 'reservas'
      }
    );
  } else if (profile?.rol === 'cliente') {
    statCards.push(
      { 
        title: 'Mis Reservas', 
        value: stats.reservas, 
        icon: <CalendarMonth />, 
        color: 'from-primary to-secondary',
        section: 'reservas'
      }
    );
  } else if (profile?.rol === 'control_acceso') {
    statCards.push(
      { 
        title: 'Reservas Hoy', 
        value: stats.reservas, 
        icon: <CalendarMonth />, 
        color: 'from-primary to-secondary',
        section: 'reservas'
      }
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
      <Box className="flex justify-center items-center min-h-64">
        <Typography>Cargando estadísticas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" className="font-title mb-2 text-primary">
            {isGuest ? 'Bienvenido a OlympiaHub' : `Bienvenido, ${profile?.nombre}`}
          </Typography>
          <Typography variant="body1" className="text-gray-600 font-body">
            {isGuest 
              ? 'Explora nuestras funcionalidades. Regístrate para comenzar a reservar.' 
              : `Panel de control - ${getRolDisplayName(profile?.rol)}`
            }
          </Typography>

          {/* Mensaje para invitados */}
          {isGuest && (
            <Box className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
              <Typography variant="body1" className="font-body mb-2">
                <strong>💡 ¿Qué puedes hacer como invitado?</strong>
              </Typography>
              <Typography variant="body2" className="font-body">
                • Explorar el dashboard y ver estadísticas generales<br/>
                • Navegar por el proceso de reserva hasta el último paso<br/>
                • Conocer nuestros espacios y disciplinas disponibles
              </Typography>
              <Box className="flex gap-2 mt-3">
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/register')}
                  className="bg-primary"
                  size="small"
                >
                  Regístrate Gratis
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/login')}
                  className="text-primary"
                  size="small"
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
            className="text-primary"
          >
            Actualizar
          </Button>
        )}
      </Box>

      {/* Grid de estadísticas - Modificado para invitados */}
      <Grid container spacing={3}>
        {(isGuest ? [
          { 
            title: 'Espacios Deportivos', 
            value: displayStats.espacios, 
            icon: <Stadium />, 
            color: 'from-primary to-secondary',
            section: 'espacios',
            guest: true
          },
          { 
            title: 'Canchas Disponibles', 
            value: displayStats.canchas, 
            icon: <SportsSoccer />, 
            color: 'from-secondary to-accent',
            section: 'canchas',
            guest: true
          },
          { 
            title: 'Reservas Activas', 
            value: displayStats.reservas, 
            icon: <CalendarMonth />, 
            color: 'from-accent to-highlight',
            section: 'reservas',
            guest: true
          },
          { 
            title: 'Deportes', 
            value: '6+', 
            icon: <People />, 
            color: 'from-highlight to-primary',
            section: 'deportes',
            guest: true
          }
        ] : statCards).map((card, index) => (
          <Grid item key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  card.guest ? 'cursor-default' : 'cursor-pointer'
                }`}
                sx={{
                  background: `linear-gradient(135deg, ${getColorValue(card.color.split(' ')[0])} 0%, ${getColorValue(card.color.split(' ')[1])} 100%)`,
                }}
                onClick={card.guest ? undefined : () => handleCardClick(card.section)}
              >
                <CardContent className="text-white p-6">
                  <Box className="flex items-center justify-between mb-4">
                    <Box className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                      {card.icon}
                    </Box>
                    <Typography variant="h3" className="font-title">
                      {card.value}
                    </Typography>
                  </Box>
                  <Typography variant="h6" className="font-body">
                    {card.title}
                  </Typography>
                  {card.guest && (
                    <Typography variant="caption" className="text-white/80 block mt-2">
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
          className="mt-8"
        >
          <Card className="rounded-2xl shadow-lg p-6">
            <Typography variant="h5" className="font-title text-primary mb-4">
              Información del Sistema
            </Typography>
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <Typography variant="body1" className="font-body text-gray-700 mb-2">
                  <strong>Usuario:</strong> {profile?.nombre} {profile?.apellido || ''}
                </Typography>
                <Typography variant="body1" className="font-body text-gray-700 mb-2">
                  <strong>Email:</strong> {profile?.email}
                </Typography>
                <Typography variant="body1" className="font-body text-gray-700">
                  <strong>Rol:</strong> {getRolDisplayName(profile?.rol)}
                </Typography>
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <Typography variant="body1" className="font-body text-gray-700 mb-2">
                  <strong>Fecha:</strong> {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
                <Typography variant="body1" className="font-body text-gray-700">
                  <strong>Hora:</strong> {new Date().toLocaleTimeString('es-ES')}
                </Typography>
              </Grid>
            </Grid>

            {/* Acciones rápidas */}
            <Box className="mt-6 pt-6 border-t border-gray-200">
              <Typography variant="h6" className="font-title text-secondary mb-4">
                Acciones Rápidas
              </Typography>
              <Grid container spacing={2}>
                {profile?.rol === 'admin' && (
                  <>
                    <Grid item>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/espacios')}
                        className="bg-primary"
                      >
                        Gestionar Espacios
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button 
                        variant="contained" 
                        onClick={() => navigate('/usuarios')}
                        className="bg-secondary"
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
                      className="bg-accent"
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
                      className="bg-primary"
                    >
                      Control de Acceso
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>
        </motion.div>
      )}
    </Box>
  );
}

function getColorValue(colorClass) {
  const colors = {
    'from-primary': '#0f9fe1',
    'to-primary': '#0f9fe1',
    'from-secondary': '#9eca3f',
    'to-secondary': '#9eca3f',
    'from-accent': '#fbab22',
    'to-accent': '#fbab22',
    'from-highlight': '#f87326',
    'to-highlight': '#f87326',
  };
  return colors[colorClass] || '#0f9fe1';
}