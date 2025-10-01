import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, SportsSoccer } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Courts() {
  const { profile } = useAuth();
  const [courts, setCourts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [sports, setSports] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    facility_id: '',
    sport_id: '',
    name: '',
    description: '',
    price_per_hour: '',
    image_url: '',
    available: true,
  });

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const [courtsRes, facilitiesRes, sportsRes] = await Promise.all([
        profile?.role === 'admin_facility'
          ? supabase.from('courts').select('*, sports_facilities(name), sports(name, icon)').eq('facility_id', profile.facility_id)
          : supabase.from('courts').select('*, sports_facilities(name), sports(name, icon)'),
        supabase.from('sports_facilities').select('*'),
        supabase.from('sports').select('*'),
      ]);

      if (courtsRes.error) throw courtsRes.error;
      if (facilitiesRes.error) throw facilitiesRes.error;
      if (sportsRes.error) throw sportsRes.error;

      setCourts(courtsRes.data || []);
      setFacilities(facilitiesRes.data || []);
      setSports(sportsRes.data || []);

      if (profile?.role === 'admin_facility') {
        setFormData(prev => ({ ...prev, facility_id: profile.facility_id }));
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        price_per_hour: parseFloat(formData.price_per_hour),
      };

      if (editing) {
        const { error } = await supabase
          .from('courts')
          .update(dataToSave)
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Cancha actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('courts')
          .insert(dataToSave);

        if (error) throw error;
        toast.success('Cancha creada correctamente');
      }

      handleClose();
      fetchData();
    } catch (error) {
      toast.error('Error al guardar la cancha');
    }
  };

  const handleEdit = (court) => {
    setEditing(court);
    setFormData({
      facility_id: court.facility_id,
      sport_id: court.sport_id,
      name: court.name,
      description: court.description,
      price_per_hour: court.price_per_hour,
      image_url: court.image_url,
      available: court.available,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cancha?')) {
      try {
        const { error } = await supabase
          .from('courts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Cancha eliminada correctamente');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar la cancha');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      facility_id: profile?.role === 'admin_facility' ? profile.facility_id : '',
      sport_id: '',
      name: '',
      description: '',
      price_per_hour: '',
      image_url: '',
      available: true,
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
            Canchas
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
            className="bg-gradient-to-r from-accent to-highlight text-white rounded-xl shadow-lg"
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(to right, #fbab22, #f87326)',
              '&:hover': {
                background: 'linear-gradient(to right, #e09a1e, #e06320)',
              },
            }}
          >
            Nueva Cancha
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {courts.map((court, index) => (
          <Grid item xs={12} sm={6} md={4} key={court.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardMedia
                  component="div"
                  className="h-48 bg-gradient-to-br from-accent to-highlight flex items-center justify-center relative"
                  sx={{
                    backgroundImage: court.image_url
                      ? `url(${court.image_url})`
                      : 'linear-gradient(to bottom right, #fbab22, #f87326)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!court.image_url && (
                    <Box className="text-8xl opacity-50">
                      {court.sports?.icon || '⚽'}
                    </Box>
                  )}
                  <Chip
                    label={court.available ? 'Disponible' : 'No disponible'}
                    className={`absolute top-2 right-2 ${
                      court.available ? 'bg-secondary' : 'bg-gray-500'
                    } text-white font-bold`}
                    size="small"
                  />
                </CardMedia>
                <CardContent>
                  <Box className="flex items-center gap-2 mb-2">
                    <Typography className="text-3xl">{court.sports?.icon}</Typography>
                    <Box>
                      <Typography variant="h6" className="font-title">
                        {court.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {court.sports_facilities?.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    {court.description || 'Sin descripción'}
                  </Typography>
                  <Typography variant="h6" className="font-title text-accent">
                    ${court.price_per_hour}/hora
                  </Typography>
                </CardContent>
                <CardActions className="justify-end p-4">
                  <IconButton
                    onClick={() => handleEdit(court)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(court.id)}
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
        <DialogTitle className="bg-gradient-to-r from-accent to-highlight text-white font-title">
          {editing ? 'Editar Cancha' : 'Nueva Cancha'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4">
            <FormControl fullWidth margin="normal" disabled={profile?.role === 'admin_facility'}>
              <InputLabel>Espacio Deportivo</InputLabel>
              <Select
                value={formData.facility_id}
                onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                required
              >
                {facilities.map((facility) => (
                  <MenuItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Deporte</InputLabel>
              <Select
                value={formData.sport_id}
                onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                required
              >
                {sports.map((sport) => (
                  <MenuItem key={sport.id} value={sport.id}>
                    {sport.icon} {sport.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              label="Precio por hora"
              type="number"
              value={formData.price_per_hour}
              onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
              required
              margin="normal"
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              fullWidth
              label="URL de Imagen"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Disponibilidad</InputLabel>
              <Select
                value={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.value })}
              >
                <MenuItem value={true}>Disponible</MenuItem>
                <MenuItem value={false}>No disponible</MenuItem>
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
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(to right, #fbab22, #f87326)',
                '&:hover': {
                  background: 'linear-gradient(to right, #e09a1e, #e06320)',
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
