import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Star, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Ratings() {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const [reservationsRes, ratingsRes] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            courts (
              id,
              name,
              sports (name, icon),
              sports_facilities (name)
            )
          `)
          .eq('user_id', profile.id)
          .in('status', ['completed', 'confirmed'])
          .order('reservation_date', { ascending: false }),
        supabase
          .from('ratings')
          .select(`
            *,
            courts (
              name,
              sports (name, icon),
              sports_facilities (name)
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
      ]);

      if (reservationsRes.error) throw reservationsRes.error;
      if (ratingsRes.error) throw ratingsRes.error;

      setReservations(reservationsRes.data || []);
      setRatings(ratingsRes.data || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleOpenDialog = (reservation) => {
    const existingRating = ratings.find(r => r.reservation_id === reservation.id);
    if (existingRating) {
      setRatingValue(existingRating.rating);
      setComment(existingRating.comment);
    } else {
      setRatingValue(0);
      setComment('');
    }
    setRatingDialog(reservation);
  };

  const handleSubmitRating = async () => {
    if (!ratingDialog || ratingValue === 0) return;

    try {
      const existingRating = ratings.find(r => r.reservation_id === ratingDialog.id);

      if (existingRating) {
        const { error } = await supabase
          .from('ratings')
          .update({
            rating: ratingValue,
            comment,
          })
          .eq('id', existingRating.id);

        if (error) throw error;
        toast.success('Calificación actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('ratings')
          .insert({
            user_id: profile.id,
            court_id: ratingDialog.courts.id,
            reservation_id: ratingDialog.id,
            rating: ratingValue,
            comment,
          });

        if (error) throw error;
        toast.success('Calificación enviada correctamente');
      }

      setRatingDialog(null);
      setRatingValue(0);
      setComment('');
      fetchData();
    } catch (error) {
      toast.error('Error al guardar la calificación');
    }
  };

  const hasRating = (reservationId) => {
    return ratings.some(r => r.reservation_id === reservationId);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-2">
          Calificar Canchas
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6 font-body">
          Comparte tu experiencia con otros usuarios
        </Typography>
      </motion.div>

      <Box className="mb-8">
        <Typography variant="h5" className="font-title text-secondary mb-4">
          Reservas Disponibles para Calificar
        </Typography>
        <Grid container spacing={3}>
          {reservations.filter(r => !hasRating(r.id)).map((reservation, index) => (
            <Grid item xs={12} md={6} key={reservation.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Box className="bg-gradient-to-r from-secondary to-accent p-4 text-white">
                    <Box className="flex items-center gap-2">
                      <Typography className="text-4xl">
                        {reservation.courts.sports.icon}
                      </Typography>
                      <Box>
                        <Typography variant="h6" className="font-title">
                          {reservation.courts.name}
                        </Typography>
                        <Typography variant="caption">
                          {reservation.courts.sports_facilities.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography className="font-body text-gray-600 mb-4">
                      Fecha: {new Date(reservation.reservation_date).toLocaleDateString('es-ES')}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Star />}
                      onClick={() => handleOpenDialog(reservation)}
                      sx={{
                        background: 'linear-gradient(to right, #9eca3f, #fbab22)',
                        '&:hover': {
                          background: 'linear-gradient(to right, #8ab637, #e09a1e)',
                        },
                        textTransform: 'none',
                      }}
                    >
                      Calificar Ahora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {reservations.filter(r => !hasRating(r.id)).length === 0 && (
          <Box className="text-center py-8 bg-gray-50 rounded-xl">
            <Typography className="text-gray-500 font-body">
              No tienes reservas pendientes de calificar
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="h5" className="font-title text-primary mb-4">
          Mis Calificaciones
        </Typography>
        <Grid container spacing={3}>
          {ratings.map((rating, index) => (
            <Grid item xs={12} md={6} key={rating.id}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="rounded-2xl shadow-lg">
                  <Box className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <Typography className="text-4xl">
                          {rating.courts.sports.icon}
                        </Typography>
                        <Box>
                          <Typography variant="h6" className="font-title">
                            {rating.courts.name}
                          </Typography>
                          <Typography variant="caption">
                            {rating.courts.sports_facilities.name}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => {
                          const reservation = reservations.find(r => r.id === rating.reservation_id);
                          if (reservation) handleOpenDialog(reservation);
                        }}
                        className="text-white"
                      >
                        <Edit />
                      </IconButton>
                    </Box>
                  </Box>
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-2">
                      <Rating value={rating.rating} readOnly size="large" />
                      <Typography variant="h6" className="font-title">
                        {rating.rating}/5
                      </Typography>
                    </Box>
                    {rating.comment && (
                      <Typography className="font-body text-gray-700 mt-2 italic">
                        "{rating.comment}"
                      </Typography>
                    )}
                    <Typography variant="caption" className="text-gray-500 mt-2 block">
                      {new Date(rating.created_at).toLocaleDateString('es-ES')}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {ratings.length === 0 && (
          <Box className="text-center py-12">
            <Star sx={{ fontSize: 100, color: '#fbab22', opacity: 0.3 }} />
            <Typography variant="h6" className="text-gray-500 mt-4 font-body">
              Aún no has calificado ninguna cancha
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={Boolean(ratingDialog)}
        onClose={() => setRatingDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'rounded-2xl',
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-secondary to-accent text-white font-title">
          Calificar Cancha
        </DialogTitle>
        <DialogContent className="mt-4">
          {ratingDialog && (
            <Box>
              <Box className="text-center mb-6">
                <Typography className="text-6xl mb-2">
                  {ratingDialog.courts.sports.icon}
                </Typography>
                <Typography variant="h6" className="font-title">
                  {ratingDialog.courts.name}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {ratingDialog.courts.sports_facilities.name}
                </Typography>
              </Box>
              <Box className="text-center mb-6">
                <Typography className="font-body mb-2">
                  ¿Cómo calificarías tu experiencia?
                </Typography>
                <Rating
                  value={ratingValue}
                  onChange={(e, newValue) => setRatingValue(newValue)}
                  size="large"
                  sx={{
                    fontSize: '3rem',
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label="Comentario (opcional)"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia con otros usuarios..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setRatingDialog(null)} className="text-gray-600">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitRating}
            variant="contained"
            disabled={ratingValue === 0}
            sx={{
              background: 'linear-gradient(to right, #9eca3f, #fbab22)',
              '&:hover': {
                background: 'linear-gradient(to right, #8ab637, #e09a1e)',
              },
              textTransform: 'none',
            }}
          >
            Enviar Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function IconButton({ onClick, className, children }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-white/20 transition-all ${className}`}
    >
      {children}
    </button>
  );
}
