import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canchasApi } from '../api/canchas';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, SportsSoccer, Block, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { image } from 'framer-motion/client';

export default function Courts() {
  const { profile } = useAuth();
  const [canchas, setCanchas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    hora_apertura: '08:00',
    hora_cierre: '22:00',
    precio_por_hora: '',
    id_espacio_deportivo: '',
    estado: 'disponible',
    imagen: ''
  });

  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      const [canchasData, espaciosData] = await Promise.all([
        canchasApi.getMisCanchas(),
        espaciosApi.getMisEspacios()
      ]);

      setCanchas(canchasData);
      setEspacios(espaciosData);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        precio_por_hora: parseFloat(formData.precio_por_hora),
        id_espacio_deportivo: parseInt(formData.id_espacio_deportivo)
      };

      if (editing) {
        await canchasApi.update(editing.id_cancha, dataToSave);
        toast.success('Cancha actualizada correctamente');
      } else {
        await canchasApi.create(dataToSave);
        toast.success('Cancha creada correctamente');
      }

      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar la cancha');
    }
  };

  const handleEdit = (cancha) => {
    setEditing(cancha);
    setFormData({
      nombre: cancha.nombre,
      tipo: cancha.tipo || '',
      hora_apertura: cancha.hora_apertura.slice(0, 5),
      hora_cierre: cancha.hora_cierre.slice(0, 5),
      precio_por_hora: cancha.precio_por_hora,
      id_espacio_deportivo: cancha.id_espacio_deportivo.toString(),
      estado: cancha.estado,
      imagen: cancha.imagen || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cancha?')) {
      try {
        await canchasApi.delete(id);
        toast.success('Cancha eliminada correctamente');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Error al eliminar la cancha');
      }
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await canchasApi.desactivar(id);
      toast.success('Cancha desactivada correctamente');
      fetchData();
    } catch (error) {
      toast.error('Error al desactivar la cancha');
    }
  };

  const handleActivar = async (id) => {
    try {
      await canchasApi.activar(id);
      toast.success('Cancha activada correctamente');
      fetchData();
    } catch (error) {
      toast.error('Error al activar la cancha');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      nombre: '',
      tipo: '',
      hora_apertura: '08:00',
      hora_cierre: '22:00',
      precio_por_hora: '',
      id_espacio_deportivo: '',
      estado: 'disponible',
      imagen: ''
    });
  };

  const getSportIcon = (tipo) => {
    const icons = {
      'Fútbol': '⚽',
      'Básquetbol': '🏀',
      'Tenis': '🎾',
      'Vóleibol': '🏐',
      'Rugby': '🏉',
      'Béisbol': '⚾',
      'Hockey': '🏒',
      'Ping Pong': '🏓',
      'Boxeo': '🥊',
      'Billar': '🎱',
      'Natación': '🏊',
      'Atletismo': '🏃'
    };
    return icons[tipo] || '🏆';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'disponible': 'success',
      'mantenimiento': 'warning',
      'inactiva': 'default'
    };
    return colors[estado] || 'default';
  };

  const getEstadoText = (estado) => {
    const texts = {
      'disponible': 'Disponible',
      'mantenimiento': 'Mantenimiento',
      'inactiva': 'Inactiva'
    };
    return texts[estado] || estado;
  };

  const getEspacioNombre = (idEspacio) => {
    const espacio = espacios.find(e => e.id_espacio_deportivo === idEspacio);
    return espacio ? espacio.nombre : 'N/A';
  };

  return (
    <Box sx={{ mt: 12, pr: 2}}>
      <Box className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" className="font-title text-primary">
            Gestión de Canchas
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
        {canchas.map((cancha, index) => (
          <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card sx={{ mt: 2 }} className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                cancha.estado !== 'disponible' ? 'opacity-70' : ''
              }`}>
                {/* Contenedor principal de la imagen */}
                <Box sx={{ height: 200 }} className="relative rounded-t-2xl overflow-hidden">
                  {cancha.imagen ? (
                    <img 
                      src={`${api_url}${cancha.imagen}`} 
                      alt={cancha.nombre} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Box className="w-full h-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
                      <Box className="text-8xl opacity-50">
                        {getSportIcon(cancha.tipo)}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Estado centrado debajo de la imagen */}
                <Box className="flex justify-center" sx={{ mt: 2 }}>
                  <Chip
                    label={getEstadoText(cancha.estado)}
                    color={getEstadoColor(cancha.estado)}
                    className="text-white font-bold"
                    size="small"
                  />
                </Box>

                <CardContent>
                  <Box className="flex items-center gap-2 mb-2">
                    <Typography className="text-3xl">{getSportIcon(cancha.tipo)}</Typography>
                    <Box>
                      <Typography variant="h6" className="font-title">
                        {cancha.nombre}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {getEspacioNombre(cancha.id_espacio_deportivo)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    Tipo: {cancha.tipo || 'No especificado'}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    Horario: {cancha.hora_apertura.slice(0,5)} - {cancha.hora_cierre.slice(0,5)}
                  </Typography>
                  <Typography variant="h6" className="font-title text-accent">
                    ${cancha.precio_por_hora}/hora
                  </Typography>
                </CardContent>

                <CardActions className="justify-end p-4">
                  <IconButton
                    onClick={() => handleEdit(cancha)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit />
                  </IconButton>
                  {cancha.estado === 'disponible' ? (
                    <IconButton
                      onClick={() => handleDesactivar(cancha.id_cancha)}
                      className="text-warning hover:bg-warning/10"
                    >
                      <Block />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => handleActivar(cancha.id_cancha)}
                      className="text-success hover:bg-success/10"
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                  <IconButton
                    onClick={() => handleDelete(cancha.id_cancha)}
                    className="text-error hover:bg-error/10"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {canchas.length === 0 && (
        <Box className="text-center py-12">
          <SportsSoccer sx={{ fontSize: 100, color: '#fbab22', opacity: 0.3 }} />
          <Typography variant="h6" className="text-gray-500 mt-4 font-body">
            No hay canchas registradas
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
        <DialogTitle className="bg-gradient-to-r from-accent to-highlight text-white font-title">
          {editing ? 'Editar Cancha' : 'Nueva Cancha'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4">
            <FormControl fullWidth margin="normal">
              <InputLabel>Espacio Deportivo *</InputLabel>
              <Select
                value={formData.id_espacio_deportivo}
                onChange={(e) => setFormData({ ...formData, id_espacio_deportivo: e.target.value })}
                required
              >
                {espacios.map((espacio) => (
                  <MenuItem key={espacio.id_espacio_deportivo} value={espacio.id_espacio_deportivo}>
                    {espacio.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Nombre *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              margin="normal"
              helperText="Ej: Fútbol, Básquetbol, Tenis, etc."
            />
            <Box className="flex gap-2">
              <TextField
                fullWidth
                label="Hora Apertura *"
                type="time"
                value={formData.hora_apertura}
                onChange={(e) => setFormData({ ...formData, hora_apertura: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Hora Cierre *"
                type="time"
                value={formData.hora_cierre}
                onChange={(e) => setFormData({ ...formData, hora_cierre: e.target.value })}
                required
                margin="normal"
              />
            </Box>
            <TextField
              fullWidth
              label="Precio por hora *"
              type="number"
              value={formData.precio_por_hora}
              onChange={(e) => setFormData({ ...formData, precio_por_hora: e.target.value })}
              required
              margin="normal"
              inputProps={{ step: '0.01', min: '0' }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="mantenimiento">En Mantenimiento</MenuItem>
                <MenuItem value="inactiva">Inactiva</MenuItem>
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