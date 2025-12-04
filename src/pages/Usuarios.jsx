import { useEffect, useState } from 'react';
import { usuariosApi } from '../api/usuarios';
import { notificationsApi } from '../api/notifications';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Fab,
  Avatar,
  Badge,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  Edit, 
  Add, 
  Block, 
  CheckCircle, 
  Email,
  PersonAdd,
  Refresh,
  Person,
  Phone,
  Lock,
  AdminPanelSettings,
  ManageAccounts,
  Security,
  People,
  MoreVert,
  FilterList
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Paleta de colores
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_ROJO = '#f44336';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';
const COLOR_AMARILLO = '#FFD700';

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasenia: '',
    telefono: '',
    rol: 'cliente',
    estado: 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    let filtered = [...users];
    
    // Filtrar por pestaña activa
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => {
        if (activeTab === 'pending') return user.estado === 'inactivo';
        if (activeTab === 'active') return user.estado === 'activo';
        if (activeTab === 'admin') return user.rol === 'admin';
        if (activeTab === 'gestor') return user.rol === 'gestor';
        if (activeTab === 'cliente') return user.rol === 'cliente';
        return true;
      });
    }
    
    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.nombre?.toLowerCase().includes(term) ||
        user.apellido?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.telefono?.toLowerCase().includes(term) ||
        user.rol?.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, activeTab, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usuariosApi.getAll(true);
      setUsers(data || []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await usuariosApi.update(editing.id_usuario, formData);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuariosApi.create(formData);
        toast.success('Usuario creado correctamente');
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      contrasenia: '', // No mostrar contraseña
      telefono: user.telefono || '',
      rol: user.rol,
      estado: user.estado
    });
    setOpen(true);
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar este usuario?')) {
      try {
        await usuariosApi.desactivar(id);
        toast.success('Usuario desactivado correctamente');
        fetchUsers();
      } catch (error) {
        toast.error('Error al desactivar usuario');
      }
    }
  };

  const handleActivar = async (user) => {
    try {
      await usuariosApi.activar(user.id_usuario);
      
      // Crear notificación para el usuario aprobado
      await notificationsApi.create({
        titulo: "Cuenta Aprobada",
        mensaje: `Tu cuenta ha sido aprobada. Ahora tienes acceso al sistema como ${getRoleText(user.rol)}.`,
        tipo: "usuario_aprobado",
        usuario_id: user.id_usuario
      });
      
      toast.success('Usuario activado correctamente. Se ha enviado una notificación al usuario.');
      fetchUsers();
    } catch (error) {
      toast.error('Error al activar usuario');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      contrasenia: '',
      telefono: '',
      rol: 'cliente',
      estado: 'activo'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      gestor: 'warning',
      control_acceso: 'info',
      cliente: 'primary',
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <AdminPanelSettings />,
      gestor: <ManageAccounts />,
      control_acceso: <Security />,
      cliente: <People />,
    };
    return icons[role] || <Person />;
  };

  const getRoleText = (role) => {
    const texts = {
      admin: 'Administrador',
      gestor: 'Gestor',
      control_acceso: 'Control Acceso',
      cliente: 'Cliente',
    };
    return texts[role] || role;
  };

  const getStatusColor = (estado) => {
    return estado === 'activo' ? 'success' : 'default';
  };

  const getStatusIcon = (estado) => {
    return estado === 'activo' ? <CheckCircle /> : <Block />;
  };

  // Estadísticas
  const estadisticas = {
    total: users.length,
    pendientes: users.filter(u => u.estado === 'inactivo').length,
    activos: users.filter(u => u.estado === 'activo').length,
    admin: users.filter(u => u.rol === 'admin').length,
    gestor: users.filter(u => u.rol === 'gestor').length,
    cliente: users.filter(u => u.rol === 'cliente').length,
    control_acceso: users.filter(u => u.rol === 'control_acceso').length
  };

  // Función para obtener iniciales
  const getInitials = (nombre, apellido) => {
    const first = nombre?.charAt(0) || '';
    const last = apellido?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Responsive */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 2
          }}>
            <Box>
              <Typography
                variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
                sx={{
                  fontWeight: 'bold',
                  color: COLOR_AZUL_ELECTRICO,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                Gestión de Usuarios
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Administra los usuarios del sistema
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              {!isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchUsers}
                  size={isTablet ? "medium" : "large"}
                  sx={{ 
                    textTransform: 'none',
                    borderColor: COLOR_AZUL_ELECTRICO,
                    color: COLOR_AZUL_ELECTRICO,
                    '&:hover': {
                      borderColor: COLOR_AZUL_ELECTRICO,
                      backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                    }
                  }}
                >
                  Actualizar
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={isMobile ? <Add /> : undefined}
                onClick={() => setOpen(true)}
                size={isMobile ? "medium" : isTablet ? "medium" : "large"}
                fullWidth={isMobile}
                sx={{
                  textTransform: 'none',
                  backgroundColor: COLOR_VERDE_LIMA,
                  color: COLOR_NEGRO_SUAVE,
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: COLOR_VERDE_LIMA,
                    opacity: 0.9,
                  },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {isMobile ? 'Nuevo' : 'Nuevo Usuario'}
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Barra de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TextField
            fullWidth
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f9f9f9'
              }
            }}
          />
        </motion.div>
      </Box>

      {/* Tabs para filtrar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ mb: 3 }}
        >
          <Tab 
            value="all" 
            label={
              <Badge badgeContent={estadisticas.total} color="primary" max={999}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <People sx={{ fontSize: 16 }} />
                  {!isMobile && "Todos"}
                </Box>
              </Badge>
            } 
          />
          <Tab 
            value="pending" 
            label={
              <Badge badgeContent={estadisticas.pendientes} color="warning" max={99}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonAdd sx={{ fontSize: 16 }} />
                  {!isMobile && "Pendientes"}
                </Box>
              </Badge>
            } 
          />
          <Tab 
            value="active" 
            label={
              <Badge badgeContent={estadisticas.activos} color="success" max={999}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 16 }} />
                  {!isMobile && "Activos"}
                </Box>
              </Badge>
            } 
          />
          <Tab 
            value="admin" 
            label={
              <Badge badgeContent={estadisticas.admin} color="error" max={99}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AdminPanelSettings sx={{ fontSize: 16 }} />
                  {!isMobile && "Admins"}
                </Box>
              </Badge>
            } 
          />
        </Tabs>
      </motion.div>

      {/* Estadísticas en móvil */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {[
              { label: 'Total', value: estadisticas.total, color: COLOR_AZUL_ELECTRICO },
              { label: 'Pend', value: estadisticas.pendientes, color: COLOR_AMARILLO },
              { label: 'Activos', value: estadisticas.activos, color: COLOR_VERDE_LIMA },
              { label: 'Admin', value: estadisticas.admin, color: COLOR_ROJO },
            ].map((stat, index) => (
              <Grid item xs={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 1,
                  backgroundColor: `${stat.color}15`,
                  border: `1px solid ${stat.color}`,
                  borderRadius: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: stat.color,
                      fontSize: '1.25rem'
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'medium',
                      color: 'text.secondary',
                      fontSize: '0.7rem'
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

      {/* Tarjeta de pendientes destacada */}
      {estadisticas.pendientes > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card 
            sx={{ 
              mb: 3, 
              border: '2px solid',
              borderColor: 'warning.main',
              background: `linear-gradient(135deg, ${COLOR_AMARILLO}15 0%, ${COLOR_AMARILLO}08 100%)`
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Badge 
                  badgeContent={estadisticas.pendientes} 
                  color="warning" 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      fontSize: '0.9rem',
                      height: 28,
                      minWidth: 28,
                      borderRadius: 14
                    }
                  }}
                >
                  <PersonAdd sx={{ fontSize: 40, color: 'warning.main' }} />
                </Badge>
                <Box sx={{ flex: 1 }}>
                  <Typography variant={isMobile ? "h6" : "h5"} color="warning.dark" fontWeight="bold">
                    {estadisticas.pendientes} usuario(s) pendiente(s) de aprobación
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"} color="warning.dark">
                    Revisa y activa las cuentas de nuevos usuarios registrados
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab('pending')}
                  startIcon={<CheckCircle />}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    backgroundColor: 'warning.main',
                    color: COLOR_NEGRO_SUAVE,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'warning.dark',
                    },
                  }}
                >
                  Revisar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabla de usuarios */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
        </Box>
      ) : filteredUsers.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {isMobile ? (
            // Vista móvil: Cards
            <Grid container spacing={2}>
              {filteredUsers.map((user, index) => (
                <Grid item xs={12} key={user.id_usuario}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${user.estado === 'inactivo' ? COLOR_AMARILLO : COLOR_VERDE_LIMA}`
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: user.estado === 'inactivo' ? COLOR_AMARILLO : COLOR_AZUL_ELECTRICO,
                            width: 40,
                            height: 40
                          }}>
                            {getInitials(user.nombre, user.apellido)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {user.nombre} {user.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={getRoleText(user.rol)}
                          color={getRoleColor(user.rol)}
                          size="small"
                          sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption">
                              {user.telefono || 'Sin teléfono'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(user.estado)}
                            <Typography variant="caption" color={user.estado === 'activo' ? 'success.main' : 'text.secondary'}>
                              {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(user)}
                            sx={{ color: COLOR_AZUL_ELECTRICO }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        {user.estado === 'activo' ? (
                          <Tooltip title="Desactivar">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDesactivar(user.id_usuario)}
                              sx={{ color: COLOR_ROJO }}
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleActivar(user)}
                            sx={{
                              textTransform: 'none',
                              backgroundColor: '#4caf50',
                              '&:hover': {
                                backgroundColor: '#388e3c',
                              },
                              fontSize: '0.75rem'
                            }}
                          >
                            Aprobar
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Vista desktop/tablet: Tabla
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'auto'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: `${COLOR_AZUL_ELECTRICO}15`,
                    '& th': { 
                      fontWeight: 'bold',
                      color: COLOR_NEGRO_SUAVE,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Contacto</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow
                      key={user.id_usuario}
                      sx={{ 
                        backgroundColor: user.estado === 'inactivo' ? '#fff3cd' : 'inherit',
                        '&:hover': { backgroundColor: '#f9f9f9' }
                      }}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: user.estado === 'inactivo' ? COLOR_AMARILLO : COLOR_AZUL_ELECTRICO,
                            width: 40,
                            height: 40
                          }}>
                            {getInitials(user.nombre, user.apellido)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">
                              {user.nombre} {user.apellido}
                            </Typography>
                            {user.estado === 'inactivo' && (
                              <Chip 
                                label="Pendiente" 
                                color="warning" 
                                size="small" 
                                sx={{ mt: 0.5, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography>{user.email}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.telefono || 'Sin teléfono'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleText(user.rol)}
                          color={getRoleColor(user.rol)}
                          size="small"
                          icon={getRoleIcon(user.rol)}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            color={getStatusColor(user.estado)}
                            size="small"
                            icon={getStatusIcon(user.estado)}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Editar usuario">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEdit(user)}
                              sx={{ color: COLOR_AZUL_ELECTRICO }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          
                          {user.estado === 'activo' ? (
                            <Tooltip title="Desactivar usuario">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDesactivar(user.id_usuario)}
                                sx={{ color: COLOR_ROJO }}
                              >
                                <Block />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircle />}
                              onClick={() => handleActivar(user)}
                              sx={{
                                textTransform: 'none',
                                backgroundColor: '#4caf50',
                                '&:hover': {
                                  backgroundColor: '#388e3c',
                                },
                                fontSize: '0.75rem'
                              }}
                            >
                              Aprobar
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Contador de resultados */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </Typography>
        </motion.div>
      ) : (
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
            <People sx={{ 
              fontSize: { xs: 60, sm: 80, md: 100 }, 
              color: 'grey.400', 
              mb: 2 
            }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              No hay usuarios {searchTerm ? 'que coincidan con la búsqueda' : 
              activeTab === 'pending' ? 'pendientes de aprobación' : 
              activeTab === 'active' ? 'activos' : 
              activeTab === 'admin' ? 'administradores' : 
              'registrados'}
            </Typography>
            {searchTerm && (
              <Typography variant="body2" color="text.secondary">
                Intenta con otros términos de búsqueda
              </Typography>
            )}
          </Box>
        </motion.div>
      )}

      {/* FAB para móvil */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: COLOR_VERDE_LIMA,
            color: COLOR_NEGRO_SUAVE,
            '&:hover': {
              backgroundColor: COLOR_VERDE_LIMA,
              opacity: 0.9,
            },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Dialog para crear/editar usuario */}
      <Dialog
        open={open}
        onClose={handleClose}
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
          {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: { xs: 2, sm: 3 } }}>
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  margin="normal"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  margin="normal"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              margin="normal"
              size={isMobile ? "small" : "medium"}
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={formData.contrasenia}
              onChange={(e) => setFormData({ ...formData, contrasenia: e.target.value })}
              required={!editing}
              margin="normal"
              helperText={editing ? "Dejar vacío para mantener la contraseña actual" : "Mínimo 6 caracteres"}
              size={isMobile ? "small" : "medium"}
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              margin="normal"
              size={isMobile ? "small" : "medium"}
            />
            
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    required
                  >
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="gestor">Gestor</MenuItem>
                    <MenuItem value="control_acceso">Control de Acceso</MenuItem>
                    <MenuItem value="cliente">Cliente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Button 
              onClick={handleClose} 
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
              type="submit"
              variant="contained"
              size={isMobile ? "medium" : "large"}
              sx={{
                backgroundColor: COLOR_VERDE_LIMA,
                color: COLOR_NEGRO_SUAVE,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 },
                '&:hover': {
                  backgroundColor: COLOR_VERDE_LIMA,
                  opacity: 0.9,
                },
              }}
            >
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}