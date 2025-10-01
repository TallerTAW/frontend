import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  const [facilities, setFacilities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await supabase
          .from('sports_facilities')
          .update(formData)
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Espacio actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('sports_facilities')
          .insert(formData);

        if (error) throw error;
        toast.success('Espacio creado correctamente');
      }

      setOpen(false);
      setEditing(null);
      setFormData({ name: '', address: '', description: '', image_url: '' });
      fetchFacilities();
    } catch (error) {
      toast.error('Error al guardar el espacio');
    }
  };

  const handleEdit = (facility) => {
    setEditing(facility);
    setFormData(facility);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este espacio?')) {
      try {
        const { error } = await supabase
          .from('sports_facilities')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Espacio eliminado correctamente');
        fetchFacilities();
      } catch (error) {
        toast.error('Error al eliminar el espacio');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({ name: '', address: '', description: '', image_url: '' });
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
        {facilities.map((facility, index) => (
          <Grid item xs={12} sm={6} md={4} key={facility.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardMedia
                  component="div"
                  className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                  sx={{
                    backgroundImage: facility.image_url
                      ? `url(${facility.image_url})`
                      : 'linear-gradient(to bottom right, #0f9fe1, #9eca3f)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!facility.image_url && <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />}
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" className="font-title mb-2">
                    {facility.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    {facility.address}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 font-body">
                    {facility.description || 'Sin descripción'}
                  </Typography>
                </CardContent>
                <CardActions className="justify-end p-4">
                  <IconButton
                    onClick={() => handleEdit(facility)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(facility.id)}
                    className="text-highlight hover:bg-highlight/10"
                  >
                    <Delete />
                  </IconButton>
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mb-4"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              margin="normal"
            />
            <TextField
              fullWidth
              label="URL de Imagen"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              margin="normal"
              helperText="URL de una imagen del espacio deportivo"
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
