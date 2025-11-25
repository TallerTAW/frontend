// 📍 ARCHIVO: src/pages/Ratings.jsx (ACTUALIZADO)

import { useEffect, useState, useCallback } from 'react';
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
// Importamos el nuevo hook
import { useUserRatings } from '../hooks/useUserRatings';

// Paleta de colores (Mantener para consistencia de estilo)
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

export default function Ratings() {
  const { profile } = useAuth();
  // USAMOS EL NUEVO HOOK: Simplifica la lógica
  const { 
    comentarios, 
    loading, 
    handleSaveRating, 
    handleDeleteComment 
  } = useUserRatings();

  // Estados locales para el diálogo de calificación
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comentario, setComentario] = useState('');

  // Función para abrir el diálogo (con datos existentes si aplica)
  const handleOpenDialog = useCallback((reserva) => {
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
    // Añadimos 'cancha' a ratingDialog para que el diálogo pueda mostrar el nombre
    setRatingDialog({ ...reserva, cancha: reserva.cancha }); 
  }, [comentarios]);

  // Función para enviar la calificación
  const handleSubmitRating = async () => {
    if (!ratingDialog || ratingValue === 0) return;

    const success = await handleSaveRating(
      ratingDialog, 
      ratingValue, 
      comentario
    );
    
    if (success) {
      setRatingDialog(null);
      setRatingValue(0);
      setComentario('');
    }
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
    // Verifica si la propiedad es una cadena de fecha válida antes de formatear
    const date = new Date(dateString);
    if (isNaN(date)) return 'Fecha desconocida';

    return date.toLocaleDateString('es-ES', {
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
                        {(profile.rol === 'admin' || comentarioItem.id_usuario === profile.id_usuario) && (
                          <>
                            {/* Al ser un comentario ya hecho, abrimos el diálogo para editar */}
                            <IconButton
                              size="small"
                              // Usar el comentarioItem como base para la edición
                              onClick={() => handleOpenDialog(comentarioItem)} 
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
                'Tus comentarios aparecerán aquí'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog para calificar (Reutilizado) */}
      {/* Nota: Este diálogo ahora puede ser abierto desde Reservations.jsx o desde el botón de Edit aquí */}
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
          {comentarios.some(c => c.id_cancha === ratingDialog?.id_cancha && c.id_usuario === profile.id_usuario) ? 
              'Actualizar Calificación' : 'Calificar Cancha'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {ratingDialog && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {/* Asumimos que el objeto tiene la información de cancha. Si se abre desde 'Edit' en esta página, 
                puede no tenerla, por lo que lo haríamos opcional */}
                <Typography sx={{ fontSize: '3rem', mb: 1 }}>
                  {getSportIcon(ratingDialog.cancha?.tipo || '🏆')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {ratingDialog.cancha?.nombre || `Cancha ID: ${ratingDialog.id_cancha}`}
                </Typography>
                {/* Mostramos fecha y hora solo si son propiedades de reserva (para no mostrar en edición de comentario) */}
                {ratingDialog.fecha_reserva && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(ratingDialog.fecha_reserva).split(' • ')[0]} • 
                    {ratingDialog.hora_inicio?.slice(0,5)} - {ratingDialog.hora_fin?.slice(0,5)}
                  </Typography>
                )}
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
            {comentarios.some(c => c.id_cancha === ratingDialog?.id_cancha && c.id_usuario === profile.id_usuario) ? 
              'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}