//responsive design 
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
  Badge
} from '@mui/material';
import {
  Star,
  Edit,
  Delete,
  SportsSoccer,
  LocationOn,
  Add as AddIcon,
  Comment,
  RateReview
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

  // Destructurar las dos listas del hook
  const {
    comentarios,
    reservasPendientes,
    loading,
    loadingReservas,
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

  // Helper functions
  const getUsuarioInfo = useCallback((idUsuario) => {
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
      rol: usuario.rol || 'cliente'
    };
  }, [usuariosCache]);

  const getCanchaInfo = useCallback((idCancha) => {
    const cancha = canchasCache[idCancha];
    if (!cancha) {
      return {
        nombre: `Cancha ${idCancha}`,
        tipo: 'No disponible',
        espacio: 'Cargando...',
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
      const allCanchaIds = [
        ...new Set(comentarios.map(c => c.id_cancha)),
        ...new Set(reservasPendientes.map(r => r.id_cancha))
      ].filter(id => id != null);

      const allUserIds = [...new Set(comentarios.map(c => c.id_usuario))].filter(id => id != null);

      if (allCanchaIds.length === 0 && allUserIds.length === 0) return;

      setLoadingAdditionalData(true);
      try {
        const newUsuariosCache = { ...usuariosCache };
        const newCanchasCache = { ...canchasCache };

        for (const id of allUserIds) {
          if (!newUsuariosCache[id]) {
            try {
              const userData = await usuariosApi.getById(id);
              newUsuariosCache[id] = userData;
            } catch {
              newUsuariosCache[id] = null;
            }
          }
        }

        for (const id of allCanchaIds) {
          if (!newCanchasCache[id]) {
            try {
              const canchaData = await canchasApi.getByIdPublic(id);
              newCanchasCache[id] = canchaData;
            } catch {
              newCanchasCache[id] = null;
            }
          }
        }

        setUsuariosCache(newUsuariosCache);
        setCanchasCache(newCanchasCache);
      } catch (error) {
        console.error('Error al cargar datos adicionales:', error);
      } finally {
        setLoadingAdditionalData(false);
      }
    };

    loadAdditionalData();
  }, [comentarios, reservasPendientes, usuariosCache, canchasCache]);

  // Dialog functions
  const handleOpenRatingDialog = useCallback((item) => {
    const canchaId = item.id_cancha;
    const canchaInfo = getCanchaInfo(canchaId);
    const userId = profile.id_usuario || profile.id;

    const existingComment = comentarios.find(c =>
      c.id_cancha === canchaId &&
      c.id_usuario === userId
    );

    if (existingComment) {
      setRatingValue(existingComment.calificacion || 0);
      setComentario(existingComment.descripcion || '');
      setRatingDialog({
        ...existingComment,
        cancha: canchaInfo,
      });
    } else {
      setRatingValue(0);
      setComentario('');
      setRatingDialog({
        ...item,
        cancha: canchaInfo,
      });
    }
  }, [getCanchaInfo, comentarios, profile]);

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

  // Helper functions
  const getSportIcon = (canchaTipo) => {
    const icons = {
      'Fútbol': '⚽', 'Futbol': '⚽', 'Básquetbol': '🏀', 'Basquetbol': '🏀',
      'Baloncesto': '🏀', 'Tenis': '🎾', 'Vóleibol': '🏐', 'Volleyball': '🏐',
      'Rugby': '🏉', 'Béisbol': '⚾', 'Beisbol': '⚾', 'Hockey': '🏒',
      'Ping Pong': '🏓', 'Boxeo': '🥊', 'Billar': '🎱', 'Natación': '🏊',
      'Atletismo': '🏃'
    };
    return icons[canchaTipo] || '🏆';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Fecha desconocida';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNombreUsuario = (comentarioItem) => {
    const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
    return `${usuarioInfo.nombre} ${usuarioInfo.apellido}`.trim();
  };

  const getInicialesUsuario = (comentarioItem) => {
    const usuarioInfo = getUsuarioInfo(comentarioItem.id_usuario);
    return `${usuarioInfo.nombre?.charAt(0) || ''}${usuarioInfo.apellido?.charAt(0) || ''}` || 'U';
  };

  const getRolColor = (rol) => {
    const colores = { 'admin': COLOR_ROJO, 'gestor': COLOR_AZUL_ELECTRICO, 'cliente': COLOR_VERDE_LIMA };
    return colores[rol] || COLOR_NARANJA_VIBRANTE;
  };

  if (loading || loadingReservas || loadingAdditionalData) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        p: 2
      }}>
        <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
        <Typography variant={isMobile ? "body2" : "body1"} sx={{ mt: 2, textAlign: 'center' }}>
          {loading ? 'Cargando calificaciones...' :
            loadingReservas ? 'Cargando reservas pendientes...' :
              'Cargando detalles de canchas...'}
        </Typography>
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

      {/* Tabs para móvil/tablet */}
      {profile?.rol !== 'admin' && (isMobile || isTablet) && (
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minHeight: '48px'
              }
            }}
          >
            <Tab
              icon={<Badge badgeContent={reservasPendientes.length} color="error" />}
              iconPosition="end"
              label="Pendientes"
              sx={{ color: activeTab === 0 ? COLOR_NARANJA_VIBRANTE : 'inherit' }}
            />
            <Tab
              icon={<Comment />}
              label="Mis Comentarios"
              sx={{ color: activeTab === 1 ? COLOR_AZUL_ELECTRICO : 'inherit' }}
            />
          </Tabs>
        </Box>
      )}

      {/* SECCIÓN 1: RESERVAS PENDIENTES */}
      {profile?.rol !== 'admin' && (!isMobile || activeTab === 0) && (
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

          {reservasPendientes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Star sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant={isMobile ? "body1" : "h6"} color="text.secondary">
                ¡Excelente! No tienes reservas pendientes de calificación.
              </Typography>
            </Box>
          ) : (
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Chip
                            icon={<LocationOn />}
                            label={canchaInfo.espacio}
                            size="small"
                            sx={{
                              mb: 1,
                              backgroundColor: COLOR_AZUL_ELECTRICO,
                              color: COLOR_BLANCO,
                              fontSize: { xs: '0.7rem', sm: '0.8rem' }
                            }}
                          />
                          <Typography
                            variant={isMobile ? "subtitle1" : "h6"}
                            sx={{
                              color: COLOR_NARANJA_VIBRANTE,
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            {canchaInfo.nombre}
                          </Typography>
                          <Typography
                            variant={isMobile ? "caption" : "body2"}
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {canchaInfo.tipo}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant={isMobile ? "caption" : "body2"}>
                            Fecha: {new Date(reserva.fecha_reserva).toLocaleDateString()}
                          </Typography>
                          <Typography variant={isMobile ? "caption" : "body2"}>
                            Horario: {reserva.hora_inicio} - {reserva.hora_fin}
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Star />}
                            onClick={() => handleOpenRatingDialog(reserva)}
                            size={isMobile ? "small" : "medium"}
                            fullWidth={isMobile}
                            sx={{
                              mt: 2,
                              backgroundColor: COLOR_VERDE_LIMA,
                              '&:hover': { backgroundColor: '#7BC829' },
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
          )}
        </Box>
      )}

      {/* Separador solo en desktop */}
      {profile?.rol !== 'admin' && !isMobile && !isTablet && <Divider sx={{ my: 4 }} />}

      {/* SECCIÓN 2: COMENTARIOS */}
      {(!isMobile || activeTab === 1) && (
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
              {profile?.rol === 'admin' ? 'Todos los Comentarios' : 'Mi Historial de Calificaciones'}
            </Typography>
            {profile?.rol === 'admin' && (
              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                Total: {comentarios.length} comentarios
              </Typography>
            )}
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
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
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                            flex: 1,
                            width: { xs: '100%', sm: 'auto' }
                          }}>
                            <Avatar sx={{
                              bgcolor: COLOR_AZUL_ELECTRICO,
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 }
                            }}>
                              {getInicialesUsuario(comentarioItem)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant={isMobile ? "subtitle1" : "h6"}
                                sx={{ fontWeight: 'bold' }}
                              >
                                {getNombreUsuario(comentarioItem)}
                              </Typography>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                                mt: 0.5
                              }}>
                                <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
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

                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'space-between', sm: 'flex-end' }
                          }}>
                            <Rating
                              value={comentarioItem.calificacion}
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
                              {comentarioItem.calificacion}/5
                            </Typography>
                          </Box>
                        </Box>

                        {/* Descripción */}
                        <Typography
                          variant={isMobile ? "body2" : "body1"}
                          sx={{
                            mb: 2,
                            fontStyle: 'italic',
                            color: 'text.primary',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          "{comentarioItem.descripcion || 'Sin comentario escrito.'}"
                        </Typography>

                        {/* Información de cancha */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 2,
                          flexWrap: 'wrap',
                          p: 1,
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

                        {/* Footer con acciones */}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: { xs: 1, sm: 0 }
                        }}>
                          {profile.rol === 'admin' && usuarioInfo.email && (
                            <Typography variant="caption" color="text.secondary">
                              Contacto: {usuarioInfo.email}
                            </Typography>
                          )}

                          {(() => {
                            const isAdmin = profile.rol === 'admin';
                            const isOwner = comentarioItem.id_usuario === (profile.id_usuario || profile.id);

                            if (!isAdmin && isOwner) {
                              return (
                                <Box sx={{
                                  display: 'flex',
                                  gap: 1,
                                  width: { xs: '100%', sm: 'auto' },
                                  justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                                }}>
                                  <IconButton
                                    size={isMobile ? "small" : "medium"}
                                    onClick={() => handleOpenRatingDialog(comentarioItem)}
                                    sx={{ color: COLOR_AZUL_ELECTRICO }}
                                  >
                                    <Edit fontSize={isMobile ? "small" : "medium"} />
                                  </IconButton>
                                  <IconButton
                                    size={isMobile ? "small" : "medium"}
                                    onClick={() => handleDeleteComment(comentarioItem.id_comentario)}
                                    sx={{ color: COLOR_NARANJA_VIBRANTE }}
                                  >
                                    <Delete fontSize={isMobile ? "small" : "medium"} />
                                  </IconButton>
                                </Box>
                              );
                            }
                            return null;
                          })()}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>

          {comentarios.length === 0 && (
            <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
              <Star sx={{ fontSize: { xs: 48, sm: 60, md: 80 }, color: 'grey.400', mb: 2 }} />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ color: 'grey.600', mb: 1 }}
              >
                {profile?.rol === 'admin' ? 'No hay comentarios en el sistema' : 'Aún no has realizado comentarios'}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* FAB para calificar en móvil */}
      {profile?.rol !== 'admin' && isMobile && reservasPendientes.length > 0 && (
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

      {/* Dialog Responsive */}
      <Dialog
        open={Boolean(ratingDialog)}
        onClose={() => setRatingDialog(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
            height: { xs: '100%', sm: 'auto' }
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
          {ratingDialog?.id_comentario ? 'Actualizar Calificación' : 'Calificar Reserva'}
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 2 } }}>
          {ratingDialog && (
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
                  sx={{ fontSize: { xs: '2.5rem', sm: '3rem' } }}
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
            }}
          >
            {ratingDialog?.id_comentario ? 'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}