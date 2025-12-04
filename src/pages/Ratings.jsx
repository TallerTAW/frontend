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
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fab,
  Tabs,
  Tab,
  Badge,
  Alert
} from '@mui/material';
import {
  Star,
  Edit,
  Delete,
  SportsSoccer,
  LocationOn,
  RateReview,
  Comment,
  Person,
  AccessTime
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Importamos el hook y las APIs necesarias
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [activeTab, setActiveTab] = useState(0);

  // Usar el hook de calificaciones
  const {
    comentarios = [],
    reservasPendientes = [],
    loading = true,
    loadingReservas = true,
    handleSaveRating,
    handleDeleteComment
  } = useUserRatings();

  // Estados para cache
  const [usuariosCache, setUsuariosCache] = useState({});
  const [canchasCache, setCanchasCache] = useState({});
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  // Estados para el diálogo
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState(null);

  // Debug: Mostrar estado actual
  useEffect(() => {
    console.log('Estado actual:', {
      comentariosCount: comentarios?.length || 0,
      reservasPendientesCount: reservasPendientes?.length || 0,
      loading,
      loadingReservas,
      profile
    });
  }, [comentarios, reservasPendientes, loading, loadingReservas, profile]);

  // Helper functions
  const getUsuarioInfo = useCallback((idUsuario) => {
    const usuario = usuariosCache[idUsuario];
    if (!usuario) {
      return {
        nombre: 'Usuario',
        apellido: '',
        email: '',
        rol: 'cliente'
      };
    }
    return {
      nombre: usuario.nombre || 'Usuario',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      rol: usuario.rol || 'cliente'
    };
  }, [usuariosCache]);

  const getCanchaInfo = useCallback((idCancha) => {
    const cancha = canchasCache[idCancha];
    if (!cancha) {
      return {
        nombre: `Cancha ${idCancha}`,
        tipo: 'No disponible',
        espacio: 'Espacio no disponible',
        precio_por_hora: 'N/A'
      };
    }
    return {
      nombre: cancha.nombre || `Cancha ${idCancha}`,
      tipo: cancha.tipo || 'No especificado',
      espacio: cancha.espacio_deportivo?.nombre || 'Espacio no cargado',
      precio_por_hora: cancha.precio_por_hora
    };
  }, [canchasCache]);

  // Load additional data
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!comentarios || comentarios.length === 0) {
        setLoadingAdditionalData(false);
        return;
      }

      try {
        setLoadingAdditionalData(true);
        setError(null);

        // Obtener IDs únicos de usuarios y canchas
        const userIds = [...new Set(comentarios.map(c => c.id_usuario))].filter(Boolean);
        const canchaIds = [...new Set(comentarios.map(c => c.id_cancha))].filter(Boolean);

        console.log('Cargando datos adicionales:', { userIds, canchaIds });

        // Cargar usuarios
        const newUsuariosCache = { ...usuariosCache };
        for (const userId of userIds) {
          if (!newUsuariosCache[userId]) {
            try {
              const userData = await usuariosApi.getById(userId);
              newUsuariosCache[userId] = userData;
            } catch (err) {
              console.error(`Error cargando usuario ${userId}:`, err);
              newUsuariosCache[userId] = null;
            }
          }
        }

        // Cargar canchas
        const newCanchasCache = { ...canchasCache };
        for (const canchaId of canchaIds) {
          if (!newCanchasCache[canchaId]) {
            try {
              const canchaData = await canchasApi.getByIdPublic(canchaId);
              newCanchasCache[canchaId] = canchaData;
            } catch (err) {
              console.error(`Error cargando cancha ${canchaId}:`, err);
              newCanchasCache[canchaId] = null;
            }
          }
        }

        setUsuariosCache(newUsuariosCache);
        setCanchasCache(newCanchasCache);
      } catch (error) {
        console.error('Error en loadAdditionalData:', error);
        setError('Error al cargar información adicional');
      } finally {
        setLoadingAdditionalData(false);
      }
    };

    if (comentarios && comentarios.length > 0) {
      loadAdditionalData();
    }
  }, [comentarios]);

  // Dialog functions
  const handleOpenRatingDialog = useCallback((item) => {
    console.log('Abriendo diálogo para:', item);
    
    if (!item) {
      toast.error('No se pudo abrir el diálogo de calificación');
      return;
    }

    const canchaId = item.id_cancha;
    if (!canchaId) {
      toast.error('No se encontró información de la cancha');
      return;
    }

    const canchaInfo = getCanchaInfo(canchaId);
    const userId = profile?.id_usuario || profile?.id;

    if (!userId) {
      toast.error('No se pudo identificar al usuario');
      return;
    }

    // Buscar comentario existente
    const existingComment = comentarios?.find(c => 
      c?.id_cancha === canchaId && 
      c?.id_usuario === userId
    );

    console.log('Comentario existente:', existingComment);

    if (existingComment) {
      setRatingValue(existingComment.calificacion || 0);
      setComentario(existingComment.descripcion || '');
      setRatingDialog({
        ...existingComment,
        cancha: canchaInfo,
        isEdit: true
      });
    } else {
      setRatingValue(0);
      setComentario('');
      setRatingDialog({
        ...item,
        cancha: canchaInfo,
        isEdit: false
      });
    }
  }, [getCanchaInfo, comentarios, profile]);

  const handleSubmitRating = async () => {
    if (!ratingDialog) {
      toast.error('No hay información de calificación');
      return;
    }

    if (ratingValue === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    try {
      console.log('Enviando calificación:', {
        ratingDialog,
        ratingValue,
        comentario
      });

      const success = await handleSaveRating(
        ratingDialog,
        ratingValue,
        comentario
      );

      if (success) {
        toast.success(ratingDialog.isEdit ? 
          'Calificación actualizada correctamente' : 
          'Calificación enviada correctamente'
        );
        setRatingDialog(null);
        setRatingValue(0);
        setComentario('');
      }
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      toast.error('Error al enviar la calificación');
    }
  };

  // Helper functions
  const getSportIcon = (canchaTipo) => {
    if (!canchaTipo) return '🏆';
    
    const icons = {
      'fútbol': '⚽', 'futbol': '⚽', 'Fútbol': '⚽', 'Futbol': '⚽',
      'básquetbol': '🏀', 'basquetbol': '🏀', 'Baloncesto': '🏀', 'baloncesto': '🏀',
      'tenis': '🎾', 'Tenis': '🎾',
      'vóleibol': '🏐', 'voleibol': '🏐', 'Voleibol': '🏐',
      'pádel': '🎾', 'padel': '🎾', 'Pádel': '🎾',
      'natación': '🏊', 'Natación': '🏊'
    };
    
    return icons[canchaTipo.toLowerCase()] || '🏆';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getNombreUsuario = (comentarioItem) => {
    if (!comentarioItem?.id_usuario) return 'Usuario desconocido';
    
    const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
    return `${usuarioInfo.nombre} ${usuarioInfo.apellido}`.trim() || 'Usuario';
  };

  const getInicialesUsuario = (comentarioItem) => {
    if (!comentarioItem?.id_usuario) return 'U';
    
    const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
    const inicialNombre = usuarioInfo.nombre?.charAt(0) || '';
    const inicialApellido = usuarioInfo.apellido?.charAt(0) || '';
    return `${inicialNombre}${inicialApellido}` || 'U';
  };

  const getRolColor = (rol) => {
    const colores = { 
      'admin': COLOR_ROJO, 
      'gestor': COLOR_AZUL_ELECTRICO, 
      'cliente': COLOR_VERDE_LIMA 
    };
    return colores[rol?.toLowerCase()] || COLOR_NARANJA_VIBRANTE;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Loading state
  if (loading || loadingReservas) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        p: 3
      }}>
        <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO, mb: 2 }} />
        <Typography variant={isMobile ? "body1" : "h6"} sx={{ textAlign: 'center' }}>
          Cargando {loading ? 'calificaciones' : 'reservas pendientes'}...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Título Responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
          sx={{
            fontWeight: 'bold',
            color: COLOR_AZUL_ELECTRICO,
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}
        >
          {profile?.rol === 'admin' ? 'Gestión de Comentarios' : 'Mis Calificaciones'}
        </Typography>
      </motion.div>

      {/* Mostrar mensaje si no hay datos */}
      {!loading && !loadingReservas && !loadingAdditionalData && 
       (!comentarios || comentarios.length === 0) && 
       (!reservasPendientes || reservasPendientes.length === 0) && 
       profile?.rol !== 'admin' && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Star sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No tienes calificaciones pendientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Realiza una reserva para poder calificar las canchas
          </Typography>
        </Box>
      )}

      {/* Tabs para móvil/tablet */}
      {profile?.rol !== 'admin' && (isMobile || isTablet) && (
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: '48px',
                minWidth: 'auto'
              }
            }}
          >
            <Tab
              icon={
                <Badge 
                  badgeContent={reservasPendientes?.length || 0} 
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}
                />
              }
              iconPosition="end"
              label="Pendientes"
              sx={{ 
                color: activeTab === 0 ? COLOR_NARANJA_VIBRANTE : 'inherit',
                fontWeight: activeTab === 0 ? 'bold' : 'normal'
              }}
            />
            <Tab
              icon={<Comment />}
              label="Mis Comentarios"
              sx={{ 
                color: activeTab === 1 ? COLOR_AZUL_ELECTRICO : 'inherit',
                fontWeight: activeTab === 1 ? 'bold' : 'normal'
              }}
            />
          </Tabs>
        </Box>
      )}

      {/* SECCIÓN 1: RESERVAS PENDIENTES */}
      {profile?.rol !== 'admin' && 
       (!isMobile || activeTab === 0) && 
       reservasPendientes && 
       reservasPendientes.length > 0 && (
        <Box sx={{ mb: { xs: 4, sm: 5 } }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 'medium',
                color: COLOR_NARANJA_VIBRANTE,
                borderBottom: `2px solid ${COLOR_VERDE_LIMA}`,
                pb: 0.5,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Pendientes por Calificar ({reservasPendientes.length})
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {reservasPendientes.map((reserva, index) => {
              const canchaInfo = getCanchaInfo(reserva.id_cancha);

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      height: '100%',
                      borderLeft: `5px solid ${COLOR_VERDE_LIMA}`,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {canchaInfo.espacio}
                          </Typography>
                        </Box>
                        
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{
                            color: COLOR_NARANJA_VIBRANTE,
                            fontWeight: 'bold',
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            mb: 0.5
                          }}
                        >
                          {canchaInfo.nombre}
                        </Typography>
                        
                        <Typography
                          variant={isMobile ? "caption" : "body2"}
                          color="text.secondary"
                          sx={{ mb: 1.5 }}
                        >
                          {canchaInfo.tipo}
                        </Typography>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime sx={{ fontSize: 14, color: 'text.secondary', mr: 1 }} />
                          <Typography variant={isMobile ? "caption" : "body2"}>
                            {reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleDateString() : 'Fecha no disponible'}
                          </Typography>
                        </Box>
                        
                        <Typography variant={isMobile ? "caption" : "body2"}>
                          Horario: {reserva.hora_inicio || '--'} - {reserva.hora_fin || '--'}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          startIcon={<Star />}
                          onClick={() => handleOpenRatingDialog(reserva)}
                          size={isMobile ? "small" : "medium"}
                          fullWidth
                          sx={{
                            mt: 2,
                            backgroundColor: COLOR_VERDE_LIMA,
                            color: COLOR_BLANCO,
                            fontWeight: 'bold',
                            '&:hover': { 
                              backgroundColor: '#7BC829',
                              boxShadow: '0 4px 8px rgba(162, 232, 49, 0.3)'
                            },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          Calificar
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Separador solo en desktop */}
      {profile?.rol !== 'admin' && !isMobile && !isTablet && 
       reservasPendientes?.length > 0 && 
       comentarios?.length > 0 && (
        <Divider sx={{ my: 4 }} />
      )}

      {/* SECCIÓN 2: COMENTARIOS */}
      {((!isMobile && !isTablet) || (isMobile && activeTab === 1) || profile?.rol === 'admin') && (
        <Box>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 'bold',
                color: COLOR_AZUL_ELECTRICO,
                fontSize: { xs: '1.125rem', sm: '1.5rem' }
              }}
            >
              {profile?.rol === 'admin' ? 'Todos los Comentarios' : 'Mis Calificaciones'}
              {profile?.rol === 'admin' && comentarios && (
                <Typography 
                  component="span" 
                  variant="body2" 
                  sx={{ ml: 1, color: 'text.secondary' }}
                >
                  ({comentarios.length})
                </Typography>
              )}
            </Typography>
          </Box>

          {loadingAdditionalData ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ color: COLOR_AZUL_ELECTRICO }} />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Cargando detalles...
              </Typography>
            </Box>
          ) : comentarios && comentarios.length > 0 ? (
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {comentarios.map((comentarioItem, index) => {
                const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
                const canchaInfo = getCanchaInfo(comentarioItem.id_cancha);
                const isOwner = comentarioItem.id_usuario === (profile?.id_usuario || profile?.id);

                return (
                  <Grid item xs={12} key={comentarioItem.id_comentario || index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card sx={{
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderLeft: isOwner ? `4px solid ${COLOR_VERDE_LIMA}` : 'none'
                      }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          {/* Header del comentario */}
                          <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mb: 2,
                            gap: { xs: 2, sm: 0 }
                          }}>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              flex: 1
                            }}>
                              <Avatar sx={{
                                bgcolor: COLOR_AZUL_ELECTRICO,
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 }
                              }}>
                                {getInicialesUsuario(comentarioItem)}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant={isMobile ? "subtitle1" : "h6"}
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {getNombreUsuario(comentarioItem)}
                                  {isOwner && (
                                    <Chip 
                                      label="Tú" 
                                      size="small" 
                                      sx={{ 
                                        ml: 1, 
                                        backgroundColor: COLOR_VERDE_LIMA,
                                        color: COLOR_BLANCO,
                                        fontSize: '0.6rem',
                                        height: 20
                                      }}
                                    />
                                  )}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(comentarioItem.fecha_comentario)}
                                  </Typography>
                                  {profile?.rol === 'admin' && (
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

                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <Rating
                                value={comentarioItem.calificacion || 0}
                                readOnly
                                size={isMobile ? "small" : "medium"}
                              />
                              <Typography
                                variant={isMobile ? "subtitle2" : "h6"}
                                sx={{
                                  color: COLOR_NARANJA_VIBRANTE,
                                  fontWeight: 'bold',
                                  ml: 1
                                }}
                              >
                                {comentarioItem.calificacion || 0}/5
                              </Typography>
                            </Box>
                          </Box>

                          {/* Descripción */}
                          {comentarioItem.descripcion && (
                            <Typography
                              variant={isMobile ? "body2" : "body1"}
                              sx={{
                                mb: 2,
                                fontStyle: 'italic',
                                color: 'text.primary',
                                backgroundColor: 'rgba(0, 191, 255, 0.05)',
                                p: 2,
                                borderRadius: 1,
                                borderLeft: `3px solid ${COLOR_AZUL_ELECTRICO}`
                              }}
                            >
                              "{comentarioItem.descripcion}"
                            </Typography>
                          )}

                          {/* Información de cancha */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2,
                            flexWrap: 'wrap',
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: '#f9f9f9'
                          }}>
                            <LocationOn sx={{ fontSize: 16, color: COLOR_AZUL_ELECTRICO }} />
                            <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontWeight: 'medium', mr: 1 }}>
                              {canchaInfo.espacio}
                            </Typography>
                            <SportsSoccer sx={{ fontSize: 16, color: COLOR_VERDE_LIMA }} />
                            <Typography variant={isMobile ? "caption" : "body2"} sx={{ fontWeight: 'medium' }}>
                              {canchaInfo.nombre}
                            </Typography>
                            <Chip
                              label={canchaInfo.tipo}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem' }}
                            />
                          </Box>

                          {/* Acciones */}
                          {!profile?.rol === 'admin' && isOwner && (
                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: 1
                            }}>
                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                onClick={() => handleOpenRatingDialog(comentarioItem)}
                                sx={{ 
                                  color: COLOR_AZUL_ELECTRICO,
                                  '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}15` }
                                }}
                                title="Editar calificación"
                              >
                                <Edit fontSize={isMobile ? "small" : "medium"} />
                              </IconButton>
                              <IconButton
                                size={isMobile ? "small" : "medium"}
                                onClick={() => handleDeleteComment(comentarioItem.id_comentario)}
                                sx={{ 
                                  color: COLOR_ROJO,
                                  '&:hover': { backgroundColor: `${COLOR_ROJO}15` }
                                }}
                                title="Eliminar calificación"
                              >
                                <Delete fontSize={isMobile ? "small" : "medium"} />
                              </IconButton>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
              <Comment sx={{ fontSize: { xs: 48, sm: 60, md: 80 }, color: 'grey.400', mb: 2 }} />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ color: 'grey.600', mb: 1 }}
              >
                {profile?.rol === 'admin' ? 'No hay comentarios en el sistema' : 'Aún no has realizado comentarios'}
              </Typography>
              {profile?.rol !== 'admin' && (
                <Typography variant="body2" color="text.secondary">
                  Realiza una reserva y califica para ver tus comentarios aquí
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* FAB para calificar en móvil */}
      {profile?.rol !== 'admin' && 
       isMobile && 
       reservasPendientes && 
       reservasPendientes.length > 0 && (
        <Fab
          color="primary"
          onClick={() => {
            if (reservasPendientes.length > 0) {
              handleOpenRatingDialog(reservasPendientes[0]);
            }
          }}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: COLOR_VERDE_LIMA,
            '&:hover': {
              backgroundColor: '#7BC829',
            },
          }}
        >
          <RateReview />
        </Fab>
      )}

      {/* Dialog para calificar */}
      <Dialog
        open={Boolean(ratingDialog)}
        onClose={() => setRatingDialog(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 }
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: COLOR_AZUL_ELECTRICO,
            color: COLOR_BLANCO,
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            py: { xs: 2, sm: 3 }
          }}
        >
          {ratingDialog?.isEdit ? 'Actualizar Calificación' : 'Calificar Reserva'}
        </DialogTitle>
        
        <DialogContent sx={{ mt: { xs: 2, sm: 2 } }}>
          {ratingDialog && ratingDialog.cancha && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography sx={{
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                  mb: 1
                }}>
                  {getSportIcon(ratingDialog.cancha?.tipo)}
                </Typography>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ fontWeight: 'bold' }}
                >
                  {ratingDialog.cancha?.nombre}
                </Typography>
                <Typography
                  variant={isMobile ? "body2" : "body1"}
                  color="text.secondary"
                >
                  {ratingDialog.cancha?.espacio} - {ratingDialog.cancha?.tipo}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant={isMobile ? "body1" : "h6"}
                  sx={{ mb: 2, fontWeight: 'medium' }}
                >
                  ¿Cómo calificarías tu experiencia?
                </Typography>
                <Rating
                  value={ratingValue}
                  onChange={(e, newValue) => setRatingValue(newValue)}
                  size="large"
                  sx={{ 
                    fontSize: { xs: '2.5rem', sm: '3rem' },
                    '& .MuiRating-icon': {
                      margin: { xs: '0 2px', sm: '0 4px' }
                    }
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Comentario (opcional)"
                multiline
                rows={isMobile ? 3 : 4}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Comparte tu experiencia con otros usuarios..."
                helperText="Tu comentario ayudará a otros usuarios a elegir la mejor cancha"
                size={isMobile ? "small" : "medium"}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button
            onClick={() => setRatingDialog(null)}
            sx={{
              color: 'text.secondary',
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 }
            }}
            size={isMobile ? "medium" : "large"}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitRating}
            variant="contained"
            disabled={ratingValue === 0}
            size={isMobile ? "medium" : "large"}
            sx={{
              backgroundColor: COLOR_NARANJA_VIBRANTE,
              color: COLOR_BLANCO,
              fontWeight: 'bold',
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 1, sm: 2 },
              '&:hover': {
                backgroundColor: '#CC6A11',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(253, 126, 20, 0.5)'
              }
            }}
          >
            {ratingDialog?.isEdit ? 'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}