import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Stadium, SportsSoccer, CalendarMonth, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    facilities: 0,
    courts: 0,
    reservations: 0,
    ratings: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    try {
      if (profile?.role === 'admin_general') {
        const [facilities, courts, reservations, ratings] = await Promise.all([
          supabase.from('sports_facilities').select('*', { count: 'exact', head: true }),
          supabase.from('courts').select('*', { count: 'exact', head: true }),
          supabase.from('reservations').select('*', { count: 'exact', head: true }),
          supabase.from('ratings').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          facilities: facilities.count || 0,
          courts: courts.count || 0,
          reservations: reservations.count || 0,
          ratings: ratings.count || 0,
        });
      } else if (profile?.role === 'admin_facility') {
        const [courts, reservations] = await Promise.all([
          supabase.from('courts').select('*', { count: 'exact', head: true }).eq('facility_id', profile.facility_id),
          supabase.from('courts').select('id').eq('facility_id', profile.facility_id).then(async ({ data }) => {
            if (!data) return { count: 0 };
            const courtIds = data.map(c => c.id);
            return supabase.from('reservations').select('*', { count: 'exact', head: true }).in('court_id', courtIds);
          }),
        ]);

        setStats({
          courts: courts.count || 0,
          reservations: reservations.count || 0,
        });
      } else if (profile?.role === 'client') {
        const [reservations, ratings] = await Promise.all([
          supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
          supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
        ]);

        setStats({
          reservations: reservations.count || 0,
          ratings: ratings.count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [];

  if (profile?.role === 'admin_general') {
    statCards.push(
      { title: 'Espacios Deportivos', value: stats.facilities, icon: <Stadium />, color: 'from-primary to-secondary' },
      { title: 'Canchas', value: stats.courts, icon: <SportsSoccer />, color: 'from-secondary to-accent' },
      { title: 'Reservas', value: stats.reservations, icon: <CalendarMonth />, color: 'from-accent to-highlight' },
      { title: 'Calificaciones', value: stats.ratings, icon: <Star />, color: 'from-highlight to-primary' }
    );
  } else if (profile?.role === 'admin_facility') {
    statCards.push(
      { title: 'Canchas', value: stats.courts, icon: <SportsSoccer />, color: 'from-primary to-secondary' },
      { title: 'Reservas', value: stats.reservations, icon: <CalendarMonth />, color: 'from-secondary to-accent' }
    );
  } else if (profile?.role === 'client') {
    statCards.push(
      { title: 'Mis Reservas', value: stats.reservations, icon: <CalendarMonth />, color: 'from-primary to-secondary' },
      { title: 'Mis Calificaciones', value: stats.ratings, icon: <Star />, color: 'from-secondary to-accent' }
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title mb-2 text-primary">
          Bienvenido, {profile?.full_name}
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-8 font-body">
          Panel de control - {profile?.role?.replace('_', ' ')}
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
                  background: `linear-gradient(135deg, ${card.color.split(' ')[0].replace('from-', '#')} 0%, ${card.color.split(' ')[1].replace('to-', '#')} 100%)`,
                  backgroundImage: `linear-gradient(135deg, ${getColorValue(card.color.split(' ')[0])} 0%, ${getColorValue(card.color.split(' ')[1])} 100%)`,
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
