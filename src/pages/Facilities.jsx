import { useEffect, useState, useCallback } from 'react';
import { espaciosApi } from '../api/espacios';
import { usuariosApi } from '../api/usuarios';
import { useAuth } from '../context/AuthContext';
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
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Stadium,
  CloudUpload,
  Delete as DeleteIcon,
  ZoomIn
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Componente para subir imágenes con drag & drop
const ImageUploader = ({ onImageChange, currentImage }) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const api_url = import.meta.env.VITE_API_URL;

  const handleFileChange = (file) => {
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes JPG, PNG o GIF');
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        border: dragOver ? '2px dashed #00BFFF' : '2px dashed #ccc',
        borderRadius: 2,
        padding: 3,
        textAlign: 'center',
        backgroundColor: dragOver ? 'rgba(0, 191, 255, 0.1)' : 'transparent',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        id="image-upload"
      />
      
      {preview ? (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <img 
            src={preview.startsWith('data:') ? preview : `${api_url}${preview}`}
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: 200, 
              borderRadius: 8,
              objectFit: 'cover'
            }}
          />
          <IconButton
            onClick={removeImage}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.8)',
              '&:hover': { backgroundColor: 'white' }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
          <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1" color="textSecondary">
            Arrastra una imagen aquí o haz click para seleccionar
          </Typography>
          <Typography variant="caption" color="textSecondary">
            PNG, JPG, GIF hasta 5MB
          </Typography>
        </label>
      )}
    </Box>
  );
};

// Modal para ver imagen en zoom
const ImageZoomModal = ({ image, open, onClose }) => {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <DeleteIcon />
        </IconButton>
        <img 
          src={image} 
          alt="Zoom" 
          style={{ 
            maxWidth: '90vw', 
            maxHeight: '90vh',
            borderRadius: 8
          }}
        />
      </Box>
    </Dialog>
  );
};

export default function Facilities() {
  const [espacios, setEspacios] = useState([]);
  const [open, setOpen] = useState(false);
  const [gestores, setGestores] = useState([]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    descripcion: '',
    gestor_id: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const api_url = import.meta.env.VITE_API_URL;

  const { profile } = useAuth();
   const isAdmin = profile?.rol === 'admin';

   useEffect(() => {
    fetchEspacios();
    if (isAdmin) {
      fetchGestores(); // Solo cargar gestores si es admin
    }
  }, [isAdmin]);

  const fetchEspacios = async () => {
    try {
      const data = await espaciosApi.getMisEspacios();
      setEspacios(data);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const fetchGestores = async () => {
    try {
      const data = await espaciosApi.getGestoresDisponibles();
      setGestores(data);
    } catch (error) {
      console.error('Error al cargar gestores:', error);
    }
  };

  const fetchGestorAsignado = async (espacioId) => {
    try {
      const data = await espaciosApi.getGestorAsignado(espacioId);
      return data.gestor_asignado;
    } catch (error) {
      console.error('Error al cargar gestor asignado:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('nombre', formData.nombre);
      submitData.append('ubicacion', formData.ubicacion);
      submitData.append('capacidad', formData.capacidad.toString());
      if (formData.descripcion) {
        submitData.append('descripcion', formData.descripcion);
      }
      if (formData.gestor_id && isAdmin) { // Solo incluir gestor_id si es admin
        submitData.append('gestor_id', formData.gestor_id);
      }
      if (imageFile) {
        submitData.append('imagen', imageFile);
      }

      if (editing) {
        await espaciosApi.update(editing.id_espacio_deportivo, submitData);
        toast.success('Espacio actualizado correctamente');
      } else {
        await espaciosApi.create(submitData);
        toast.success('Espacio creado correctamente');
      }
      handleClose();
      fetchEspacios();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar el espacio');
    }
  };

  const handleEdit = async (espacio) => {
    setEditing(espacio);

    let gestorAsignadoId = '';
    if (isAdmin) {
      try {
        const gestorAsignado = await fetchGestorAsignado(espacio.id_espacio_deportivo);
        if (gestorAsignado) {
          gestorAsignadoId = gestorAsignado.id_usuario;
        }
      } catch (err) {
        console.error('Error al obtener gestor asignado:', err);
      }
    }
    setFormData({
      nombre: espacio.nombre,
      ubicacion: espacio.ubicacion || '',
      capacidad: espacio.capacidad || '',
      descripcion: espacio.descripcion || '',
      gestor_id: gestorAsignadoId,
    });
    setImageFile(null);
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
      gestor_id: '',
    });
    setImageFile(null);
  };

  const handleImageZoom = (imageUrl) => {
    setSelectedImage(`${api_url}${imageUrl}`);
    setZoomOpen(true);
  };

  const getStatusColor = (estado) => {
    return estado === 'activo' ? 'success' : 'default';
  };

  return (
    <Box sx={{ mt: 12 }}>
      <Box className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" className="font-title text-primary">
            Espacios Deportivos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus espacios deportivos e instalaciones
          </Typography>
        </motion.div>
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
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
        )}
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
                  className="h-48 relative rounded-t-2xl overflow-hidden cursor-pointer" 
                  sx={{ height: 200 }}
                  onClick={() => espacio.imagen && handleImageZoom(espacio.imagen)}
                >
                  {espacio.imagen ? (
                    <>
                      <img 
                        src={`${api_url}${espacio.imagen}`} 
                        alt={espacio.nombre} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <Box className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn sx={{ color: 'white', opacity: 0, transition: 'opacity 0.3s' }} className="hover:opacity-100" />
                      </Box>
                    </>
                  ) : (
                    <Box className="absolute inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                    </Box>
                  )}
                  
                  <Box className="absolute top-3 right-3">
                    <Chip 
                      label={espacio.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                      color={getStatusColor(espacio.estado)}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <CardContent>
                  <Typography variant="h6" className="font-title mb-2">
                    {espacio.nombre}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 font-body mb-2">
                    📍 {espacio.ubicacion}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 font-body mb-2">
                    👥 Capacidad: {espacio.capacidad} personas
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 font-body line-clamp-2">
                    {espacio.descripcion || 'Sin descripción'}
                  </Typography>

                  {isAdmin && (
                    <Box className="mt-2">
                      <Typography variant="caption" className="text-gray-500">
                        Gestor asignado: {espacio.gestor_asignado || 'Sin asignar'}
                      </Typography>
                    </Box>
                  )}
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

      {/* Modal para crear/editar espacio */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'rounded-2xl',
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-primary to-secondary text-white font-title">
          {editing ? 'Editar Espacio Deportivo' : 'Nuevo Espacio Deportivo'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4 space-y-4">
            <ImageUploader 
              onImageChange={setImageFile}
              currentImage={editing?.imagen}
            />
            
            <TextField
              fullWidth
              label="Nombre del espacio"
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
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || '' })}
              required
              margin="normal"
              inputProps={{ min: '1' }}
            />
            
            {/* NUEVO: Selector de gestor */}
            { isAdmin && (
            <FormControl fullWidth margin="normal">
                <InputLabel>Gestor asignado</InputLabel>
                <Select
                  value={formData.gestor_id}
                  onChange={(e) => setFormData({ ...formData, gestor_id: e.target.value })}
                  label="Gestor asignado"
                >
                  <MenuItem value="">
                    <em>Sin asignar</em>
                  </MenuItem>
                  {gestores.map((gestor) => (
                    <MenuItem key={gestor.id_usuario} value={gestor.id_usuario}>
                      <Box className="flex items-center gap-2">
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {gestor.nombre?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {gestor.nombre} {gestor.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {gestor.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              margin="normal"
              placeholder="Describe las características del espacio..."
            />
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


      {/* Modal para zoom de imagen */}
      <ImageZoomModal 
        image={selectedImage}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
      />

      {espacios.length === 0 && (
        <Box className="text-center py-12">
          <Stadium sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
          <Typography variant="h6" className="text-gray-500">
            No hay espacios deportivos registrados
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2">
            Crea tu primer espacio deportivo para comenzar
          </Typography>
        </Box>
      )}
    </Box>
  );
}