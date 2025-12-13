import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  Divider,
  TextField,
  Grid,
  IconButton,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Lock,
  Person,
  Email,
  Phone,
  DateRange,
  Visibility,
  VisibilityOff,
  VerifiedUser,
  SportsSoccer,
  CalendarMonth,
  History,
  Warning,
  AttachMoney,
  AccessTime,
  CheckCircle,
  Cancel as CancelIcon,
  PlayCircleOutline,
  EventNote,
  Security,
  Notifications,
  Link as LinkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuariosApi } from '../api/usuarios';
import { reservasApi } from '../api/reservas';
import { toast } from 'react-toastify';

// Paleta de colores
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_ROJO = '#f44336';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';
const COLOR_GRIS_CLARO = '#f5f5f5';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // Datos del formulario - INICIALIZAR VACÍOS
  const [formData, setFormData] = useState({
    id_usuario: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_creacion: '',
    fecha_registro: '',
    created_at: '',
    rol: '',
    estado: '',
  });
  
  // Datos para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    nueva_contrasenia: '',
    confirmPassword: '',
  });
  
  // Estadísticas reales del usuario
  const [userStats, setUserStats] = useState({
    totalReservas: 0,
    reservasActivas: 0,
    reservasCompletadas: 0,
    reservasCanceladas: 0,
    calificacionPromedio: 0,
    membresiaDesde: '',
    gastoTotal: 0,
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  // Cargar datos del perfil desde la API
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      try {
        // Obtener el ID del usuario del token
        const userId = getUserId();
        
        if (!userId) {
          console.error('No se pudo obtener el ID del usuario');
          toast.error('Error al identificar al usuario');
          return;
        }

        console.log('Obteniendo datos del usuario con ID:', userId);
        
        // Obtener TODOS los datos del usuario desde la API
        const userData = await usuariosApi.getById(userId);
        console.log('Datos completos del usuario desde API:', userData);
        
        // Mapear todos los campos posibles de la API
        setFormData({
          id_usuario: userData.id_usuario || userData.id || '',
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          fecha_creacion: userData.fecha_creacion || '',
          fecha_registro: userData.fecha_registro || '',
          created_at: userData.created_at || '',
          rol: userData.rol || '',
          estado: userData.estado || '',
        });
        
      } catch (error) {
        console.error('Error al cargar perfil desde API:', error);
        toast.error('Error al cargar los datos del perfil');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Cargar estadísticas cuando el perfil esté cargado
  useEffect(() => {
    if (!loadingProfile && formData.id_usuario) {
      fetchUserStats();
    }
  }, [loadingProfile, formData.id_usuario]);

  // Obtener estadísticas reales del usuario
  const fetchUserStats = async () => {
    const userId = formData.id_usuario;
    
    if (!userId) {
      console.error('No se encontró el ID del usuario para estadísticas');
      setLoadingStats(false);
      return;
    }
    
    setLoadingStats(true);
    try {
      // Obtener reservas del usuario
      const reservas = await reservasApi.getByUsuario(userId);
      console.log('Reservas obtenidas para estadísticas:', reservas);
      
      // Calcular estadísticas
      const totalReservas = reservas?.length || 0;
      const reservasActivas = reservas?.filter(r => 
        r.estado === 'confirmada' || r.estado === 'pendiente' || r.estado === 'en_curso'
      ).length || 0;
      const reservasCompletadas = reservas?.filter(r => r.estado === 'completada').length || 0;
      const reservasCanceladas = reservas?.filter(r => r.estado === 'cancelada').length || 0;
      const gastoTotal = reservas?.reduce((total, r) => total + (r.costo_total || 0), 0) || 0;
      
      setUserStats({
        totalReservas,
        reservasActivas,
        reservasCompletadas,
        reservasCanceladas,
        calificacionPromedio: 0,
        membresiaDesde: getFechaCreacionText(),
        gastoTotal,
      });
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setUserStats({
        totalReservas: 0,
        reservasActivas: 0,
        reservasCompletadas: 0,
        reservasCanceladas: 0,
        calificacionPromedio: 0,
        membresiaDesde: getFechaCreacionText(),
        gastoTotal: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Obtener ID del usuario desde el token JWT
  const getUserId = () => {
    // El token JWT usualmente tiene el ID en 'sub' o 'id'
    return user?.sub || user?.id;
  };

  // Obtener iniciales para el avatar
  const getInitials = () => {
    const first = formData.nombre?.charAt(0) || '';
    const last = formData.apellido?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  // Obtener nombre del rol
  const getRoleDisplayName = (rol) => {
    const roles = {
      'admin': 'Administrador',
      'gestor': 'Gestor de Espacios',
      'control_acceso': 'Control de Acceso',
      'cliente': 'Cliente'
    };
    return roles[rol] || rol || 'Sin rol';
  };

  // Obtener color del rol
  const getRoleColor = (rol) => {
    const colors = {
      'admin': 'error',
      'gestor': 'warning',
      'control_acceso': 'info',
      'cliente': 'primary',
    };
    return colors[rol] || 'default';
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Alternar visibilidad de contraseña
  const handleClickShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      setErrorMessage('Nombre, apellido y email son obligatorios');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userId = formData.id_usuario;
      console.log('Actualizando perfil para userId:', userId);
      
      if (!userId) {
        throw new Error('No se pudo identificar al usuario');
      }

      // Preparar datos para actualizar
      const updatedData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
      };
      
      // Solo agregar teléfono si no está vacío
      if (formData.telefono && formData.telefono.trim()) {
        updatedData.telefono = formData.telefono.trim();
      } else {
        updatedData.telefono = null;
      }

      console.log('Datos a actualizar:', updatedData);
      await usuariosApi.update(userId, updatedData);
      
      // Recargar los datos actualizados desde la API
      const updatedUserData = await usuariosApi.getById(userId);
      setFormData({
        ...formData,
        ...updatedData,
        telefono: updatedUserData.telefono || formData.telefono,
      });
      
      setIsEditing(false);
      setSuccessMessage('Perfil actualizado correctamente');
      toast.success('Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      'Error al actualizar el perfil';
      setErrorMessage(errorMsg);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar cambio de contraseña (mostrar advertencia)
  const handleStartPasswordChange = () => {
    setShowPasswordDialog(true);
  };

  // Confirmar cambio de contraseña
  const handleConfirmPasswordChange = () => {
    setShowPasswordDialog(false);
    setIsChangingPassword(true);
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!passwordData.nueva_contrasenia) {
      setErrorMessage('La nueva contraseña es obligatoria');
      return;
    }

    if (passwordData.nueva_contrasenia.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.nueva_contrasenia.length > 72) {
      setErrorMessage('La contraseña no puede tener más de 72 caracteres');
      return;
    }

    if (passwordData.nueva_contrasenia !== passwordData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userId = formData.id_usuario;
      if (!userId) {
        throw new Error('No se pudo identificar al usuario');
      }

      await usuariosApi.cambiarContrasenia(userId, passwordData.nueva_contrasenia);
      
      // Limpiar formulario
      setPasswordData({
        nueva_contrasenia: '',
        confirmPassword: '',
      });
      
      setIsChangingPassword(false);
      setSuccessMessage('Contraseña cambiada exitosamente');
      toast.success('Contraseña actualizada exitosamente');
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      'Error al cambiar la contraseña';
      setErrorMessage(errorMsg);
      toast.error('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Recargar datos originales desde la API
    reloadUserData();
  };

  // Recargar datos del usuario desde la API
  const reloadUserData = async () => {
    const userId = formData.id_usuario;
    if (userId) {
      try {
        const userData = await usuariosApi.getById(userId);
        setFormData({
          id_usuario: userData.id_usuario || userData.id || '',
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          fecha_creacion: userData.fecha_creacion || '',
          fecha_registro: userData.fecha_registro || '',
          created_at: userData.created_at || '',
          rol: userData.rol || '',
          estado: userData.estado || '',
        });
      } catch (error) {
        console.error('Error al recargar datos:', error);
      }
    }
  };

  // Cancelar cambio de contraseña
  const handleCancelPasswordChange = () => {
    setPasswordData({
      nueva_contrasenia: '',
      confirmPassword: '',
    });
    setIsChangingPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', dateString, error);
      return 'Fecha no disponible';
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Obtener texto para teléfono
  const getTelefonoText = () => {
    const telefono = formData.telefono;
    if (!telefono || telefono.trim() === '') {
      return 'No especificado';
    }
    return telefono;
  };

  // Obtener texto para fecha de creación
  const getFechaCreacionText = () => {
    // Intentar en este orden: fecha_creacion > fecha_registro > created_at
    const fecha = formData.fecha_creacion || formData.fecha_registro || formData.created_at;
    if (!fecha) {
      return 'No disponible';
    }
    return formatDate(fecha);
  };

  // Estado de cuenta
  const getEstadoCuenta = () => {
    return formData.estado === 'activo' ? 'Activa' : 'Inactiva';
  };

  // Obtener estado de reservas como objeto con icono y color
  const getEstadoReservaInfo = (estado) => {
    switch(estado) {
      case 'completada':
        return { icon: <CheckCircle />, color: 'success', texto: 'Completada' };
      case 'cancelada':
        return { icon: <CancelIcon />, color: 'error', texto: 'Cancelada' };
      case 'en_curso':
        return { icon: <PlayCircleOutline />, color: 'warning', texto: 'En curso' };
      case 'confirmada':
        return { icon: <EventNote />, color: 'info', texto: 'Confirmada' };
      default:
        return { icon: <EventNote />, color: 'default', texto: estado };
    }
  };

  if (!user && !loadingProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Por favor, inicia sesión para ver tu perfil
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            backgroundColor: COLOR_VERDE_LIMA,
            color: COLOR_NEGRO_SUAVE,
            fontWeight: 'bold',
          }}
        >
          Iniciar Sesión
        </Button>
      </Container>
    );
  }

  if (loadingProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando perfil...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Dialog de advertencia para cambio de contraseña */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: COLOR_NARANJA_VIBRANTE, fontWeight: 'bold' }}>
          <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
          Advertencia de Seguridad
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Nota importante:</strong> El sistema actualmente no verifica tu contraseña actual.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Si continúas, la contraseña será cambiada directamente. Asegúrate de:
          </Typography>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li><Typography variant="body2">Estar seguro de que quieres cambiar tu contraseña</Typography></li>
            <li><Typography variant="body2">Recordar tu nueva contraseña</Typography></li>
            <li><Typography variant="body2">No compartir tu dispositivo con otras personas</Typography></li>
          </ul>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Se recomienda implementar verificación de contraseña actual para mayor seguridad.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPasswordDialog(false)}
            sx={{ color: COLOR_NEGRO_SUAVE }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmPasswordChange}
            variant="contained"
            sx={{
              backgroundColor: COLOR_NARANJA_VIBRANTE,
              color: COLOR_BLANCO,
              '&:hover': {
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                opacity: 0.9
              }
            }}
          >
            Entiendo y continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header de la página */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: COLOR_NEGRO_SUAVE,
              mb: 1
            }}
          >
            Mi Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu información personal y preferencias de cuenta
          </Typography>
        </Box>
      </motion.div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Columna izquierda: Información del perfil */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                mb: 3
              }}
            >
              {/* Header de la tarjeta */}
              <Box
                sx={{
                  backgroundColor: COLOR_AZUL_ELECTRICO,
                  p: 3,
                  color: COLOR_BLANCO,
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        border: `4px solid ${COLOR_BLANCO}`,
                        bgcolor: COLOR_VERDE_LIMA,
                        color: COLOR_NEGRO_SUAVE,
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials()}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {formData.nombre} {formData.apellido}
                      </Typography>
                      <Chip
                        label={getRoleDisplayName(formData.rol)}
                        color={getRoleColor(formData.rol)}
                        size="medium"
                        sx={{ 
                          fontWeight: 'bold',
                          color: COLOR_BLANCO,
                          mb: 1
                        }}
                      />
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {formData.email}
                      </Typography>
                      {getTelefonoText() !== 'No especificado' && (
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          {getTelefonoText()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {!isEditing && !isChangingPassword && (
                    <IconButton
                      onClick={() => setIsEditing(true)}
                      sx={{
                        backgroundColor: COLOR_BLANCO,
                        color: COLOR_AZUL_ELECTRICO,
                        '&:hover': {
                          backgroundColor: COLOR_BLANCO,
                          opacity: 0.9
                        }
                      }}
                    >
                      <Edit />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Contenido de la tarjeta */}
              <Box sx={{ p: 3 }}>
                {isEditing ? (
                  // Formulario de edición
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Teléfono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          disabled={loading}
                          placeholder="Ej: +51 987 654 321"
                          helperText="Opcional"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        disabled={loading}
                        startIcon={<Cancel />}
                        sx={{
                          textTransform: 'none',
                          color: COLOR_NEGRO_SUAVE,
                          borderColor: COLOR_NEGRO_SUAVE,
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: COLOR_VERDE_LIMA,
                          color: COLOR_NEGRO_SUAVE,
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: COLOR_VERDE_LIMA,
                            opacity: 0.9
                          }
                        }}
                      >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Box>
                ) : isChangingPassword ? (
                  // Formulario para cambiar contraseña
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
                    <Typography variant="h6" sx={{ mb: 3, color: COLOR_NEGRO_SUAVE }}>
                      Cambiar Contraseña
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        Ingresa tu nueva contraseña. <strong>Nota:</strong> El sistema no verifica tu contraseña actual.
                      </Typography>
                    </Alert>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nueva Contraseña"
                          name="nueva_contrasenia"
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.nueva_contrasenia}
                          onChange={handlePasswordChange}
                          required
                          disabled={loading}
                          helperText="Mínimo 6 caracteres, máximo 72 caracteres"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => handleClickShowPassword('new')}
                                  edge="end"
                                >
                                  {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirmar Nueva Contraseña"
                          name="confirmPassword"
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={loading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => handleClickShowPassword('confirm')}
                                  edge="end"
                                >
                                  {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelPasswordChange}
                        disabled={loading}
                        startIcon={<Cancel />}
                        sx={{
                          textTransform: 'none',
                          color: COLOR_NEGRO_SUAVE,
                          borderColor: COLOR_NEGRO_SUAVE,
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: COLOR_AZUL_ELECTRICO,
                          color: COLOR_BLANCO,
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: COLOR_AZUL_ELECTRICO,
                            opacity: 0.9
                          }
                        }}
                      >
                        {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Vista de solo lectura
                  <Box>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ color: COLOR_AZUL_ELECTRICO }} />
                                Nombre completo
                              </Box>
                            </TableCell>
                            <TableCell>{formData.nombre} {formData.apellido}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Email sx={{ color: COLOR_AZUL_ELECTRICO }} />
                                Email
                              </Box>
                            </TableCell>
                            <TableCell>{formData.email}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Phone sx={{ color: COLOR_AZUL_ELECTRICO }} />
                                Teléfono
                              </Box>
                            </TableCell>
                            <TableCell>{getTelefonoText()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DateRange sx={{ color: COLOR_AZUL_ELECTRICO }} />
                                Miembro desde
                              </Box>
                            </TableCell>
                            <TableCell>{getFechaCreacionText()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VerifiedUser sx={{ color: COLOR_AZUL_ELECTRICO }} />
                                Rol
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getRoleDisplayName(formData.rol)}
                                color={getRoleColor(formData.rol)}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Divider sx={{ my: 3 }} />

                    {/* Acciones */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={() => setIsEditing(true)}
                        startIcon={<Edit />}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: COLOR_VERDE_LIMA,
                          color: COLOR_NEGRO_SUAVE,
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: COLOR_VERDE_LIMA,
                            opacity: 0.9
                          }
                        }}
                      >
                        Editar Perfil
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={handleStartPasswordChange}
                        startIcon={<Security />}
                        sx={{
                          textTransform: 'none',
                          color: COLOR_AZUL_ELECTRICO,
                          borderColor: COLOR_AZUL_ELECTRICO,
                          '&:hover': {
                            borderColor: COLOR_AZUL_ELECTRICO,
                            backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                          }
                        }}
                      >
                        Cambiar Contraseña
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Estadísticas del usuario (solo para clientes) */}
            {formData.rol === 'cliente' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 3, color: COLOR_NEGRO_SUAVE, fontWeight: 'bold' }}>
                    Mis Estadísticas
                  </Typography>
                  
                  {loadingStats ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={30} sx={{ color: COLOR_AZUL_ELECTRICO }} />
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={3}>
                        <Card sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          backgroundColor: `${COLOR_AZUL_ELECTRICO}10`,
                          border: `1px solid ${COLOR_AZUL_ELECTRICO}30`,
                          height: '100%'
                        }}>
                          <CalendarMonth sx={{ fontSize: 40, color: COLOR_AZUL_ELECTRICO, mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE }}>
                            {userStats.totalReservas}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Reservas Totales
                          </Typography>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} md={3}>
                        <Card sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          backgroundColor: `${COLOR_VERDE_LIMA}10`,
                          border: `1px solid ${COLOR_VERDE_LIMA}30`,
                          height: '100%'
                        }}>
                          <SportsSoccer sx={{ fontSize: 40, color: COLOR_VERDE_LIMA, mb: 1 }} />
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE }}>
                            {userStats.reservasActivas}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Reservas Activas
                          </Typography>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} md={3}>
                        <Card sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          backgroundColor: `${COLOR_NARANJA_VIBRANTE}10`,
                          border: `1px solid ${COLOR_NARANJA_VIBRANTE}30`,
                          height: '100%'
                        }}>
                          <AttachMoney sx={{ fontSize: 40, color: COLOR_NARANJA_VIBRANTE, mb: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE }}>
                            {formatCurrency(userStats.gastoTotal)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Gasto Total
                          </Typography>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={6} md={3}>
                        <Card sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          backgroundColor: `${COLOR_ROJO}10`,
                          border: `1px solid ${COLOR_ROJO}30`,
                          height: '100%'
                        }}>
                          <History sx={{ fontSize: 40, color: COLOR_ROJO, mb: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: COLOR_NEGRO_SUAVE }}>
                            {getFechaCreacionText()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Miembro desde
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </motion.div>
            )}
          </motion.div>
        </Grid>

        {/* Columna derecha: Dos tarjetas lado a lado en versión desktop */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            {/* Tarjeta de Actividad Reciente */}
            <Grid item>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccessTime sx={{ mr: 1.5, color: COLOR_AZUL_ELECTRICO }} />
                    <Typography variant="h6" sx={{ color: COLOR_NEGRO_SUAVE, fontWeight: 'bold' }}>
                      Actividad Reciente
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Último acceso
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: COLOR_NEGRO_SUAVE }}>
                        Hoy, {new Date().toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                      <Chip
                        label="En línea"
                        color="success"
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Estado de la cuenta
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip
                        label={getEstadoCuenta()}
                        color={formData.estado === 'activo' ? 'success' : 'error'}
                        size="medium"
                        sx={{ fontWeight: 'bold' }}
                      />
                      {formData.estado === 'activo' && (
                        <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Sesión actual
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLOR_NEGRO_SUAVE }}>
                      {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Tarjeta de Enlaces Rápidos */}
            <Grid item>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    p: 3,
                    border: '1px solid #e0e0e0',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LinkIcon sx={{ mr: 1.5, color: COLOR_VERDE_LIMA }} />
                    <Typography variant="h6" sx={{ color: COLOR_NEGRO_SUAVE, fontWeight: 'bold' }}>
                      Enlaces Rápidos
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        py: 1.5,
                        color: COLOR_AZUL_ELECTRICO,
                        borderColor: `${COLOR_AZUL_ELECTRICO}40`,
                        backgroundColor: `${COLOR_AZUL_ELECTRICO}08`,
                        '&:hover': {
                          borderColor: COLOR_AZUL_ELECTRICO,
                          backgroundColor: `${COLOR_AZUL_ELECTRICO}15`
                        }
                      }}
                      onClick={() => navigate('/mis-reservas')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <EventNote sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Mis Reservas
                        </Typography>
                      </Box>
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        py: 1.5,
                        color: COLOR_VERDE_LIMA,
                        borderColor: `${COLOR_VERDE_LIMA}40`,
                        backgroundColor: `${COLOR_VERDE_LIMA}08`,
                        '&:hover': {
                          borderColor: COLOR_VERDE_LIMA,
                          backgroundColor: `${COLOR_VERDE_LIMA}15`
                        }
                      }}
                      onClick={() => navigate('/reservar')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <SportsSoccer sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Nueva Reserva
                        </Typography>
                      </Box>
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        py: 1.5,
                        color: COLOR_NARANJA_VIBRANTE,
                        borderColor: `${COLOR_NARANJA_VIBRANTE}40`,
                        backgroundColor: `${COLOR_NARANJA_VIBRANTE}08`,
                        '&:hover': {
                          borderColor: COLOR_NARANJA_VIBRANTE,
                          backgroundColor: `${COLOR_NARANJA_VIBRANTE}15`
                        }
                      }}
                      onClick={() => navigate('/historial')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <History sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Historial
                        </Typography>
                      </Box>
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        py: 1.5,
                        color: COLOR_ROJO,
                        borderColor: `${COLOR_ROJO}40`,
                        backgroundColor: `${COLOR_ROJO}08`,
                        '&:hover': {
                          borderColor: COLOR_ROJO,
                          backgroundColor: `${COLOR_ROJO}15`
                        }
                      }}
                      onClick={() => navigate('/soporte')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Security sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Soporte
                        </Typography>
                      </Box>
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                    Acceso rápido a funciones principales
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}