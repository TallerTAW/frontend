import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { usuariosApi } from '../api/usuarios';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Stadium, SportsSoccer, CalendarMonth, People } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    espacios: 0,
    canchas: 0,
    reservas: 0,
    usuarios: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    try {
      if (profile?.rol === 'admin') {
        const [espaciosData, canchasData, reservasData, usuariosData] = await Promise.all([
          espaciosApi.getAll(),
          canchasApi.getAll(),
          reservasApi.getAll(),
          usuariosApi.getAll()
        ]);

        setStats({
          espacios: espaciosData.length,
          canchas: canchasData.length,
          reservas: reservasData.length,
          usuarios: usuariosData.length,
        });
      } else if (profile?.rol === 'gestor') {
        const [canchasData, reservasData] = await Promise.all([
          canchasApi.getAll(),
          reservasApi.getAll()
        ]);

        // Filtrar canchas del gestor (asumiendo que el gestor está asociado a espacios)
        const canchasGestor = canchasData.filter(cancha => 
          // Aquí deberías tener lógica para filtrar por espacios que gestiona
          true // Por ahora mostramos todas
        );

        setStats({
          canchas: canchasGestor.length,
          reservas: reservasData.length,
          espacios: 0,
          usuarios: 0
        });
      } else if (profile?.rol === 'cliente') {
        const reservasData = await reservasApi.getByUsuario(profile.id);
        setStats({
          reservas: reservasData.length,
          espacios: 0,
          canchas: 0,
          usuarios: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [];

  if (profile?.rol === 'admin') {
    statCards.push(
      { title: 'Espacios Deportivos', value: stats.espacios, icon: <Stadium />, color: 'from-primary to-secondary' },
      { title: 'Canchas', value: stats.canchas, icon: <SportsSoccer />, color: 'from-secondary to-accent' },
      { title: 'Reservas', value: stats.reservas, icon: <CalendarMonth />, color: 'from-accent to-highlight' },
      { title: 'Usuarios', value: stats.usuarios, icon: <People />, color: 'from-highlight to-primary' }
    );
  } else if (profile?.rol === 'gestor') {
    statCards.push(
      { title: 'Canchas Gestionadas', value: stats.canchas, icon: <SportsSoccer />, color: 'from-primary to-secondary' },
      { title: 'Reservas', value: stats.reservas, icon: <CalendarMonth />, color: 'from-secondary to-accent' }
    );
  } else if (profile?.rol === 'cliente') {
    statCards.push(
      { title: 'Mis Reservas', value: stats.reservas, icon: <CalendarMonth />, color: 'from-primary to-secondary' }
    );
  } else if (profile?.rol === 'control_acceso') {
    statCards.push(
      { title: 'Reservas Hoy', value: stats.reservas, icon: <CalendarMonth />, color: 'from-primary to-secondary' }
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

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title mb-2 text-primary">
          Bienvenido, {profile?.nombre}
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-8 font-body">
          Panel de control - {getRolDisplayName(profile?.rol)}
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                sx={{
                  background: `linear-gradient(135deg, ${getColorValue(card.color.split(' ')[0])} 0%, ${getColorValue(card.color.split(' ')[1])} 100%)`,
                }}
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
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Información adicional para cada rol */}
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
            <Grid item xs={12} md={6}>
              <Typography variant="body1" className="font-body text-gray-700 mb-2">
                <strong>Usuario:</strong> {profile?.nombre} {profile?.apellido}
              </Typography>
              <Typography variant="body1" className="font-body text-gray-700 mb-2">
                <strong>Email:</strong> {profile?.email}
              </Typography>
              <Typography variant="body1" className="font-body text-gray-700">
                <strong>Rol:</strong> {getRolDisplayName(profile?.rol)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
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
        </Card>
      </motion.div>
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