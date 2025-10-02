import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../api/reservas';
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
  IconButton,
} from '@mui/material';
import { Star, Edit } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Servicio de comentarios (mock - debes crear el backend para esto)
const comentariosApi = {
  create: async (comentarioData) => {
    // TODO: Implementar llamada real a tu backend
    console.log('Creando comentario:', comentarioData);
    return { 
      id_comentario: Date.now(), 
      ...comentarioData,
      fecha_comentario: new Date().toISOString()
    };
  },
  
  update: async (id, comentarioData) => {
    // TODO: Implementar llamada real a tu backend
    console.log('Actualizando comentario:', id, comentarioData);
    return { 
      id_comentario: id, 
      ...comentarioData 
    };
  },
  
  getByUsuario: async (usuarioId) => {
    // TODO: Implementar llamada real a tu backend
    console.log('Obteniendo comentarios del usuario:', usuarioId);
    return [];
  },
  
  getByCancha: async (canchaId) => {
    // TODO: Implementar llamada real a tu backend
    console.log('Obteniendo comentarios de la cancha:', canchaId);
    return [];
  }
};

export default function Ratings() {
  const { profile } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      const reservasData = await reservasApi.getByUsuario(profile.id);
      
      // Filtrar reservas completadas para calificar
      const reservasCompletadas = reservasData.filter(reserva => 
        reserva.estado === 'completada' || reserva.estado === 'confirmada'
      );
      
      setReservas(reservasCompletadas);
      
      // Cargar comentarios existentes del usuario
      const comentariosData = await comentariosApi.getByUsuario(profile.id);
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Para desarrollo, usar datos de ejemplo
      setComentarios([]);
    }
  };

  const handleOpenDialog = (reserva) => {
    // Buscar si ya existe un comentario para esta reserva/cancha
    const existingComment = comentarios.find(c => 
      c.id_cancha === reserva.id_cancha || c.id_reserva === reserva.id_reserva
    );
    
    if (existingComment) {
      setRatingValue(existingComment.calificacion || 0);
      setComentario(existingComment.descripcion || '');
    } else {
      setRatingValue(0);
      setComentario('');
    }
    setRatingDialog(reserva);
  };

  const handleSubmitRating = async () => {
    if (!ratingDialog || ratingValue === 0) return;

    try {
      const commentData = {
        descripcion: comentario,
        calificacion: ratingValue,
        id_usuario: profile.id,
        id_cancha: ratingDialog.id_cancha,
        // Si tu modelo de comentarios soporta relación con reservas:
        // id_reserva: ratingDialog.id_reserva
      };

      const existingComment = comentarios.find(c => 
        c.id_cancha === ratingDialog.id_cancha
      );
      
      let resultado;
      if (existingComment) {
        resultado = await comentariosApi.update(existingComment.id_comentario, commentData);
        toast.success('Calificación actualizada correctamente');
      } else {
        resultado = await comentariosApi.create(commentData);
        toast.success('Calificación enviada correctamente');
      }

      // Actualizar lista de comentarios
      if (existingComment) {
        setComentarios(prev => 
          prev.map(c => c.id_comentario === existingComment.id_comentario ? resultado : c)
        );
      } else {
        setComentarios(prev => [...prev, resultado]);
      }

      setRatingDialog(null);
      setRatingValue(0);
      setComentario('');
      
    } catch (error) {
      toast.error('Error al guardar la calificación');
      console.error('Error:', error);
    }
  };

  const hasRating = (canchaId) => {
    return comentarios.some(c => c.id_cancha === canchaId);
  };

  const getRatingForCancha = (canchaId) => {
    const comment = comentarios.find(c => c.id_cancha === canchaId);
    return comment ? comment.calificacion : 0;
  };

  const getCommentForCancha = (canchaId) => {
    const comment = comentarios.find(c => c.id_cancha === canchaId);
    return comment ? comment.descripcion : '';
  };

  const getSportIcon = (canchaTipo) => {
    const icons = {
      'Fútbol': '⚽',
      'Básquetbol': '🏀',
      'Tenis': '🎾',
      'Vóleibol': '🏐',
      'Rugby': '🏉',
      'Béisbol': '⚾',
      'Hockey': '🏒',
      'Ping Pong': '🏓',
      'Boxeo': '🥊',
      'Billar': '🎱',
      'Natación': '🏊',
      'Atletismo': '🏃'
    };
    return icons[canchaTipo] || '🏆';
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
          {reservas.filter(r => !hasRating(r.id_cancha)).map((reserva, index) => (
            <Grid item xs={12} md={6} key={reserva.id_reserva}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <Box className="bg-gradient-to-r from-secondary to-accent p-4 text-white rounded-t-2xl">
                    <Box className="flex items-center gap-2">
                      <Typography className="text-4xl">
                        {getSportIcon(reserva.cancha?.tipo)}
                      </Typography>
                      <Box>
                        <Typography variant="h6" className="font-title">
                          {reserva.cancha?.nombre}
                        </Typography>
                        <Typography variant="caption">
                          {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography className="font-body text-gray-600 mb-2">
                      <strong>Horario:</strong> {reserva.hora_inicio?.slice(0,5)} - {reserva.hora_fin?.slice(0,5)}
                    </Typography>
                    <Typography className="font-body text-gray-600 mb-4">
                      <strong>Estado:</strong> {reserva.estado}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Star />}
                      onClick={() => handleOpenDialog(reserva)}
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
        {reservas.filter(r => !hasRating(r.id_cancha)).length === 0 && (
          <Box className="text-center py-8 bg-gray-50 rounded-xl">
            <Star sx={{ fontSize: 60, color: '#9eca3f', opacity: 0.5, mb: 2 }} />
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
          {comentarios.map((comentarioItem, index) => {
            // Encontrar la reserva correspondiente para mostrar detalles
            const reservaCorrespondiente = reservas.find(r => 
              r.id_cancha === comentarioItem.id_cancha
            );
            
            return (
              <Grid item xs={12} md={6} key={comentarioItem.id_comentario || index}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="rounded-2xl shadow-lg">
                    <Box className="bg-gradient-to-r from-primary to-secondary p-4 text-white rounded-t-2xl">
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center gap-2">
                          <Typography className="text-4xl">
                            {getSportIcon(reservaCorrespondiente?.cancha?.tipo)}
                          </Typography>
                          <Box>
                            <Typography variant="h6" className="font-title">
                              {reservaCorrespondiente?.cancha?.nombre || 'Cancha'}
                            </Typography>
                            <Typography variant="caption">
                              Calificado el {new Date(
                                comentarioItem.fecha_comentario || new Date()
                              ).toLocaleDateString('es-ES')}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => {
                            if (reservaCorrespondiente) {
                              handleOpenDialog(reservaCorrespondiente);
                            }
                          }}
                          className="text-white"
                        >
                          <Edit />
                        </IconButton>
                      </Box>
                    </Box>
                    <CardContent>
                      <Box className="flex items-center gap-2 mb-2">
                        <Rating 
                          value={comentarioItem.calificacion} 
                          readOnly 
                          size="large" 
                        />
                        <Typography variant="h6" className="font-title">
                          {comentarioItem.calificacion}/5
                        </Typography>
                      </Box>
                      {comentarioItem.descripcion && (
                        <Typography className="font-body text-gray-700 mt-2 italic">
                          "{comentarioItem.descripcion}"
                        </Typography>
                      )}
                      {reservaCorrespondiente && (
                        <Typography variant="caption" className="text-gray-500 mt-2 block">
                          Reserva: {new Date(reservaCorrespondiente.fecha_reserva).toLocaleDateString('es-ES')} • 
                          {reservaCorrespondiente.hora_inicio?.slice(0,5)} - {reservaCorrespondiente.hora_fin?.slice(0,5)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
        {comentarios.length === 0 && (
          <Box className="text-center py-12">
            <Star sx={{ fontSize: 100, color: '#fbab22', opacity: 0.3 }} />
            <Typography variant="h6" className="text-gray-500 mt-4 font-body">
              Aún no has calificado ninguna cancha
            </Typography>
            <Typography variant="body2" className="text-gray-400 mt-2 font-body">
              Las calificaciones estarán disponibles después de completar tus reservas
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
                  {getSportIcon(ratingDialog.cancha?.tipo)}
                </Typography>
                <Typography variant="h6" className="font-title">
                  {ratingDialog.cancha?.nombre}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {new Date(ratingDialog.fecha_reserva).toLocaleDateString('es-ES')} • 
                  {ratingDialog.hora_inicio?.slice(0,5)} - {ratingDialog.hora_fin?.slice(0,5)}
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
                {ratingValue > 0 && (
                  <Typography variant="body2" className="text-gray-600 mt-2">
                    {ratingValue} {ratingValue === 1 ? 'estrella' : 'estrellas'}
                  </Typography>
                )}
              </Box>
              <TextField
                fullWidth
                label="Comentario (opcional)"
                multiline
                rows={4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Comparte tu experiencia con otros usuarios..."
                helperText="Tu comentario ayudará a otros usuarios a elegir la mejor cancha"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button 
            onClick={() => setRatingDialog(null)} 
            className="text-gray-600"
          >
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
            {comentarios.some(c => c.id_cancha === ratingDialog?.id_cancha) ? 'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}