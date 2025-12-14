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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fab,
  Badge,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import { 
  CalendarMonth,
  Edit,
  Cancel,
  CheckCircle,
  Person,
  SportsSoccer,
  AccessTime,
  AttachMoney,
  Star,
  ExpandMore,
  Schedule,
  LocationOn,
  Sports,
  Receipt,
  Info,
  RateReview,
  ArrowForward,
  MoreVert
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usuariosApi } from '../api/usuarios';
import { canchasApi } from '../api/canchas';
import { disciplinasApi } from '../api/disciplinas';
import { espaciosApi } from '../api/espacios';
import { useUserRatings } from '../hooks/useUserRatings';
import { useNavigate } from 'react-router-dom';

// Paleta de colores
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_ROJO = '#f44336';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';
const COLOR_AMARILLO = '#FFD700';

export default function Reservations() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Estados principales de reservas
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Estados de cache
  const [usuariosCache, setUsuariosCache] = useState({});
  const [canchasCache, setCanchasCache] = useState({});
  const [disciplinasCache, setDisciplinasCache] = useState({});
  const [espaciosCache, setEspaciosCache] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Hook para reservas pendientes de calificar
  const { 
    reservasPendientes, 
    loadingReservas,
    fetchReservasPendientes 
  } = useUserRatings();

  useEffect(() => {
    const loadData = async () => {
      await fetchReservas();
      if (profile?.rol === 'cliente' && fetchReservasPendientes) {
        await fetchReservasPendientes();
      }
    };
    
    loadData();
  }, [profile, fetchReservasPendientes]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      let data;
      
      if (profile?.rol === 'cliente') {
        data = await reservasApi.getByUsuario(profile.id);
      } else if (profile?.rol === 'gestor') {
        data = await reservasApi.getByGestor(profile.id);
      } else {
        data = await reservasApi.getAll();
      }
      
      setReservas(data || []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalles adicionales
  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (reservas.length === 0) return;

      try {
        setLoadingDetails(true);
        
        // Obtener IDs únicos
        const userIds = [...new Set(reservas
          .map(r => r.usuario?.id || r.id_usuario || r.id_cliente || r.idUsuario || r.id)
          .filter(Boolean)
        )];

        const canchaIds = [...new Set(reservas
          .map(r => r.cancha?.id || r.id_cancha)
          .filter(Boolean)
        )];

        const disciplinaIds = [...new Set(reservas
          .map(r => r.disciplina?.id || r.id_disciplina)
          .filter(Boolean)
        )];

        const espacioIds = [...new Set(reservas
          .map(r => r.cancha?.id_espacio_deportivo || r.espacio_deportivo?.id || r.id_espacio || r.cancha?.espacio_id || r.espacio_id)
          .filter(Boolean)
        )];

        // Fetch usuarios (solo para admin y gestor)
        if (profile?.rol === 'admin' || profile?.rol === 'gestor') {
          const newUsuariosCache = { ...usuariosCache };
          await Promise.all(
            userIds.filter(id => !usuariosCache[id]).map(async (id) => {
              try {
                const userData = await usuariosApi.getById(id);
                newUsuariosCache[id] = userData;
              } catch (error) {
                console.error(`Error al obtener usuario ${id}:`, error);
                newUsuariosCache[id] = null;
              }
            })
          );
          setUsuariosCache(newUsuariosCache);
        }

        // Fetch canchas
        const newCanchasCache = { ...canchasCache };
        await Promise.all(
          canchaIds.filter(id => !canchasCache[id]).map(async (id) => {
            try {
              const canchaData = profile?.rol === 'cliente' 
                ? await canchasApi.getByIdPublic(id)
                : await canchasApi.getById(id);
              newCanchasCache[id] = canchaData;
            } catch (error) {
              console.error(`Error al obtener cancha ${id}:`, error);
              newCanchasCache[id] = null;
            }
          })
        );
        setCanchasCache(newCanchasCache);

        // Fetch disciplinas
        const newDisciplinasCache = { ...disciplinasCache };
        await Promise.all(
          disciplinaIds.filter(id => !disciplinasCache[id]).map(async (id) => {
            try {
              const disciplinaData = await disciplinasApi.getById(id);
              newDisciplinasCache[id] = disciplinaData;
            } catch (error) {
              console.error(`Error al obtener disciplina ${id}:`, error);
              newDisciplinasCache[id] = null;
            }
          })
        );
        setDisciplinasCache(newDisciplinasCache);

        // Fetch espacios (solo para admin y gestor)
        if (profile?.rol === 'admin' || profile?.rol === 'gestor') {
          const newEspaciosCache = { ...espaciosCache };
          await Promise.all(
            espacioIds.filter(id => !espaciosCache[id]).map(async (id) => {
              try {
                const espacioData = await espaciosApi.getById(id);
                newEspaciosCache[id] = espacioData;
              } catch (error) {
                console.error(`Error al obtener espacio ${id}:`, error);
                newEspaciosCache[id] = null;
              }
            })
          );
          setEspaciosCache(newEspaciosCache);
        }

      } catch (error) {
        console.error('Error al cargar detalles adicionales:', error);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchAdditionalData();
  }, [reservas]);

  // Helper functions
  const getInfoUsuario = (reserva) => {
    if (profile?.rol === 'cliente') {
      return {
        nombre: profile?.nombre || 'Tú',
        apellido: profile?.apellido || '',
        email: profile?.email || 'No disponible',
        telefono: profile?.telefono || 'No disponible'
      };
    }

    const userId = reserva.usuario?.id || reserva.id_usuario || reserva.id_cliente || reserva.idUsuario || reserva.id;
    
    if (!userId) {
      return {
        nombre: 'Usuario no disponible',
        apellido: '',
        email: 'N/A',
        telefono: 'N/A'
      };
    }

    const usuario = usuariosCache[userId];
    
    if (!usuario) {
      return {
        nombre: 'Cargando...',
        apellido: '',
        email: 'Cargando...',
        telefono: 'Cargando...'
      };
    }

    return {
      nombre: usuario.nombre || 'No especificado',
      apellido: usuario.apellido || '',
      email: usuario.email || 'No disponible',
      telefono: usuario.telefono || 'No disponible'
    };
  };

  const getInfoCancha = (reserva) => {
    const canchaId = reserva.cancha?.id || reserva.id_cancha;
    
    if (!canchaId) {
      return {
        nombre: 'Cancha no disponible',
        tipo: 'No especificado',
        espacio: 'Espacio no disponible',
        disciplina: 'No especificada',
        precio_por_hora: 'N/A'
      };
    }

    const cancha = canchasCache[canchaId];
    
    if (!cancha) {
      return {
        nombre: 'Cargando...',
        tipo: 'Cargando...',
        espacio: 'Cargando...',
        disciplina: 'Cargando...',
        precio_por_hora: 'N/A'
      };
    }


    let espacioNombre;

    espacioNombre = cancha.espacio_deportivo?.nombre;

    if (!espacioNombre && (profile?.rol === 'admin' || profile?.rol === 'gestor')) {
        const espacioId = cancha.id_espacio_deportivo || cancha.id_espacio || cancha.espacio_id || reserva.id_espacio || reserva.espacio_id;      
        const espacio = espaciosCache[espacioId];
        espacioNombre = espacio?.nombre;
    }
    
    if (!espacioNombre) {
        espacioNombre = 'Espacio no disponible';
    }

    const disciplinaId = reserva.disciplina?.id || reserva.id_disciplina;
    const disciplina = disciplinasCache[disciplinaId];

    const disciplinaNombre = disciplina?.nombre || 'No especificada';

      return {
        nombre: cancha.nombre || `Cancha ${canchaId}`,
        tipo: cancha.tipo || 'No especificado',
        espacio: espacioNombre,
        disciplina: disciplinaNombre,
        precio_por_hora: cancha.precio_por_hora,
        hora_apertura: cancha.hora_apertura,
        hora_cierre: cancha.hora_cierre
      };
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#ff9800',
      confirmada: COLOR_VERDE_LIMA,
      en_curso: COLOR_AZUL_ELECTRICO,
      completada: '#4caf50',
      cancelada: COLOR_ROJO
    };
    return colores[estado] || '#9e9e9e';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'PENDIENTE',
      confirmada: 'CONFIRMADA',
      en_curso: 'EN CURSO',
      completada: 'COMPLETADA',
      cancelada: 'CANCELADA'
    };
    return textos[estado] || estado.toUpperCase();
  };

  const handleEstadoChange = async (reservaId, nuevoEstado) => {
    try {
      await reservasApi.update(reservaId, { estado: nuevoEstado });
      toast.success(`Reserva ${nuevoEstado} correctamente`);
      setEditDialog(null);
      fetchReservas();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      toast.error('Error al actualizar reserva');
    }
  };

  const handleCancelarReserva = async () => {
    if (!cancelDialog || !motivoCancelacion.trim()) return;

    try {
      await reservasApi.cancelar(cancelDialog.id_reserva, motivoCancelacion);
      toast.success('Reserva cancelada correctamente');
      setCancelDialog(null);
      setMotivoCancelacion('');
      fetchReservas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      toast.error('Error al cancelar reserva');
    }
  };

  const getCodigoReserva = (reserva) => {
    return reserva.codigo_reserva || `TEMP-${reserva.id_reserva}`;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return 'N/D';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatHora = (hora) => {
    if (!hora) return '--:--';
    if (typeof hora === 'string') {
      return hora.slice(0, 5);
    }
    return hora;
  };

  const puedeEditar = (reserva) => {
    if (profile?.rol === 'cliente') return false;
    if (profile?.rol === 'admin') return true;
    if (profile?.rol === 'gestor') {
      return true;
    }
    return false;
  };

  const redirectToRatings = () => {
    navigate('/calificaciones');
  };

  const toggleCardExpansion = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Estadísticas para admin/gestor
  const estadisticas = {
    total: reservas.length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    pendientes: reservas.filter(r => r.estado === 'pendiente').length,
    canceladas: reservas.filter(r => r.estado === 'cancelada').length,
    en_curso: reservas.filter(r => r.estado === 'en_curso').length,
    completadas: reservas.filter(r => r.estado === 'completada').length
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Responsive */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
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
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            {profile?.rol === 'cliente' ? 'Mis Reservas' : 'Gestión de Reservas'}
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {profile?.rol === 'cliente' 
              ? 'Consulta y gestiona tus reservas' 
              : 'Administra todas las reservas del sistema'
            }
          </Typography>
        </motion.div>
      </Box>

      {/* SECCIÓN: Reservas Pendientes de Calificar (SOLO CLIENTES) */}
      {profile?.rol === 'cliente' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            p: { xs: 2, sm: 3 },
            mb: 4,
            border: `2px solid ${COLOR_NARANJA_VIBRANTE}`,
            backgroundColor: `${COLOR_NARANJA_VIBRANTE}08`
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: COLOR_NARANJA_VIBRANTE, fontSize: { xs: 24, sm: 28 } }} />
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: COLOR_NARANJA_VIBRANTE 
                    }}
                  >
                    Pendientes de Calificar ({reservasPendientes?.length || 0})
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={redirectToRatings}
                  size={isMobile ? "small" : "medium"}
                  startIcon={<RateReview />}
                  endIcon={<ArrowForward />}
                  sx={{ 
                    color: COLOR_NARANJA_VIBRANTE, 
                    borderColor: COLOR_NARANJA_VIBRANTE,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: COLOR_NARANJA_VIBRANTE,
                      backgroundColor: `${COLOR_NARANJA_VIBRANTE}10`
                    }
                  }}
                >
                  {isMobile ? 'Calificar' : 'Ir a Calificar'}
                </Button>
              </Box>
              
              {loadingReservas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={30} sx={{ color: COLOR_NARANJA_VIBRANTE }} />
                </Box>
              ) : reservasPendientes?.length > 0 ? (
                <Grid container spacing={1.5}>
                  {reservasPendientes.slice(0, isMobile ? 2 : 3).map((reserva, index) => (
                    <Grid item xs={6} sm={4} key={index}>
                      <Card 
                        onClick={redirectToRatings}
                        sx={{ 
                          borderRadius: 2,
                          cursor: 'pointer',
                          backgroundColor: `${COLOR_NARANJA_VIBRANTE}15`,
                          border: `1px solid ${COLOR_NARANJA_VIBRANTE}40`,
                          transition: 'all 0.3s',
                          height: '100%',
                          '&:hover': { 
                            backgroundColor: `${COLOR_NARANJA_VIBRANTE}25`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Star sx={{ fontSize: 20, color: COLOR_NARANJA_VIBRANTE }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}
                              noWrap
                            >
                              {reserva.cancha?.nombre || `Cancha ${reserva.id_cancha}`}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              color: 'text.secondary',
                              fontSize: { xs: '0.65rem', sm: '0.75rem' }
                            }}
                          >
                            {reserva.fecha_reserva ? 
                              formatFechaCorta(reserva.fecha_reserva) : 
                              'Fecha no disponible'
                            }
                          </Typography>
                          <Chip 
                            label="PENDIENTE" 
                            size="small" 
                            sx={{ 
                              mt: 0.5,
                              backgroundColor: COLOR_NARANJA_VIBRANTE,
                              color: COLOR_BLANCO,
                              fontWeight: 'bold',
                              fontSize: '0.6rem',
                              height: 20
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  {reservasPendientes.length > (isMobile ? 2 : 3) && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          +{reservasPendientes.length - (isMobile ? 2 : 3)} más
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 3, 
                  backgroundColor: `${COLOR_VERDE_LIMA}15`, 
                  borderRadius: 2 
                }}>
                  <Star sx={{ 
                    fontSize: { xs: 40, sm: 48 }, 
                    color: COLOR_VERDE_LIMA, 
                    opacity: 0.5, 
                    mb: 1 
                  }} />
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    color="text.secondary"
                  >
                    ¡Genial! No tienes reservas pendientes de calificar.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ESTADÍSTICAS RÁPIDAS (Admin/Gestor) */}
      {(profile?.rol === 'admin' || profile?.rol === 'gestor') && reservas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 4 }}>
            {[
              { label: 'Total', value: estadisticas.total, color: COLOR_AZUL_ELECTRICO, icon: <CalendarMonth /> },
              { label: 'Confirmadas', value: estadisticas.confirmadas, color: COLOR_VERDE_LIMA, icon: <CheckCircle /> },
              { label: 'Pendientes', value: estadisticas.pendientes, color: COLOR_AMARILLO, icon: <Schedule /> },
              { label: 'Canceladas', value: estadisticas.canceladas, color: COLOR_ROJO, icon: <Cancel /> },
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: { xs: 1.5, sm: 2 },
                  backgroundColor: `${stat.color}15`,
                  border: `2px solid ${stat.color}`,
                  borderRadius: 2,
                  height: '100%'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 1 
                  }}>
                    <Box sx={{ 
                      backgroundColor: stat.color, 
                      color: COLOR_BLANCO, 
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: stat.color,
                      fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 'medium',
                      color: 'text.secondary',
                      fontSize: { xs: '0.7rem', sm: '0.875rem' }
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* LISTA DE RESERVAS */}
      {loadingDetails && reservas.length > 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: COLOR_AZUL_ELECTRICO }} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Cargando detalles de reservas...
          </Typography>
        </Box>
      ) : reservas.length > 0 ? (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {reservas.map((reserva, index) => {
            const infoUsuario = getInfoUsuario(reserva);
            const infoCancha = getInfoCancha(reserva);
            const isExpanded = expandedCard === reserva.id_reserva;

            return (
              <Grid item xs={12} key={reserva.id_reserva || index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  style={{ width: '100%' }} /* 🔥 AGREGADO: Forza que la animación ocupe todo el ancho */
                >
                  <Card sx={{ 
                    width: '100%', /* 🔥 AGREGADO: Forza que la tarjeta ocupe todo el ancho */
                    borderRadius: 2, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${getEstadoColor(reserva.estado)}`,
                    
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                    },
                    cursor: 'pointer',
                    
                    
                    minWidth: 450, 
                    maxWidth: 450, 
                    height: 450, // <-- Alto fijo
                    
                  }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      {/* Header de la reserva */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        mb: 2,
                        gap: 1
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: COLOR_AZUL_ELECTRICO,
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 }
                          }}>
                            <CalendarMonth />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant={isMobile ? "subtitle1" : "h6"} 
                              sx={{ fontWeight: 'bold' }}
                            >
                              Reserva #{getCodigoReserva(reserva)}
                            </Typography>
                            <Typography 
                              variant={isMobile ? "caption" : "body2"} 
                              color="text.secondary"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {formatFecha(reserva.fecha_reserva)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {formatHora(reserva.hora_inicio)} - {formatHora(reserva.hora_fin)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getEstadoTexto(reserva.estado)}
                            size={isMobile ? "small" : "medium"}
                            sx={{ 
                              backgroundColor: getEstadoColor(reserva.estado),
                              color: COLOR_BLANCO,
                              fontWeight: 'bold',
                              fontSize: { xs: '0.7rem', sm: '0.875rem' }
                            }}
                          />
                          
                          {/* Botón de acciones en móvil */}
                          {isMobile && puedeEditar(reserva) && reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                            <IconButton
                              size="small"
                              onClick={() => toggleCardExpansion(reserva.id_reserva)}
                            >
                              <MoreVert />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Información básica */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={profile?.rol === 'cliente' ? 12 : 6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <SportsSoccer sx={{ color: COLOR_NARANJA_VIBRANTE, fontSize: 20 }} />
                            <Box>
                              <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 'medium' }}>
                                {infoCancha.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {infoCancha.tipo} • {infoCancha.espacio}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={profile?.rol === 'cliente' ? 12 : 6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Person sx={{ color: COLOR_VERDE_LIMA, fontSize: 20 }} />
                            <Box>
                              <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 'medium' }}>
                                {infoUsuario.nombre} {infoUsuario.apellido}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {infoUsuario.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Información expandida (acordeón en móvil) */}
                      {isMobile ? (
                        <Accordion 
                          expanded={isExpanded}
                          onChange={() => toggleCardExpansion(reserva.id_reserva)}
                          sx={{ 
                            boxShadow: 'none',
                            backgroundColor: 'transparent',
                            '&:before': { display: 'none' }
                          }}
                        >
                          <AccordionSummary 
                            expandIcon={<ExpandMore />}
                            sx={{ 
                              p: 0,
                              minHeight: 'auto',
                              '& .MuiAccordionSummary-content': { 
                                my: 1,
                                justifyContent: 'space-between'
                              }
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Ver detalles
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0, mt: 2 }}>
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                              <Table size="small">
                                <TableBody>
                                  <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                      Disciplina
                                    </TableCell>
                                    <TableCell>{infoCancha.disciplina}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                      Costo
                                    </TableCell>
                                    <TableCell>${reserva.costo_total}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                      Asistentes
                                    </TableCell>
                                    <TableCell>{reserva.cantidad_asistentes || 0} personas</TableCell>
                                  </TableRow>
                                  {reserva.material_prestado && (
                                    <TableRow>
                                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                        Material
                                      </TableCell>
                                      <TableCell>{reserva.material_prestado}</TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      ) : (
                        /* Detalles en desktop/tablet */
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Sports sx={{ fontSize: 16, color: COLOR_AZUL_ELECTRICO }} />
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                Disciplina:
                              </Typography>
                            </Box>
                            <Typography variant="body2">{infoCancha.disciplina}</Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AttachMoney sx={{ fontSize: 16, color: COLOR_VERDE_LIMA }} />
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                Costo:
                              </Typography>
                            </Box>
                            <Typography variant="body2">${reserva.costo_total}</Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Person sx={{ fontSize: 16, color: COLOR_NARANJA_VIBRANTE }} />
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                Asistentes:
                              </Typography>
                            </Box>
                            <Typography variant="body2">{reserva.cantidad_asistentes || 0} personas</Typography>
                          </Grid>
                          {reserva.material_prestado && (
                            <Grid item xs={6} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Info sx={{ fontSize: 16, color: '#9c27b0' }} />
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  Material:
                                </Typography>
                              </Box>
                              <Typography variant="body2">{reserva.material_prestado}</Typography>
                            </Grid>
                          )}
                        </Grid>
                      )}

                      {/* Acciones (visible según tamaño de pantalla) */}
                      {puedeEditar(reserva) && reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                        <>
                          {!isMobile || isExpanded ? (
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1, 
                              flexWrap: 'wrap',
                              pt: 2,
                              borderTop: '1px solid #eee'
                            }}>
                              {reserva.estado === 'pendiente' && (
                                <Button
                                  variant="contained"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleEstadoChange(reserva.id_reserva, 'confirmada')}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{
                                    backgroundColor: COLOR_VERDE_LIMA,
                                    color: COLOR_NEGRO_SUAVE,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                      backgroundColor: COLOR_VERDE_LIMA,
                                      opacity: 0.9,
                                    },
                                  }}
                                >
                                  Confirmar
                                </Button>
                              )}
                              {reserva.estado === 'confirmada' && (
                                <Button
                                  variant="contained"
                                  onClick={() => handleEstadoChange(reserva.id_reserva, 'en_curso')}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{
                                    backgroundColor: COLOR_AZUL_ELECTRICO,
                                    color: COLOR_BLANCO,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                      backgroundColor: COLOR_AZUL_ELECTRICO,
                                      opacity: 0.9,
                                    },
                                  }}
                                >
                                  Iniciar
                                </Button>
                              )}
                              {reserva.estado === 'en_curso' && (
                                <Button
                                  variant="contained"
                                  onClick={() => handleEstadoChange(reserva.id_reserva, 'completada')}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{
                                    backgroundColor: '#4caf50',
                                    color: COLOR_BLANCO,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                      backgroundColor: '#388e3c',
                                    },
                                  }}
                                >
                                  Completar
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={() => setEditDialog(reserva)}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                  color: COLOR_AZUL_ELECTRICO,
                                  borderColor: COLOR_AZUL_ELECTRICO,
                                  '&:hover': {
                                    borderColor: COLOR_AZUL_ELECTRICO,
                                    backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                                  }
                                }}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Cancel />}
                                onClick={() => setCancelDialog(reserva)}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                  color: COLOR_ROJO,
                                  borderColor: COLOR_ROJO,
                                  '&:hover': {
                                    borderColor: COLOR_ROJO,
                                    backgroundColor: `${COLOR_ROJO}10`
                                  }
                                }}
                              >
                                Cancelar
                              </Button>
                            </Box>
                          ) : null}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ) : !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, sm: 8, md: 10 },
            backgroundColor: `${COLOR_AZUL_ELECTRICO}05`,
            borderRadius: 3
          }}>
            <CalendarMonth sx={{ 
              fontSize: { xs: 60, sm: 80, md: 100 }, 
              color: 'grey.400', 
              mb: 2 
            }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              No hay reservas {profile?.rol === 'cliente' ? 'tuyas' : 'en el sistema'}
            </Typography>
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary"
              sx={{ maxWidth: 400, mx: 'auto' }}
            >
              {profile?.rol === 'cliente' 
                ? 'Tus reservas aparecerán aquí cuando las realices' 
                : 'Las reservas de los usuarios aparecerán aquí'
              }
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* FAB para acciones rápidas en móvil */}
      {isMobile && (profile?.rol === 'admin' || profile?.rol === 'gestor') && (
        <Fab
          color="primary"
          onClick={() => {
            // Acción por defecto
          }}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: COLOR_AZUL_ELECTRICO,
            '&:hover': {
              backgroundColor: COLOR_AZUL_ELECTRICO,
              opacity: 0.9,
            },
          }}
        >
          <Edit />
        </Fab>
      )}

      {/* Dialog para editar estado */}
      <Dialog
        open={Boolean(editDialog)}
        onClose={() => setEditDialog(null)}
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
          Cambiar Estado de Reserva
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 3 } }}>
          {editDialog && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Reserva: <strong>#{getCodigoReserva(editDialog)}</strong>
              </Typography>
              <TextField
                fullWidth
                select
                label="Nuevo Estado"
                value={editDialog.estado}
                onChange={(e) => setEditDialog({...editDialog, estado: e.target.value})}
                size={isMobile ? "small" : "medium"}
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="en_curso">En Curso</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => setEditDialog(null)} 
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
            onClick={() => handleEstadoChange(editDialog.id_reserva, editDialog.estado)}
            variant="contained"
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
            Actualizar Estado
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cancelar reserva */}
      <Dialog
        open={Boolean(cancelDialog)}
        onClose={() => setCancelDialog(null)}
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
            backgroundColor: COLOR_ROJO, 
            color: COLOR_BLANCO, 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            py: { xs: 2, sm: 3 }
          }}
        >
          Cancelar Reserva
        </DialogTitle>
        <DialogContent sx={{ mt: { xs: 2, sm: 3 } }}>
          {cancelDialog && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres cancelar la reserva <strong>#{getCodigoReserva(cancelDialog)}</strong>?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                label="Motivo de cancelación"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Describe el motivo de la cancelación..."
                required
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
            onClick={() => {
              setCancelDialog(null);
              setMotivoCancelacion('');
            }} 
            sx={{ 
              color: 'text.secondary',
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 }
            }}
            size={isMobile ? "medium" : "large"}
          >
            Volver
          </Button>
          <Button
            onClick={handleCancelarReserva}
            variant="contained"
            disabled={!motivoCancelacion.trim()}
            size={isMobile ? "medium" : "large"}
            sx={{
              backgroundColor: COLOR_ROJO,
              color: COLOR_BLANCO,
              fontWeight: 'bold',
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 1, sm: 2 },
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(244, 67, 54, 0.5)'
              }
            }}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}