import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, sports_facilities(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin_general: 'error',
      admin_facility: 'warning',
      client: 'primary',
      regulator: 'info',
    };
    return colors[role] || 'default';
  };

  const getRoleText = (role) => {
    const texts = {
      admin_general: 'Admin General',
      admin_facility: 'Admin Facility',
      client: 'Cliente',
      regulator: 'Regulador',
    };
    return texts[role] || role;
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-6">
          Gestión de Usuarios
        </Typography>
      </motion.div>

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
                <TableCell className="text-white font-title">Rol</TableCell>
                <TableCell className="text-white font-title">Espacio Asignado</TableCell>
                <TableCell className="text-white font-title">Fecha de Registro</TableCell>
                <TableCell className="text-white font-title">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                  component={motion.tr}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TableCell className="font-body">{user.full_name}</TableCell>
                  <TableCell className="font-body">{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleText(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                      className="font-bold"
                    />
                  </TableCell>
                  <TableCell className="font-body">
                    {user.sports_facilities?.name || '-'}
                  </TableCell>
                  <TableCell className="font-body">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" className="text-primary">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" className="text-secondary">
                      <Edit />
                    </IconButton>
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
    </Box>
  );
}
