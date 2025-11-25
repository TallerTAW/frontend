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
// Importamos el nuevo hook y las APIs necesarias
import { useUserRatings } from '../hooks/useUserRatings';
import { usuariosApi } from '../api/usuarios';
import { canchasApi } from '../api/canchas';

// Paleta de colores
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_ROJO = '#FF4136';
const COLOR_NEGRO_SUAVE = '#212121';

export default function Ratings() {
  const { profile } = useAuth();
  const { 
    comentarios, 
    loading, 
    handleSaveRating, 
    handleDeleteComment 
  } = useUserRatings();

  // Estados para cache de usuarios y canchas
  const [usuariosCache, setUsuariosCache] = useState({});
  const [canchasCache, setCanchasCache] = useState({});
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  // Estados locales para el diálogo de calificación
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comentario, setComentario] = useState('');

  // Cargar datos adicionales (usuarios y canchas)
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (comentarios.length === 0) return;
      
      setLoadingAdditionalData(true);
      try {
        // IDs únicos de usuarios y canchas
        const userIds = [...new Set(comentarios.map(c => c.id_usuario))];
        const canchaIds = [...new Set(comentarios.map(c => c.id_cancha))];

        // Cargar usuarios (solo para admin o si necesitamos nombres)
        const usuariosToLoad = userIds.filter(id => !usuariosCache[id]);
        if (usuariosToLoad.length > 0) {
          const usuariosPromises = usuariosToLoad.map(async (id) => {
            try {
              const userData = await usuariosApi.getById(id);
              return { id, data: userData };
            } catch (error) {
              console.error(`Error al cargar usuario ${id}:`, error);
              return { id, data: null };
            }
          });

          const usuariosResults = await Promise.all(usuariosPromises);
          const newUsuariosCache = { ...usuariosCache };
          usuariosResults.forEach(({ id, data }) => {
            newUsuariosCache[id] = data;
          });
          setUsuariosCache(newUsuariosCache);
        }

        // Cargar canchas
        const canchasToLoad = canchaIds.filter(id => !canchasCache[id]);
        if (canchasToLoad.length > 0) {
          const canchasPromises = canchasToLoad.map(async (id) => {
            try {
              // Usar endpoint público para evitar problemas de permisos
              const canchaData = await canchasApi.getByIdPublic(id);
              return { id, data: canchaData };
            } catch (error) {
              console.error(`Error al cargar cancha ${id}:`, error);
              return { id, data: null };
            }
          });

          const canchasResults = await Promise.all(canchasPromises);
          const newCanchasCache = { ...canchasCache };
          canchasResults.forEach(({ id, data }) => {
            newCanchasCache[id] = data;
          });
          setCanchasCache(newCanchasCache);
        }
      } catch (error) {
        console.error('Error al cargar datos adicionales:', error);
      } finally {
        setLoadingAdditionalData(false);
      }
    };

    loadAdditionalData();
  }, [comentarios]);

  // Función para obtener información del usuario
  const getUsuarioInfo = (idUsuario) => {
    const usuario = usuariosCache[idUsuario];
    if (!usuario) {
      return {
        nombre: 'Cargando...',
        apellido: '',
        email: '',
        rol: 'usuario'
      };
    }
    return {
      nombre: usuario.nombre || 'Usuario',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      rol: usuario.rol || 'usuario'
    };
  };

  // Función para obtener información de la cancha
  const getCanchaInfo = (idCancha) => {
    const cancha = canchasCache[idCancha];
    if (!cancha) {
      return {
        nombre: `Cancha ${idCancha}`,
        tipo: 'No disponible',
        espacio: 'No disponible'
      };
    }
    return {
      nombre: cancha.nombre || `Cancha ${idCancha}`,
      tipo: cancha.tipo || 'No especificado',
      espacio: cancha.espacio_deportivo?.nombre || 'Espacio no disponible',
      precio_por_hora: cancha.precio_por_hora
    };
  };

  // Función para abrir el diálogo (con datos existentes si aplica)
  const handleOpenDialog = useCallback((comentarioItem) => {
    setRatingValue(comentarioItem.calificacion || 0);
    setComentario(comentarioItem.descripcion || '');
    
    // Crear objeto con información de la cancha para el diálogo
    const canchaInfo = getCanchaInfo(comentarioItem.id_cancha);
    setRatingDialog({ 
      ...comentarioItem, 
      cancha: canchaInfo 
    });
  }, [canchasCache]);

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
      'Futbol': '⚽',
      'Básquetbol': '🏀',
      'Basquetbol': '🏀',
      'Baloncesto': '🏀',
      'Tenis': '🎾',
      'Vóleibol': '🏐',
      'Volleyball': '🏐',
      'Rugby': '🏉',
      'Béisbol': '⚾',
      'Beisbol': '⚾',
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
    const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
    return `${usuarioInfo.nombre} ${usuarioInfo.apellido}`.trim();
  };

  // Función para obtener las iniciales del usuario para el Avatar
  const getInicialesUsuario = (comentarioItem) => {
    const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
    return `${usuarioInfo.nombre?.charAt(0) || ''}${usuarioInfo.apellido?.charAt(0) || ''}` || 'U';
  };

  // Función para obtener el rol del usuario (con colores diferentes)
  const getRolColor = (rol) => {
    const colores = {
      'admin': COLOR_ROJO,
      'gestor': COLOR_AZUL_ELECTRICO,
      'cliente': COLOR_VERDE_LIMA
    };
    return colores[rol] || COLOR_NARANJA_VIBRANTE;
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

      {/* Indicador de carga de datos adicionales */}
      {loadingAdditionalData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip 
            icon={<CircularProgress size={16} />}
            label="Cargando información adicional..."
            variant="outlined"
          />
        </Box>
      )}

      {/* Lista de Comentarios */}
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
          {comentarios.map((comentarioItem, index) => {
            const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
            const canchaInfo = getCanchaInfo(comentarioItem.id_cancha);
            
            return (
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comentarioItem.fecha_comentario)}
                              </Typography>
                              {profile.rol === 'admin' && (
                                <Chip 
                                  label={usuarioInfo.rol} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: getRolColor(usuarioInfo.rol),
                                    color: COLOR_BLANCO,
                                    fontSize: '0.6rem',
                                    height: '20px'
                                  }}
                                />
                              )}
                            </Box>
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

                      {/* Descripción del comentario */}
                      <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.primary' }}>
                        "{comentarioItem.descripcion}"
                      </Typography>

                      {/* Información de la cancha */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SportsSoccer sx={{ fontSize: 16, color: COLOR_VERDE_LIMA }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {canchaInfo.nombre}
                        </Typography>
                        <Chip 
                          label={canchaInfo.tipo} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.6rem' }}
                        />
                        {canchaInfo.precio_por_hora && (
                          <Typography variant="caption" color="text.secondary">
                            • ${canchaInfo.precio_por_hora}/hora
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Información adicional para admin */}
                        {profile.rol === 'admin' && usuarioInfo.email && (
                          <Typography variant="caption" color="text.secondary">
                            Contacto: {usuarioInfo.email}
                          </Typography>
                        )}

                        {/* Botones de acción */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {(() => {
                            const isAdmin = profile.rol === 'admin';
                            const isOwner = comentarioItem.id_usuario === (profile.id_usuario || profile.id);
                            
                            // Mostrar botones si es el dueño Y no es admin
                            if (!isAdmin && isOwner) {
                              return (
                                <>
                                  <IconButton
                                    size="small"
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
                              );
                            }
                            return null;
                          })()}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
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

      {/* Dialog para calificar/editar */}
      <Dialog
        open={Boolean(ratingDialog)}
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
          {ratingDialog && comentarios.some(c => 
            c.id_cancha === ratingDialog.id_cancha && 
            c.id_usuario === (profile.id_usuario || profile.id)
          ) ? 'Actualizar Calificación' : 'Calificar Cancha'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {ratingDialog && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{ fontSize: '3rem', mb: 1 }}>
                  {getSportIcon(ratingDialog.cancha?.tipo)}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {ratingDialog.cancha?.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ratingDialog.cancha?.tipo}
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
            {ratingDialog && comentarios.some(c => 
              c.id_cancha === ratingDialog.id_cancha && 
              c.id_usuario === (profile.id_usuario || profile.id)
            ) ? 'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}