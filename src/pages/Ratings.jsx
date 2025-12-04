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
  SportsSoccer,
  LocationOn
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Importamos el hook y las APIs necesarias para el cache
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
  
  // Destructurar las dos listas del hook
  const { 
    comentarios, 
    reservasPendientes,
    loading, 
    loadingReservas,
    handleSaveRating, 
    handleDeleteComment 
  } = useUserRatings();

  // Estados para cache de usuarios y canchas (para enriquecer la vista)
  const [usuariosCache, setUsuariosCache] = useState({});
  const [canchasCache, setCanchasCache] = useState({});
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  // Estados locales para el diálogo de calificación
  const [ratingDialog, setRatingDialog] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comentario, setComentario] = useState('');

  // ------------------------------------------------------------------
  // HELPER FUNCTIONS (DEPENDEN DE EL ESTADO DEL COMPONENTE)
  // ------------------------------------------------------------------

  // Función para obtener información del usuario (usando cache)
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

  // Función para obtener información de la cancha (usando cache)
  const getCanchaInfo = useCallback((idCancha) => {
    const cancha = canchasCache[idCancha];
    if (!cancha) {
      return {
        nombre: `Cancha ${idCancha}`,
        tipo: 'No disponible',
        espacio: 'Cargando Espacio...', // Texto mientras carga
        precio_por_hora: 'N/A'
      };
    }
    return {
      nombre: cancha.nombre || `Cancha ${idCancha}`,
      tipo: cancha.tipo || 'No especificado',
      // ** MODIFICACIÓN CLAVE **: Si 'espacio_deportivo' no se carga (falta joinedload), este fallback es más descriptivo
      espacio: cancha.espacio_deportivo?.nombre || 'Espacio no cargado', 
      precio_por_hora: cancha.precio_por_hora
    };
  }, [canchasCache]);


  // Función para abrir el diálogo (para crear una nueva o editar una existente)
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

  // ------------------------------------------------------------------
  // EFECTOS PARA EL CACHE DE DATOS ADICIONALES
  // ------------------------------------------------------------------

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
        // --- Cargar Usuarios ---
        const usuariosToLoad = allUserIds.filter(id => !usuariosCache[id]);
        if (usuariosToLoad.length > 0) {
          const newUsuariosCache = { ...usuariosCache };
          for (const id of usuariosToLoad) {
            try {
              const userData = await usuariosApi.getById(id);
              newUsuariosCache[id] = userData;
            } catch (error) {
              newUsuariosCache[id] = null;
            }
          }
          setUsuariosCache(newUsuariosCache);
        }

        // --- Cargar Canchas ---
        const canchasToLoad = allCanchaIds.filter(id => !canchasCache[id]);
        if (canchasToLoad.length > 0) {
          const newCanchasCache = { ...canchasCache };
          for (const id of canchasToLoad) {
            try {
              const canchaData = await canchasApi.getByIdPublic(id);
              newCanchasCache[id] = canchaData;
            } catch (error) {
              newCanchasCache[id] = null;
            }
          }
          setCanchasCache(newCanchasCache);
        }
      } catch (error) {
        console.error('Error al cargar datos adicionales:', error);
      } finally {
        setLoadingAdditionalData(false);
      }
    };

    loadAdditionalData();
  }, [comentarios, reservasPendientes, usuariosCache, canchasCache]);

  // ------------------------------------------------------------------
  // LÓGICA DEL DIÁLOGO Y SUBMIT
  // ------------------------------------------------------------------
  
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

  // Otras funciones auxiliares de formato...
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
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  
  // ------------------------------------------------------------------
  // RENDERIZADO
  // ------------------------------------------------------------------

  if (loading || loadingReservas || loadingAdditionalData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
        <Typography variant="body1" sx={{ ml: 2 }}>
            {loading ? 'Cargando calificaciones...' : loadingReservas ? 'Cargando reservas pendientes...' : 'Cargando detalles de canchas...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO, mb: 2 }}>
          {profile?.rol === 'admin' ? 'Gestión de Comentarios' : 'Mis Calificaciones'}
        </Typography>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 1: RESERVAS PENDIENTES DE CALIFICAR 📝 */}
      {/* ------------------------------------------------------------------ */}
      {profile?.rol !== 'admin' && (
        <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium', color: COLOR_NARANJA_VIBRANTE, borderBottom: `2px solid ${COLOR_VERDE_LIMA}` }}>
                Pendientes por Calificar ({reservasPendientes.length})
            </Typography>
            
            {reservasPendientes.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                    ¡Excelente! No tienes reservas completadas pendientes de calificación.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {reservasPendientes.map((reserva, index) => {
                        const canchaInfo = getCanchaInfo(reserva.id_cancha);
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card elevation={3} sx={{ height: '100%', borderLeft: `5px solid ${COLOR_VERDE_LIMA}` }}>
                                    <CardContent>
                                        <Chip
                                            icon={<LocationOn />}
                                            label={canchaInfo.espacio} 
                                            size="small"
                                            sx={{ mb: 1, backgroundColor: COLOR_AZUL_ELECTRICO, color: COLOR_BLANCO }}
                                        />
                                        <Typography variant="h6" sx={{ color: COLOR_NARANJA_VIBRANTE, fontWeight: 'bold' }}>
                                            {canchaInfo.nombre} 
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {canchaInfo.tipo} 
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2">
                                            Fecha: {new Date(reserva.fecha_reserva).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2">
                                            Horario: {reserva.hora_inicio} - {reserva.hora_fin}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Star />}
                                            onClick={() => handleOpenRatingDialog(reserva)}
                                            sx={{ mt: 2, backgroundColor: COLOR_VERDE_LIMA, '&:hover': { backgroundColor: '#7BC829' } }}
                                        >
                                            Calificar
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
      )}

      {/* Separador para clientes */}
      {profile?.rol !== 'admin' && <Divider sx={{ my: 4 }} />}

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 2: MI HISTORIAL DE COMENTARIOS 💬 */}
      {/* ------------------------------------------------------------------ */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO }}>
            {profile?.rol === 'admin' ? 'Todos los Comentarios' : 'Mi Historial de Calificaciones'}
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
                        "{comentarioItem.descripcion || 'Sin comentario escrito.'}"
                      </Typography>

                      {/* Información de la cancha/reserva (El detalle que solicitaste) */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap', p: 1, borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                        <LocationOn sx={{ fontSize: 16, color: COLOR_AZUL_ELECTRICO }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>
                            {canchaInfo.espacio} {/* Espacio Deportivo */}
                        </Typography>
                        <SportsSoccer sx={{ fontSize: 16, color: COLOR_VERDE_LIMA }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {canchaInfo.nombre} {/* Cancha */}
                        </Typography>
                        <Chip 
                          label={canchaInfo.tipo} // {/* Disciplina/Tipo */}
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.6rem' }}
                        />
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
                            
                            if (!isAdmin && isOwner) {
                              return (
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenRatingDialog(comentarioItem)}
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
          {ratingDialog?.id_comentario ? 'Actualizar Calificación' : 'Calificar Reserva'}
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
                  {ratingDialog.cancha?.espacio} - {ratingDialog.cancha?.tipo}
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
            {ratingDialog?.id_comentario ? 'Actualizar' : 'Enviar'} Calificación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}