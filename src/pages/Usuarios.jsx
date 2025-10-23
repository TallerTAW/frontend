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
} from '@mui/material';
import { 
  Edit, 
  Add, 
  Block, 
  CheckCircle, 
  Email,
  PersonAdd,
  Refresh 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Usuarios() {
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usuariosApi.getAll(true);
      setUsers(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
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

  // Contar usuarios pendientes
  const pendingUsersCount = users.filter(user => user.estado === 'inactivo').length;

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" className="font-title text-primary">
            Gestión de Usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los usuarios del sistema
          </Typography>
        </motion.div>
        
        <Box className="flex gap-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              sx={{ textTransform: 'none' }}
            >
              Actualizar
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg"
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                '&:hover': {
                  background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                },
              }}
            >
              Nuevo Usuario
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Tarjeta de resumen */}
      {pendingUsersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card 
            sx={{ 
              mb: 3, 
              border: '2px solid',
              borderColor: 'warning.main',
              background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'
            }}
          >
            <CardContent>
              <Box className="flex items-center gap-3">
                <PersonAdd color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="warning.dark" fontWeight="bold">
                    {pendingUsersCount} usuario(s) pendiente(s) de aprobación
                  </Typography>
                  <Typography variant="body2" color="warning.dark">
                    Revisa y activa las cuentas de nuevos usuarios registrados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TableContainer component={Paper} className="rounded-2xl shadow-lg">
          <Table>
            <TableHead>
              <TableRow className="bg-gradient-to-r from-primary to-secondary">
                <TableCell className="text-white font-title">Usuario</TableCell>
                <TableCell className="text-white font-title">Contacto</TableCell>
                <TableCell className="text-white font-title">Rol Solicitado</TableCell>
                <TableCell className="text-white font-title">Estado</TableCell>
                <TableCell className="text-white font-title">Fecha Registro</TableCell>
                <TableCell className="text-white font-title text-center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={user.id_usuario}
                  className="hover:bg-gray-50 transition-colors"
                  component={motion.tr}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  sx={{
                    backgroundColor: user.estado === 'inactivo' ? '#fff3cd' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography fontWeight="bold" className="font-body">
                        {user.nombre} {user.apellido}
                      </Typography>
                      {user.estado === 'inactivo' && (
                        <Chip 
                          label="Pendiente" 
                          color="warning" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography className="font-body">{user.email}</Typography>
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
                      className="font-bold"
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-2">
                      <Chip
                        label={user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        color={getStatusColor(user.estado)}
                        size="small"
                        icon={getStatusIcon(user.estado)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell className="font-body">
                    {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <Box className="flex justify-center gap-1">
                      <IconButton 
                        size="small" 
                        className="text-primary"
                        onClick={() => handleEdit(user)}
                        title="Editar usuario"
                      >
                        <Edit />
                      </IconButton>
                      
                      {user.estado === 'activo' ? (
                        <IconButton 
                          size="small" 
                          className="text-error"
                          onClick={() => handleDesactivar(user.id_usuario)}
                          title="Desactivar usuario"
                        >
                          <Block />
                        </IconButton>
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
                          }}
                          title="Aprobar y activar usuario"
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
      </motion.div>

      {users.length === 0 && (
        <Box className="text-center py-12">
          <Typography variant="h6" className="text-gray-500 font-body">
            No hay usuarios registrados
          </Typography>
        </Box>
      )}

      {/* Diálogo para crear/editar usuario */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'rounded-2xl',
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-primary to-secondary text-white font-title">
          {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  margin="normal"
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
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              margin="normal"
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
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
                <FormControl fullWidth margin="normal">
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
          <DialogActions className="p-4">
            <Button onClick={handleClose} className="text-gray-600">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-gradient-to-r from-primary to-secondary"
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                '&:hover': {
                  background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
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