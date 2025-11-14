import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../api/reservas';
import { comentariosApi } from '../api/comentarios';
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
  Chip,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Star, 
  Edit, 
  Delete, 
  Person,
  SportsSoccer,
  LocationOn
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Paleta de colores
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

export default function Ratings() {
  const { profile } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReservas, setLoadingReservas] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchComentarios();
      // Cargar reservas solo si no es admin y si queremos la funcionalidad de calificar
      if (profile.rol !== 'admin') {
        fetchReservas();
      }
    }
  }, [profile]);

  // Cargar comentarios (funcionalidad principal)
  const fetchComentarios = async () => {
    try {
      setLoading(true);
      
      let comentariosData;
      if (profile.rol === 'admin') {
        comentariosData = await comentariosApi.getAll();
      } else {
        comentariosData = await comentariosApi.getByUsuario(profile.id);
      }
      
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar reservas (funcionalidad opcional - solo para calificar)
  const fetchReservas = async () => {
    try {
      setLoadingReservas(true);
      const reservasData = await reservasApi.getByUsuario(profile.id);
      const reservasCompletadas = reservasData.filter(reserva => 
        reserva.estado === 'completada' || reserva.estado === 'confirmada'
      );
      setReservas(reservasCompletadas);
    } catch (error) {
      console.warn('No se pudieron cargar las reservas:', error);
      // No mostrar error al usuario, simplemente no mostrar la sección de calificar
      setReservas([]);
    } finally {
      setLoadingReservas(false);
    }
  };

  const handleOpenDialog = (reserva) => {
    // Buscar si ya existe un comentario para esta cancha
    const existingComment = comentarios.find(c => 
      c.id_cancha === reserva.id_cancha
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
      };

      const existingComment = comentarios.find(c => 
        c.id_cancha === ratingDialog.id_cancha && c.id_usuario === profile.id
      );
      
      let resultado;
      if (existingComment) {
        resultado = await comentariosApi.update(existingComment.id_comentario, commentData);
        toast.success('Comentario actualizado correctamente');
      } else {
        resultado = await comentariosApi.create(commentData);
        toast.success('Comentario enviado correctamente');
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
      
      // Recargar comentarios para asegurar que tenemos los datos actualizados
      fetchComentarios();
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar el comentario');
      console.error('Error:', error);
    }
  };

  const handleDeleteComment = async (comentarioId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        await comentariosApi.delete(comentarioId);
        setComentarios(prev => prev.filter(c => c.id_comentario !== comentarioId));
        toast.success('Comentario eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar comentario');
      }
    }
  };

  const hasRating = (canchaId) => {
    return comentarios.some(c => c.id_cancha === canchaId && c.id_usuario === profile.id);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el nombre completo del usuario
  const getNombreUsuario = (comentarioItem) => {
    if (comentarioItem.usuario) {
      return `${comentarioItem.usuario.nombre} ${comentarioItem.usuario.apellido}`;
    }
    return 'Usuario';
  };

  // Función para obtener las iniciales del usuario para el Avatar
  const getInicialesUsuario = (comentarioItem) => {
    if (comentarioItem.usuario) {
      return `${comentarioItem.usuario.nombre?.charAt(0) || ''}${comentarioItem.usuario.apellido?.charAt(0) || ''}`;
    }
    return 'U';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO, mb: 2 }}>
          {profile?.rol === 'admin' ? 'Gestión de Comentarios' : 'Mis Calificaciones'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {profile?.rol === 'admin' ? 'Administra todos los comentarios del sistema' : 'Comparte tu experiencia con otros usuarios'}
        </Typography>
      </motion.div>

      {/* Sección para usuarios normales - Reservas para calificar (OPCIONAL) */}
      {profile?.rol !== 'admin' && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_VERDE_LIMA, mb: 3 }}>
            Reservas Disponibles para Calificar
          </Typography>
          
          {loadingReservas ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {reservas.filter(r => !hasRating(r.id_cancha)).map((reserva, index) => (
                  <Grid item xs={12} md={6} key={reserva.id_reserva}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            transform: 'translateY(-4px)',
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            p: 3, 
                            background: `linear-gradient(135deg, ${COLOR_VERDE_LIMA} 0%, ${COLOR_AZUL_ELECTRICO} 100%)`,
                            color: COLOR_BLANCO,
                            borderRadius: '8px 8px 0 0'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ fontSize: '2.5rem' }}>
                              {getSportIcon(reserva.cancha?.tipo)}
                            </Typography>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {reserva.cancha?.nombre || `Cancha ${reserva.id_cancha}`}
                              </Typography>
                              <Typography variant="caption">
                                {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Horario:</strong> {reserva.hora_inicio?.slice(0,5)} - {reserva.hora_fin?.slice(0,5)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            <strong>Estado:</strong> 
                            <Chip 
                              label={reserva.estado} 
                              size="small" 
                              sx={{ 
                                ml: 1,
                                backgroundColor: reserva.estado === 'completada' ? COLOR_VERDE_LIMA : COLOR_NARANJA_VIBRANTE,
                                color: COLOR_BLANCO,
                                fontWeight: 'bold'
                              }}
                            />
                          </Typography>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Star />}
                            onClick={() => handleOpenDialog(reserva)}
                            sx={{
                              backgroundColor: COLOR_NARANJA_VIBRANTE,
                              color: COLOR_BLANCO,
                              fontWeight: 'bold',
                              '&:hover': {
                                backgroundColor: '#CC6A11',
                              },
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
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Star sx={{ fontSize: 60, color: COLOR_VERDE_LIMA, opacity: 0.5, mb: 2 }} />
                  <Typography color="text.secondary">
                    No tienes reservas pendientes de calificar
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Las reservas completadas aparecerán aquí para que puedas calificarlas
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Lista de Comentarios (FUNCIONALIDAD PRINCIPAL) */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO }}>
            {profile?.rol === 'admin' ? 'Todos los Comentarios' : 'Mis Comentarios'}
          </Typography>
          {profile?.rol === 'admin' && (
            <Typography variant="body2" color="text.secondary">
              Total: {comentarios.length} comentarios
            </Typography>
          )}
        </Box>

        <Grid container spacing={3}>
          {comentarios.map((comentarioItem, index) => (
            <Grid item xs={12} key={comentarioItem.id_comentario}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{ bgcolor: COLOR_AZUL_ELECTRICO }}>
                          {getInicialesUsuario(comentarioItem)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {getNombreUsuario(comentarioItem)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comentarioItem.fecha_comentario)}
                            {comentarioItem.usuario?.rol && (
                              <Chip 
                                label={comentarioItem.usuario.rol} 
                                size="small" 
                                sx={{ 
                                  ml: 1,
                                  backgroundColor: COLOR_VERDE_LIMA,
                                  color: COLOR_BLANCO,
                                  fontSize: '0.6rem',
                                  height: '20px'
                                }}
                              />
                            )}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating 
                          value={comentarioItem.calificacion} 
                          readOnly 
                          size="medium" 
                        />
                        <Typography variant="h6" sx={{ color: COLOR_NARANJA_VIBRANTE, fontWeight: 'bold', ml: 1 }}>
                          {comentarioItem.calificacion}/5
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.primary' }}>
                      "{comentarioItem.descripcion}"
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsSoccer sx={{ fontSize: 16, color: COLOR_VERDE_LIMA }} />
                        <Typography variant="body2" color="text.secondary">
                          Cancha ID: {comentarioItem.id_cancha}
                        </Typography>
                        {comentarioItem.usuario?.email && profile.rol === 'admin' && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Email: {comentarioItem.usuario.email}
                          </Typography>
                        )}
                      </Box>

                      {/* Botones de acción */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {(profile.rol === 'admin' || comentarioItem.id_usuario === profile.id) && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                // Para editar, necesitaríamos cargar los datos de la cancha
                                toast.info('Funcionalidad de edición en desarrollo');
                              }}
                              sx={{ color: COLOR_AZUL_ELECTRICO }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteComment(comentarioItem.id_comentario)}
                              sx={{ color: COLOR_NARANJA_VIBRANTE }}
                            >
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {comentarios.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Star sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {profile?.rol === 'admin' ? 'No hay comentarios en el sistema' : 'Aún no has realizado comentarios'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {profile?.rol === 'admin' ? 
                'Los comentarios de usuarios aparecerán aquí' : 
                'Tus comentarios aparecerán aquí después de calificar las canchas'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog para calificar */}
      <Dialog
        open={Boolean(ratingDialog && ratingDialog.id_cancha)}
        onClose={() => setRatingDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle 
          sx={{ 
            backgroundColor: COLOR_AZUL_ELECTRICO, 
            color: COLOR_BLANCO, 
            fontWeight: 'bold' 
          }}
        >
          Calificar Cancha
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {ratingDialog && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{ fontSize: '3rem', mb: 1 }}>
                  {getSportIcon(ratingDialog.cancha?.tipo)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {ratingDialog.cancha?.nombre || `Cancha ${ratingDialog.id_cancha}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(ratingDialog.fecha_reserva).toLocaleDateString('es-ES')} • 
                  {ratingDialog.hora_inicio?.slice(0,5)} - {ratingDialog.hora_fin?.slice(0,5)}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  ¿Cómo calificarías tu experiencia?
                </Typography>
                <Rating
                  value={ratingValue}
                  onChange={(e, newValue) => setRatingValue(newValue)}
                  size="large"
                  sx={{ fontSize: '3rem' }}
                />
                {ratingValue > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setRatingDialog(null)} 
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitRating}
            variant="contained"
            disabled={ratingValue === 0}
            sx={{
              backgroundColor: COLOR_NARANJA_VIBRANTE,
              color: COLOR_BLANCO,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#CC6A11',
              },
            }}
          >
            {comentarios.some(c => c.id_cancha === ratingDialog?.id_cancha && c.id_usuario === profile.id) ? 
              'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}