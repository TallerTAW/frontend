import { useEffect, useState } from 'react';
import { usuariosApi } from '../api/usuarios';
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
} from '@mui/material';
import { Edit, Visibility, Add, Block, CheckCircle } from '@mui/icons-material';
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

  const handleActivar = async (id) => {
    try {
      await usuariosApi.activar(id);
      toast.success('Usuario activado correctamente');
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
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TableContainer component={Paper} className="rounded-2xl shadow-lg">
          <Table>
            <TableHead>
              <TableRow className="bg-gradient-to-r from-primary to-secondary">
                <TableCell className="text-white font-title">Nombre</TableCell>
                <TableCell className="text-white font-title">Email</TableCell>
                <TableCell className="text-white font-title">Teléfono</TableCell>
                <TableCell className="text-white font-title">Rol</TableCell>
                <TableCell className="text-white font-title">Estado</TableCell>
                <TableCell className="text-white font-title">Fecha Registro</TableCell>
                <TableCell className="text-white font-title">Acciones</TableCell>
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
                >
                  <TableCell className="font-body">
                    {user.nombre} {user.apellido}
                  </TableCell>
                  <TableCell className="font-body">{user.email}</TableCell>
                  <TableCell className="font-body">{user.telefono || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleText(user.rol)}
                      color={getRoleColor(user.rol)}
                      size="small"
                      className="font-bold"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.estado}
                      color={user.estado === 'activo' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className="font-body">
                    {new Date(user.fecha_creacion).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      className="text-primary"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit />
                    </IconButton>
                    {user.estado === 'activo' ? (
                      <IconButton 
                        size="small" 
                        className="text-error"
                        onClick={() => handleDesactivar(user.id_usuario)}
                      >
                        <Block />
                      </IconButton>
                    ) : (
                      <IconButton 
                        size="small" 
                        className="text-success"
                        onClick={() => handleActivar(user.id_usuario)}
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
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
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
              margin="normal"
            />
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
              helperText={editing ? "Dejar vacío para mantener la contraseña actual" : ""}
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              margin="normal"
            />
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