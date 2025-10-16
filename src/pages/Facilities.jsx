import { useEffect, useState } from 'react';
import { espaciosApi } from '../api/espacios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CardActions,
} from '@mui/material';
import { Add, Edit, Delete, Stadium } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Facilities() {
  const [espacios, setEspacios] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    descripcion: '',
  });

  useEffect(() => {
    fetchEspacios();
  }, []);

  const fetchEspacios = async () => {
    try {
      const data = await espaciosApi.getMisEspacios();
      setEspacios(data);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await espaciosApi.update(editing.id_espacio_deportivo, formData);
        toast.success('Espacio actualizado correctamente');
      } else {
        await espaciosApi.create(formData);
        toast.success('Espacio creado correctamente');
      }
      handleClose();
      fetchEspacios();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar el espacio');
    }
  };

  const handleEdit = (espacio) => {
    setEditing(espacio);
    setFormData({
      nombre: espacio.nombre,
      ubicacion: espacio.ubicacion || '',
      capacidad: espacio.capacidad || '',
      descripcion: espacio.descripcion || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar este espacio?')) {
      try {
        await espaciosApi.desactivar(id);
        toast.success('Espacio desactivado correctamente');
        fetchEspacios();
      } catch (error) {
        toast.error('Error al desactivar el espacio');
      }
    }
  };

  const handleActivar = async (id) => {
    try {
      await espaciosApi.activar(id);
      toast.success('Espacio activado correctamente');
      fetchEspacios();
    } catch (error) {
      toast.error('Error al activar el espacio');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      nombre: '',
      ubicacion: '',
      capacidad: '',
      descripcion: '',
    });
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
            Espacios Deportivos
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
            Nuevo Espacio
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {espacios.map((espacio, index) => (
          <Grid item xs={12} sm={6} md={4} key={espacio.id_espacio_deportivo}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                espacio.estado === 'inactivo' ? 'opacity-60' : ''
              }`}>
                <Box
                  className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-t-2xl"
                >
                  <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" className="font-title mb-2">
                    {espacio.nombre}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    {espacio.ubicacion}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 font-body mb-2">
                    Capacidad: {espacio.capacidad} personas
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 font-body">
                    {espacio.descripcion || 'Sin descripción'}
                  </Typography>
                  <Box className="mt-2">
                    <Typography 
                      variant="caption" 
                      className={`font-bold ${
                        espacio.estado === 'activo' ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {espacio.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions className="justify-end p-4">
                  <IconButton
                    onClick={() => handleEdit(espacio)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit />
                  </IconButton>
                  {espacio.estado === 'activo' ? (
                    <IconButton
                      onClick={() => handleDelete(espacio.id_espacio_deportivo)}
                      className="text-highlight hover:bg-highlight/10"
                    >
                      <Delete />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => handleActivar(espacio.id_espacio_deportivo)}
                      className="text-green-600 hover:bg-green-600/10"
                    >
                      <Add />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

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
          {editing ? 'Editar Espacio' : 'Nuevo Espacio'}
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
              label="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Capacidad"
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
              required
              margin="normal"
              inputProps={{ min: '1' }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              margin="normal"
            />
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