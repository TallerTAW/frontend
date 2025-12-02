// 📍 ARCHIVO: src/pages/Reservations.jsx
// 🎯 COMPONENTE COMPLETO Y CORREGIDO

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../api/reservas';
import { canchasApi } from '../api/canchas';
import { espaciosApi } from '../api/espacios';
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
  FormControl,
  InputLabel,
  Select,
  Paper,
  Tabs,
  Tab,
  Stack,
  Badge,
  Tooltip
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
  FilterList,
  Search,
  Clear,
  Download,
  Print,
  Refresh,
  LocationOn,
  Event,
  Group
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

export default function Reservations() {
  const { profile } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  
  // ✅ FILTROS
  const [filters, setFilters] = useState({
    estado: '',
    fecha_inicio: null,
    fecha_fin: null,
    id_cancha: '',
    id_espacio: '',
    search: ''
  });
  
  const [espacios, setEspacios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [filteredCanchas, setFilteredCanchas] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    confirmadas: 0,
    pendientes: 0,
    en_curso: 0,
    completadas: 0,
    canceladas: 0
  });

  // ✅ CARGAR DATOS INICIALES
  useEffect(() => {
    if (profile) {
      fetchDatosIniciales();
      fetchEstadisticas();
    }
  }, [profile]);

  // ✅ CARGAR DATOS SEGÚN ROL
  const fetchDatosIniciales = async () => {
    try {
      setLoading(true);
      
      // 1. Cargar espacios según rol
      if (profile.rol === 'gestor') {
        const espaciosData = await espaciosApi.getMisEspacios();
        setEspacios(espaciosData || []);
        
        // Cargar canchas de los espacios del gestor
        if (espaciosData && espaciosData.length > 0) {
          const espacioIds = espaciosData.map(e => e.id_espacio_deportivo);
          const canchasPromises = espacioIds.map(id => 
            canchasApi.getByEspacio(id).catch(() => [])
          );
          const canchasArrays = await Promise.all(canchasPromises);
          const todasCanchas = canchasArrays.flat();
          setCanchas(todasCanchas);
          setFilteredCanchas(todasCanchas);
        }
      } else if (profile.rol === 'admin') {
        const espaciosData = await espaciosApi.getAllAdmin();
        setEspacios(espaciosData || []);
        
        // Admin puede ver todas las canchas
        const canchasData = await canchasApi.getAllAdmin();
        setCanchas(canchasData || []);
        setFilteredCanchas(canchasData || []);
      }
      
      // 2. Cargar reservas
      await fetchReservas();
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARGAR RESERVAS CON FILTROS
  const fetchReservas = async () => {
    try {
      setLoading(true);
      
      // Preparar filtros para la API
      const apiFilters = {};
      
      if (filters.estado) apiFilters.estado = filters.estado;
      if (filters.fecha_inicio) apiFilters.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) apiFilters.fecha_fin = filters.fecha_fin;
      if (filters.id_cancha) apiFilters.id_cancha = filters.id_cancha;
      
      console.log('🔄 [RESERVATIONS] Obteniendo reservas con filtros:', apiFilters);
      
      const data = await reservasApi.getAll(apiFilters);
      console.log('✅ [RESERVATIONS] Reservas obtenidas:', data.length);
      
      // ✅ FILTRAR POR ESPACIO SI ES NECESARIO (hacerlo localmente)
      let filteredData = data;
      
      // Filtro de espacio (hacer localmente ya que el endpoint no lo soporta directamente)
      if (filters.id_espacio) {
        filteredData = filteredData.filter(reserva => {
          // Buscar la cancha correspondiente
          const cancha = canchas.find(c => c.id_cancha === reserva.id_cancha);
          return cancha && cancha.id_espacio_deportivo === parseInt(filters.id_espacio);
        });
      }
      
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(reserva => {
          if (!reserva) return false;
          
          const codigoMatch = reserva.codigo_reserva?.toLowerCase().includes(searchLower);
          const nombreMatch = reserva.usuario?.nombre?.toLowerCase().includes(searchLower);
          const apellidoMatch = reserva.usuario?.apellido?.toLowerCase().includes(searchLower);
          const emailMatch = reserva.usuario?.email?.toLowerCase().includes(searchLower);
          const canchaMatch = reserva.cancha?.nombre?.toLowerCase().includes(searchLower);
          
          return codigoMatch || nombreMatch || apellidoMatch || emailMatch || canchaMatch;
        });
      }
      
      setReservas(filteredData);
      
      // ✅ CALCULAR ESTADÍSTICAS LOCALES (como respaldo)
      calcularEstadisticasLocales(filteredData);
    } catch (error) {
      console.error('❌ [RESERVATIONS] Error al cargar reservas:', error);
      toast.error('Error al cargar reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARGAR ESTADÍSTICAS DESDE EL BACKEND
  const fetchEstadisticas = async () => {
    try {
      const apiFilters = {};
      if (filters.estado) apiFilters.estado = filters.estado;
      if (filters.fecha_inicio) apiFilters.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) apiFilters.fecha_fin = filters.fecha_fin;
      if (filters.id_cancha) apiFilters.id_cancha = filters.id_cancha;
      
      const data = await reservasApi.getEstadisticas(apiFilters);
      setEstadisticas(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // Si falla, usar las locales
    }
  };

  // ✅ CALCULAR ESTADÍSTICAS LOCALES (como respaldo)
  const calcularEstadisticasLocales = (data) => {
    const stats = {
      total: data.length,
      confirmadas: data.filter(r => r.estado === 'confirmada').length,
      pendientes: data.filter(r => r.estado === 'pendiente').length,
      en_curso: data.filter(r => r.estado === 'en_curso').length,
      completadas: data.filter(r => r.estado === 'completada').length,
      canceladas: data.filter(r => r.estado === 'cancelada').length
    };
    
    // Solo actualizar si no tenemos estadísticas del backend
    if (estadisticas.total === 0) {
      setEstadisticas(stats);
    }
  };

  // ✅ MANEJAR CAMBIOS EN FILTROS
  const handleFilterChange = async (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Si cambia el espacio, actualizar canchas
    if (name === 'id_espacio' && value) {
      try {
        const canchasData = await canchasApi.getByEspacio(value);
        setFilteredCanchas(canchasData || []);
        setFilters(prev => ({ ...prev, id_cancha: '' }));
      } catch (error) {
        console.error('Error al cargar canchas del espacio:', error);
        setFilteredCanchas([]);
      }
    }
  };

  // ✅ LIMPIAR FILTROS
  const handleClearFilters = () => {
    setFilters({
      estado: '',
      fecha_inicio: null,
      fecha_fin: null,
      id_cancha: '',
      id_espacio: '',
      search: ''
    });
    
    // Restaurar todas las canchas
    if (profile.rol === 'admin') {
      setFilteredCanchas(canchas);
    }
  };

  // ✅ APLICAR FILTROS Y CARGAR DATOS
  const handleAplicarFiltros = async () => {
    await fetchReservas();
    await fetchEstadisticas();
  };

  // ✅ FUNCIONES AUXILIARES
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#ff9800',
      confirmada: '#4caf50',
      en_curso: '#2196f3',
      completada: '#9c27b0',
      cancelada: '#f44336'
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
    return textos[estado] || estado?.toUpperCase() || 'DESCONOCIDO';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  };

  const formatHora = (hora) => {
    if (!hora) return '--:--';
    if (typeof hora === 'string') {
      return hora.slice(0, 5);
    }
    return hora;
  };

  // ✅ MANEJAR CAMBIOS DE ESTADO
  const handleEstadoChange = async (reservaId, nuevoEstado) => {
    try {
      await reservasApi.update(reservaId, { estado: nuevoEstado });
      toast.success(`Reserva ${nuevoEstado} correctamente`);
      setEditDialog(null);
      await fetchReservas();
      await fetchEstadisticas();
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      toast.error('Error al actualizar reserva');
    }
  };

  // ✅ CANCELAR RESERVA
  const handleCancelarReserva = async () => {
    if (!cancelDialog || !motivoCancelacion.trim()) return;

    try {
      await reservasApi.cancelar(cancelDialog.id_reserva, motivoCancelacion);
      toast.success('Reserva cancelada correctamente');
      setCancelDialog(null);
      setMotivoCancelacion('');
      await fetchReservas();
      await fetchEstadisticas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      toast.error('Error al cancelar reserva');
    }
  };

  // ✅ FILTRAR POR TAB
  const getReservasPorTab = () => {
    const reservasFiltradas = reservas.filter(reserva => {
      if (!reserva || !reserva.estado) return false;
      
      switch (activeTab) {
        case 0: return true; // Todas
        case 1: return reserva.estado === 'pendiente';
        case 2: return reserva.estado === 'confirmada';
        case 3: return reserva.estado === 'en_curso';
        case 4: return reserva.estado === 'completada';
        case 5: return reserva.estado === 'cancelada';
        default: return true;
      }
    });
    
    return reservasFiltradas;
  };

  // ✅ RENDERIZADO
  if (loading && reservas.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando reservas...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {profile?.rol === 'cliente' ? 'Mis Reservas' : 
                 profile?.rol === 'gestor' ? 'Reservas de Mis Espacios' : 
                 'Gestión de Reservas'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile?.rol === 'cliente' 
                  ? 'Tus reservas activas e históricas' 
                  : profile?.rol === 'gestor'
                  ? 'Reservas de los espacios que gestionas'
                  : 'Todas las reservas del sistema'
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refrescar">
                <IconButton onClick={() => {
                  fetchReservas();
                  fetchEstadisticas();
                }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>

        {/* FILTROS - MOSTRAR SOLO SI NO ES CLIENTE */}
        {(profile.rol === 'admin' || profile.rol === 'gestor') && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FilterList color="primary" />
              <Typography variant="h6">Filtros</Typography>
            </Box>
            
            <Grid container spacing={2}>
              {/* FILTRO DE BÚSQUEDA */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Código, nombre, email..."
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              {/* FILTRO DE ESTADO */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="confirmada">Confirmada</MenuItem>
                    <MenuItem value="en_curso">En Curso</MenuItem>
                    <MenuItem value="completada">Completada</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* FILTRO DE FECHA INICIO */}
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Desde"
                  value={filters.fecha_inicio}
                  onChange={(date) => handleFilterChange('fecha_inicio', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                  format="dd/MM/yyyy"
                />
              </Grid>
              
              {/* FILTRO DE FECHA FIN */}
              <Grid item xs={12} md={2}>
                <DatePicker
                  label="Hasta"
                  value={filters.fecha_fin}
                  onChange={(date) => handleFilterChange('fecha_fin', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                  format="dd/MM/yyyy"
                />
              </Grid>
              
              {/* FILTRO DE ESPACIO (solo admin/gestor) */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Espacio</InputLabel>
                  <Select
                    value={filters.id_espacio}
                    onChange={(e) => handleFilterChange('id_espacio', e.target.value)}
                    label="Espacio"
                    disabled={espacios.length === 0}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {espacios.map((espacio) => (
                      <MenuItem key={espacio.id_espacio_deportivo} value={espacio.id_espacio_deportivo}>
                        {espacio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* FILTRO DE CANCHA */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Cancha</InputLabel>
                  <Select
                    value={filters.id_cancha}
                    onChange={(e) => handleFilterChange('id_cancha', e.target.value)}
                    label="Cancha"
                    disabled={filteredCanchas.length === 0}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {filteredCanchas.map((cancha) => (
                      <MenuItem key={cancha.id_cancha} value={cancha.id_cancha}>
                        {cancha.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* BOTONES DE ACCIÓN */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    variant="outlined"
                  >
                    Limpiar
                  </Button>
                  <Button
                    startIcon={<Search />}
                    onClick={handleAplicarFiltros}
                    variant="contained"
                    sx={{ backgroundColor: '#1976d2' }}
                  >
                    Aplicar Filtros
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* ESTADÍSTICAS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h4">{estadisticas.total}</Typography>
              <Typography variant="body2">Total</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h4">{estadisticas.pendientes}</Typography>
              <Typography variant="body2">Pendientes</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h4">{estadisticas.confirmadas}</Typography>
              <Typography variant="body2">Confirmadas</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', color: 'white' }}>
              <Typography variant="h4">{estadisticas.en_curso}</Typography>
              <Typography variant="body2">En Curso</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', color: 'white' }}>
              <Typography variant="h4">{estadisticas.completadas}</Typography>
              <Typography variant="body2">Completadas</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', color: 'white' }}>
              <Typography variant="h4">{estadisticas.canceladas}</Typography>
              <Typography variant="body2">Canceladas</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* TABS DE ESTADO */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab 
              label={
                <Badge badgeContent={estadisticas.total} color="primary" max={999}>
                  <Typography>Todas</Typography>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={estadisticas.pendientes} color="warning" max={999}>
                  <Typography>Pendientes</Typography>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={estadisticas.confirmadas} color="success" max={999}>
                  <Typography>Confirmadas</Typography>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={estadisticas.en_curso} color="info" max={999}>
                  <Typography>En Curso</Typography>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={estadisticas.completadas} color="secondary" max={999}>
                  <Typography>Completadas</Typography>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={estadisticas.canceladas} color="error" max={999}>
                  <Typography>Canceladas</Typography>
                </Badge>
              } 
            />
          </Tabs>
        </Paper>

        {/* LISTA DE RESERVAS */}
        <Grid container spacing={3}>
          {getReservasPorTab().map((reserva, index) => (
            <Grid item xs={12} key={reserva.id_reserva || index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* HEADER */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                          <CalendarMonth />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Reserva #{reserva.codigo_reserva || `TEMP-${reserva.id_reserva}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFecha(reserva.fecha_reserva)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={getEstadoTexto(reserva.estado)}
                          sx={{ 
                            backgroundColor: getEstadoColor(reserva.estado),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        
                        {/* BOTONES DE ACCIÓN SOLO PARA ADMIN/GESTOR */}
                        {(profile.rol === 'admin' || profile.rol === 'gestor') && 
                         reserva.estado !== 'cancelada' && 
                         reserva.estado !== 'completada' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Editar estado">
                              <IconButton
                                onClick={() => setEditDialog(reserva)}
                                sx={{ color: '#1976d2' }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancelar">
                              <IconButton
                                onClick={() => setCancelDialog(reserva)}
                                sx={{ color: '#f44336' }}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* DETALLES */}
                    <Grid container spacing={3}>
                      {/* INFORMACIÓN DEL CLIENTE (solo admin/gestor) */}
                      {(profile.rol === 'admin' || profile.rol === 'gestor') && reserva.usuario && (
                        <Grid item xs={12} md={4}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                            Información del Cliente
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Person sx={{ color: '#4caf50' }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {reserva.usuario.nombre} {reserva.usuario.apellido}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {reserva.usuario.email}
                              </Typography>
                              {reserva.usuario.telefono && (
                                <Typography variant="body2" color="text.secondary">
                                  Tel: {reserva.usuario.telefono}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      )}

                      {/* INFORMACIÓN DE LA CANCHA */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                          Información de la Cancha
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <SportsSoccer sx={{ color: '#ff9800' }} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {reserva.cancha?.nombre || `Cancha ${reserva.id_cancha}`}
                            </Typography>
                            {reserva.disciplina?.nombre && (
                              <Typography variant="body2" color="text.secondary">
                                {reserva.disciplina.nombre}
                              </Typography>
                            )}
                            {reserva.cancha?.precio_por_hora && (
                              <Typography variant="body2" color="text.secondary">
                                Precio/h: ${reserva.cancha.precio_por_hora}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* DETALLES DE LA RESERVA */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                          Detalles de la Reserva
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 20, color: '#4caf50' }} />
                            <Typography variant="body2">
                              <strong>Horario:</strong> {formatHora(reserva.hora_inicio)} - {formatHora(reserva.hora_fin)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney sx={{ fontSize: 20, color: '#4caf50' }} />
                            <Typography variant="body2">
                              <strong>Costo:</strong> ${reserva.costo_total || '0.00'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Group sx={{ fontSize: 20, color: '#4caf50' }} />
                            <Typography variant="body2">
                              <strong>Asistentes:</strong> {reserva.cantidad_asistentes || 0} personas
                            </Typography>
                          </Box>
                          {reserva.material_prestado && (
                            <Typography variant="body2">
                              <strong>Material prestado:</strong> {reserva.material_prestado}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* ACCIONES RÁPIDAS PARA ADMIN/GESTOR */}
                    {(profile.rol === 'admin' || profile.rol === 'gestor') && 
                     reserva.estado !== 'cancelada' && 
                     reserva.estado !== 'completada' && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {reserva.estado === 'pendiente' && (
                            <Button
                              variant="contained"
                              startIcon={<CheckCircle />}
                              onClick={() => handleEstadoChange(reserva.id_reserva, 'confirmada')}
                              sx={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            >
                              Confirmar Reserva
                            </Button>
                          )}
                          {reserva.estado === 'confirmada' && (
                            <Button
                              variant="contained"
                              onClick={() => handleEstadoChange(reserva.id_reserva, 'en_curso')}
                              sx={{
                                backgroundColor: '#2196f3',
                                color: 'white',
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
                                backgroundColor: '#9c27b0',
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            >
                              Marcar Completada
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={() => setCancelDialog(reserva)}
                            sx={{
                              color: '#f44336',
                              borderColor: '#f44336',
                              '&:hover': {
                                backgroundColor: '#ffebee',
                                borderColor: '#f44336',
                              },
                            }}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* SIN RESERVAS */}
        {getReservasPorTab().length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CalendarMonth sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay reservas encontradas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              {filters.search || filters.estado || filters.fecha_inicio || filters.id_cancha
                ? 'Intenta con otros criterios de búsqueda'
                : profile.rol === 'cliente' 
                  ? 'Tus reservas aparecerán aquí cuando las realices' 
                  : 'Las reservas de los usuarios aparecerán aquí'
              }
            </Typography>
            {(filters.search || filters.estado || filters.fecha_inicio || filters.id_cancha) && (
              <Button
                variant="contained"
                onClick={handleClearFilters}
                startIcon={<Clear />}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* DIALOGS */}
      <Dialog
        open={Boolean(editDialog)}
        onClose={() => setEditDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
          Cambiar Estado de Reserva
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {editDialog && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Reserva: <strong>#{editDialog.codigo_reserva || `TEMP-${editDialog.id_reserva}`}</strong>
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
          <Button onClick={() => setEditDialog(null)}>Cancelar</Button>
          <Button
            onClick={() => handleEstadoChange(editDialog.id_reserva, editDialog.estado)}
            variant="contained"
            sx={{ backgroundColor: '#1976d2', color: 'white' }}
          >
            Actualizar Estado
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(cancelDialog)}
        onClose={() => setCancelDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f44336', color: 'white', fontWeight: 'bold' }}>
          Cancelar Reserva
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {cancelDialog && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Estás seguro de que quieres cancelar la reserva <strong>#{cancelDialog.codigo_reserva || `TEMP-${cancelDialog.id_reserva}`}</strong>?
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
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => {
            setCancelDialog(null);
            setMotivoCancelacion('');
          }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCancelarReserva}
            variant="contained"
            disabled={!motivoCancelacion.trim()}
            sx={{ backgroundColor: '#f44336', color: 'white' }}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}