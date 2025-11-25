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
  CircularProgress
} from '@mui/material';
import { 
  CalendarMonth,
  Edit,
  Cancel,
  CheckCircle,
  Person,
  SportsSoccer,
  LocationOn,
  AccessTime,
  AttachMoney,
  Stadium,
  Star
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

export default function Reservations() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales de reservas
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  
  // Estados de cache
  const [usuariosCache, setUsuariosCache] = useState({});
  const [usuariosFetching, setUsuariosFetching] = useState({});
  const [canchasCache, setCanchasCache] = useState({});
  const [canchasFetching, setCanchasFetching] = useState({});
  const [disciplinasCache, setDisciplinasCache] = useState({});
  const [disciplinasFetching, setDisciplinasFetching] = useState({});
  const [espaciosCache, setEspaciosCache] = useState({});
  const [espaciosFetching, setEspaciosFetching] = useState({});

  // Hook para reservas pendientes de calificar (solo clientes)
  const { 
    reservasPendientes, 
    loadingReservas,
    fetchReservasPendientes 
  } = useUserRatings();

  useEffect(() => {
    fetchReservas();
    // Solo cargar reservas pendientes si es cliente
    if (profile && profile.rol === 'cliente') {
      fetchReservasPendientes();
    }
  }, [profile]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      let data;
      
      if (profile.rol === 'cliente') {
        data = await reservasApi.getByUsuario(profile.id);
      } else if (profile.rol === 'gestor') {
        data = await reservasApi.getByGestor(profile.id);
      } else {
        data = await reservasApi.getAll();
      }
      
      setReservas(data);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fetch usuarios, canchas, disciplinas y espacios cuando tengamos reservas
  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (reservas.length === 0) return;

      // IDs únicos para cada entidad
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
        .map(r => r.cancha?.id_espacio_deportivo || r.espacio_deportivo?.id || r.id_espacio)
        .filter(Boolean)
      )];

      // Fetch usuarios (solo para admin y gestor)
      if (profile.rol === 'admin' || profile.rol === 'gestor') {
        const usuariosToFetch = userIds.filter(id => 
          !(id in usuariosCache) && !(id in usuariosFetching)
        );
        
        if (usuariosToFetch.length > 0) {
          const newFetching = { ...usuariosFetching };
          usuariosToFetch.forEach(id => { newFetching[id] = true; });
          setUsuariosFetching(newFetching);

          try {
            const usuariosPromises = usuariosToFetch.map(async (id) => {
              try {
                const userData = await usuariosApi.getById(id);
                return { id, data: userData };
              } catch (error) {
                console.error(`Error al obtener usuario ${id}:`, error);
                return { id, data: null };
              }
            });

            const usuariosResults = await Promise.all(usuariosPromises);
            const newCache = { ...usuariosCache };
            usuariosResults.forEach(({ id, data }) => {
              newCache[id] = data;
            });
            setUsuariosCache(newCache);
          } finally {
            const cleanedFetching = { ...usuariosFetching };
            usuariosToFetch.forEach(id => { delete cleanedFetching[id]; });
            setUsuariosFetching(cleanedFetching);
          }
        }
      }

      // Fetch canchas - PARA TODOS LOS ROLES (incluyendo clientes)
      const canchasToFetch = canchaIds.filter(id => 
        !(id in canchasCache) && !(id in canchasFetching)
      );
      
      if (canchasToFetch.length > 0) {
        const newFetching = { ...canchasFetching };
        canchasToFetch.forEach(id => { newFetching[id] = true; });
        setCanchasFetching(newFetching);

        try {
          const canchasPromises = canchasToFetch.map(async (id) => {
            try {
              // Para clientes usar endpoint público, para otros roles usar endpoint normal
              const canchaData = profile.rol === 'cliente' 
                ? await canchasApi.getByIdPublic(id)
                : await canchasApi.getById(id);
              return { id, data: canchaData };
            } catch (error) {
              console.error(`Error al obtener cancha ${id}:`, error);
              // Si falla, intentar con endpoint público como fallback
              try {
                const canchaDataPublic = await canchasApi.getByIdPublic(id);
                return { id, data: canchaDataPublic };
              } catch (error2) {
                console.error(`Error al obtener cancha pública ${id}:`, error2);
                return { id, data: null };
              }
            }
          });

          const canchasResults = await Promise.all(canchasPromises);
          const newCache = { ...canchasCache };
          canchasResults.forEach(({ id, data }) => {
            newCache[id] = data;
          });
          setCanchasCache(newCache);
        } finally {
          const cleanedFetching = { ...canchasFetching };
          canchasToFetch.forEach(id => { delete cleanedFetching[id]; });
          setCanchasFetching(cleanedFetching);
        }
      }

      // Fetch disciplinas - PARA TODOS LOS ROLES
      const disciplinasToFetch = disciplinaIds.filter(id => 
        !(id in disciplinasCache) && !(id in disciplinasFetching)
      );
      
      if (disciplinasToFetch.length > 0) {
        const newFetching = { ...disciplinasFetching };
        disciplinasToFetch.forEach(id => { newFetching[id] = true; });
        setDisciplinasFetching(newFetching);

        try {
          const disciplinasPromises = disciplinasToFetch.map(async (id) => {
            try {
              const disciplinaData = await disciplinasApi.getById(id);
              return { id, data: disciplinaData };
            } catch (error) {
              console.error(`Error al obtener disciplina ${id}:`, error);
              return { id, data: null };
            }
          });

          const disciplinasResults = await Promise.all(disciplinasPromises);
          const newCache = { ...disciplinasCache };
          disciplinasResults.forEach(({ id, data }) => {
            newCache[id] = data;
          });
          setDisciplinasCache(newCache);
        } finally {
          const cleanedFetching = { ...disciplinasFetching };
          disciplinasToFetch.forEach(id => { delete cleanedFetching[id]; });
          setDisciplinasFetching(cleanedFetching);
        }
      }

      // Fetch espacios deportivos (solo para admin y gestor)
      if (profile.rol === 'admin' || profile.rol === 'gestor') {
        const espaciosToFetch = espacioIds.filter(id => 
          !(id in espaciosCache) && !(id in espaciosFetching)
        );
        
        if (espaciosToFetch.length > 0) {
          const newFetching = { ...espaciosFetching };
          espaciosToFetch.forEach(id => { newFetching[id] = true; });
          setEspaciosFetching(newFetching);

          try {
            const espaciosPromises = espaciosToFetch.map(async (id) => {
              try {
                const espacioData = await espaciosApi.getById(id);
                return { id, data: espacioData };
              } catch (error) {
                console.error(`Error al obtener espacio ${id}:`, error);
                return { id, data: null };
              }
            });

            const espaciosResults = await Promise.all(espaciosPromises);
            const newCache = { ...espaciosCache };
            espaciosResults.forEach(({ id, data }) => {
              newCache[id] = data;
            });
            setEspaciosCache(newCache);
          } finally {
            const cleanedFetching = { ...espaciosFetching };
            espaciosToFetch.forEach(id => { delete cleanedFetching[id]; });
            setEspaciosFetching(cleanedFetching);
          }
        }
      }
    };

    fetchAdditionalData();
  }, [reservas]);

  // Función segura para obtener información del usuario (solo para admin/gestor)
  const getInfoUsuario = (reserva) => {
    if (profile.rol === 'cliente') {
      // Cliente no necesita info de otros usuarios
      return {
        nombre: 'Tu información',
        apellido: '',
        email: profile.email || 'No disponible',
        telefono: 'No disponible'
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

  // Función segura para obtener información de la cancha (PARA TODOS LOS ROLES)
  const getInfoCancha = (reserva) => {
    const canchaId = reserva.cancha?.id || reserva.id_cancha;
    
    if (!canchaId) {
      return {
        nombre: 'Cancha no disponible',
        tipo: 'No especificado',
        espacio: 'Espacio no disponible',
        disciplina: 'No especificada'
      };
    }

    const cancha = canchasCache[canchaId];
    
    if (!cancha) {
      return {
        nombre: 'Cargando...',
        tipo: 'Cargando...',
        espacio: 'Cargando...',
        disciplina: 'Cargando...'
      };
    }

    // Obtener información del espacio deportivo (solo si está disponible)
    let espacioNombre = 'Espacio no disponible';
    if (profile.rol === 'admin' || profile.rol === 'gestor') {
      const espacioId = cancha.id_espacio_deportivo;
      const espacio = espaciosCache[espacioId];
      espacioNombre = espacio?.nombre || 'Espacio no disponible';
    } else {
      // Para clientes, usar el nombre del espacio si viene en los datos de la cancha
      espacioNombre = cancha.espacio_deportivo?.nombre || 'Espacio no disponible';
    }

    // Obtener información de la disciplina
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

  // Función segura para obtener información de la disciplina
  const getInfoDisciplina = (reserva) => {
    const disciplinaId = reserva.disciplina?.id || reserva.id_disciplina;
    
    if (!disciplinaId) {
      return 'No especificada';
    }

    const disciplina = disciplinasCache[disciplinaId];
    
    if (!disciplina) {
      return 'Cargando...';
    }

    return disciplina.nombre || 'No especificada';
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

  // Función segura para obtener el código de reserva
  const getCodigoReserva = (reserva) => {
    return reserva.codigo_reserva || `TEMP-${reserva.id_reserva}`;
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
    return textos[estado] || estado;
  };

  const puedeEditar = (reserva) => {
    if (profile.rol === 'cliente') return false;
    if (profile.rol === 'admin') return true;
    if (profile.rol === 'gestor') {
      return true;
    }
    return false;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHora = (hora) => {
    if (typeof hora === 'string') {
      return hora.slice(0, 5);
    }
    return hora;
  };

  const redirectToRatings = () => {
    navigate('/ratings');
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
          {profile?.rol === 'cliente' ? 'Mis Reservas' : 'Gestión de Reservas'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {profile?.rol === 'cliente' 
            ? 'Consulta y gestiona tus reservas' 
            : 'Administra todas las reservas del sistema'
          }
        </Typography>
      </motion.div>

      {/* NUEVA SECCIÓN: Reservas Pendientes de Calificar (SOLO PARA CLIENTES) */}
      {profile?.rol === 'cliente' && (
        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          p: 3, 
          mb: 4,
          border: `2px solid ${COLOR_NARANJA_VIBRANTE}` 
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_NARANJA_VIBRANTE }}>
                Reservas Pendientes de Calificar ({reservasPendientes.length})
              </Typography>
              <Button
                variant="text"
                onClick={redirectToRatings}
                sx={{ color: COLOR_NARANJA_VIBRANTE, fontWeight: 'bold' }}
              >
                Ir a Calificar
              </Button>
            </Box>
            
            {loadingReservas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : reservasPendientes.length > 0 ? (
              <Grid container spacing={2}>
                {reservasPendientes.slice(0, 3).map((reserva) => (
                  <Grid item xs={12} md={4} key={reserva.id_reserva}>
                    <Card 
                      onClick={redirectToRatings}
                      sx={{ 
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: 'warning.light',
                        transition: 'all 0.3s',
                        '&:hover': { bgcolor: 'warning.main', color: 'white' }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ color: COLOR_BLANCO }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {reserva.cancha?.nombre || `Cancha ${reserva.id_cancha}`}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES')}
                        </Typography>
                        <Chip 
                          label="PENDIENTE" 
                          size="small" 
                          sx={{ 
                            mt: 1,
                            backgroundColor: COLOR_NARANJA_VIBRANTE,
                            color: COLOR_BLANCO,
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {reservasPendientes.length > 3 && (
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      +{reservasPendientes.length - 3} más. {' '}
                      <Button onClick={redirectToRatings} size="small">Ver todas</Button>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Star sx={{ fontSize: 40, color: COLOR_VERDE_LIMA, opacity: 0.5, mb: 1 }} />
                <Typography color="text.secondary">
                  ¡Genial! No tienes reservas pendientes de calificar.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas rápidas para admin/gestor */}
      {(profile.rol === 'admin' || profile.rol === 'gestor') && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4">{reservas.length}</Typography>
              <Typography variant="body2">Total</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h4">
                {reservas.filter(r => r.estado === 'confirmada').length}
              </Typography>
              <Typography variant="body2">Confirmadas</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h4">
                {reservas.filter(r => r.estado === 'pendiente').length}
              </Typography>
              <Typography variant="body2">Pendientes</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', color: 'white' }}>
              <Typography variant="h4">
                {reservas.filter(r => r.estado === 'cancelada').length}
              </Typography>
              <Typography variant="body2">Canceladas</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* LISTA PRINCIPAL DE RESERVAS */}
      <Grid container spacing={3}>
        {reservas.map((reserva, index) => {
          const infoUsuario = getInfoUsuario(reserva);
          const infoCancha = getInfoCancha(reserva);
          const infoDisciplina = getInfoDisciplina(reserva);
          
          return (
            <Grid item xs={12} key={reserva.id_reserva}>
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
                          <CalendarMonth />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Reserva #{getCodigoReserva(reserva)}
                            {!reserva.codigo_reserva && (
                              <Chip 
                                label="Temporal" 
                                size="small" 
                                color="warning"
                                sx={{ ml: 1, fontSize: '0.6rem' }}
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFecha(reserva.fecha_reserva)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={getEstadoTexto(reserva.estado)}
                          sx={{ 
                            backgroundColor: getEstadoColor(reserva.estado),
                            color: COLOR_BLANCO,
                            fontWeight: 'bold'
                          }}
                        />
                        
                        {/* Botones de acción */}
                        {puedeEditar(reserva) && reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => setEditDialog(reserva)}
                              sx={{ color: COLOR_AZUL_ELECTRICO }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => setCancelDialog(reserva)}
                              sx={{ color: COLOR_ROJO }}
                            >
                              <Cancel />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                      {/* Información del Cliente (solo para admin/gestor) */}
                      {(profile.rol === 'admin' || profile.rol === 'gestor') && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ mb: 2, color: COLOR_AZUL_ELECTRICO, fontWeight: 'bold' }}>
                            Información del Cliente
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Person sx={{ color: COLOR_VERDE_LIMA }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {infoUsuario.nombre} {infoUsuario.apellido}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {infoUsuario.email}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tel: {infoUsuario.telefono}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}

                      {/* Información de la Cancha (PARA TODOS LOS ROLES) */}
                      <Grid item xs={12} md={profile.rol === 'cliente' ? 12 : 6}>
                        <Typography variant="h6" sx={{ mb: 2, color: COLOR_AZUL_ELECTRICO, fontWeight: 'bold' }}>
                          Información de la Cancha
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <SportsSoccer sx={{ color: COLOR_NARANJA_VIBRANTE }} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {infoCancha.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tipo: {infoCancha.tipo}
                            </Typography>
                            {/*
                            <Typography variant="body2" color="text.secondary">
                              Disciplina: {infoCancha.disciplina}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Stadium sx={{ fontSize: 16, color: COLOR_VERDE_LIMA }} />
                              <Typography variant="caption" color="text.secondary">
                                {infoCancha.espacio}
                              </Typography>
                            </Box>
                            */}
                            {infoCancha.precio_por_hora && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Precio/hora: ${infoCancha.precio_por_hora}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Detalles de la Reserva */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2, color: COLOR_AZUL_ELECTRICO, fontWeight: 'bold' }}>
                          Detalles de la Reserva
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 20, color: COLOR_VERDE_LIMA }} />
                            <Typography variant="body2">
                              <strong>Horario:</strong> {formatHora(reserva.hora_inicio)} - {formatHora(reserva.hora_fin)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney sx={{ fontSize: 20, color: COLOR_VERDE_LIMA }} />
                            <Typography variant="body2">
                              <strong>Costo:</strong> ${reserva.costo_total}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            <strong>Disciplina:</strong> {infoDisciplina}
                          </Typography>
                          {reserva.cantidad_asistentes && (
                            <Typography variant="body2">
                              <strong>Asistentes:</strong> {reserva.cantidad_asistentes} personas
                            </Typography>
                          )}
                          {reserva.material_prestado && (
                            <Typography variant="body2">
                              <strong>Material:</strong> {reserva.material_prestado}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      {/* Información Adicional */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2, color: COLOR_AZUL_ELECTRICO, fontWeight: 'bold' }}>
                          Información Adicional
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2">
                            <strong>Creada:</strong> {new Date(reserva.fecha_creacion).toLocaleString('es-ES')}
                          </Typography>
                          {reserva.fecha_actualizacion && (
                            <Typography variant="body2">
                              <strong>Actualizada:</strong> {new Date(reserva.fecha_actualizacion).toLocaleString('es-ES')}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>ID Reserva:</strong> {reserva.id_reserva}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Acciones rápidas para admin/gestor */}
                    {puedeEditar(reserva) && reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {reserva.estado === 'pendiente' && (
                            <Button
                              variant="contained"
                              startIcon={<CheckCircle />}
                              onClick={() => handleEstadoChange(reserva.id_reserva, 'confirmada')}
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
                              sx={{
                                backgroundColor: COLOR_AZUL_ELECTRICO,
                                color: COLOR_BLANCO,
                                fontWeight: 'bold',
                              }}
                            >
                              Marcar en Curso
                            </Button>
                          )}
                          {reserva.estado === 'en_curso' && (
                            <Button
                              variant="contained"
                              onClick={() => handleEstadoChange(reserva.id_reserva, 'completada')}
                              sx={{
                                backgroundColor: '#4caf50',
                                color: COLOR_BLANCO,
                                fontWeight: 'bold',
                              }}
                            >
                              Marcar Completada
                            </Button>
                          )}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {reservas.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarMonth sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay reservas {profile.rol === 'cliente' ? 'tuyas' : 'en el sistema'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {profile.rol === 'cliente' 
              ? 'Tus reservas aparecerán aquí cuando las realices' 
              : 'Las reservas de los usuarios aparecerán aquí'
            }
          </Typography>
        </Box>
      )}

      {/* Dialog para editar estado */}
      <Dialog
        open={Boolean(editDialog)}
        onClose={() => setEditDialog(null)}
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
          Cambiar Estado de Reserva
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
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
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialog(null)} 
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleEstadoChange(editDialog.id_reserva, editDialog.estado)}
            variant="contained"
            sx={{
              backgroundColor: COLOR_NARANJA_VIBRANTE,
              color: COLOR_BLANCO,
              fontWeight: 'bold',
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
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle 
          sx={{ 
            backgroundColor: COLOR_ROJO, 
            color: COLOR_BLANCO, 
            fontWeight: 'bold' 
          }}
        >
          Cancelar Reserva
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {cancelDialog && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres cancelar la reserva <strong>#{getCodigoReserva(cancelDialog)}</strong>?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Motivo de cancelación"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Describe el motivo de la cancelación..."
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setCancelDialog(null);
              setMotivoCancelacion('');
            }} 
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCancelarReserva}
            variant="contained"
            disabled={!motivoCancelacion.trim()}
            sx={{
              backgroundColor: COLOR_ROJO,
              color: COLOR_BLANCO,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
            }}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}