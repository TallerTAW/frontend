import { useEffect, useState, useCallback } from 'react';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  CardActions,
  Chip,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Stadium,
  CloudUpload,
  Delete as DeleteIcon,
  ZoomIn,
  LocationOn, // 📍 NUEVO ÍCONO
  People // 👥 NUEVO ÍCONO
  SportsSoccer,
  Schedule,
  Home
} from '@mui/icons-material';
import { motion } from 'framer-motion';


// === PALETA DE COLORES (Definida para consistencia con Layout/Dashboard) ===
const COLOR_AZUL_ELECTRICO = '#00BFFF'; // Primario: Títulos, iconos
const COLOR_VERDE_LIMA = '#A2E831';     // Acento: Botones, estado ACTIVO
const COLOR_NARANJA_VIBRANTE = '#FD7E14'; // Acento: Estado INACTIVO
const COLOR_GRIS_OSCURO = '#333333';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';


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
        border: dragOver ? `2px dashed ${COLOR_AZUL_ELECTRICO}` : '2px dashed #ccc',
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
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
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
  const api_url = import.meta.env.VITE_API_URL;
  
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
            zIndex: 10, // Asegurar que el botón esté encima de la imagen
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <DeleteIcon />
        </IconButton>
        <img 
          src={image.startsWith('data:') ? image : `${api_url}${image}`} 
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
  // Se usa el path de la imagen para el zoom
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
  }, [view]);

  const fetchEspacios = async () => {
    try {
      const data = await espaciosApi.getMisEspacios();
      setEspacios(data);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const fetchCanchasByEspacio = async (espacioId) => {
    try {
      const data = await canchasApi.getByEspacio(espacioId);
      setCanchas(data);
    } catch (error) {
      toast.error('Error al cargar las canchas');
    }
  };

  const handleEspacioClick = (espacio) => {
    setSelectedEspacio(espacio);
    fetchCanchasByEspacio(espacio.id_espacio_deportivo);
    setView('canchas');
  };

  const handleCanchaClick = (cancha) => {
    setSelectedCancha(cancha);
    setView('horarios');
  };

  const handleBackToEspacios = () => {
    setSelectedEspacio(null);
    setSelectedCancha(null);
    setView('espacios');
  };

  const handleBackToCanchas = () => {
    setSelectedCancha(null);
    setView('canchas');
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

  // Ahora pasamos solo el path al zoom
  const handleImageZoom = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomOpen(true);
  };
  
  return (
    <Box sx={{ mt: 0, p: 0 }}> 
      {/* Título y Botón */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: COLOR_AZUL_ELECTRICO 
            }}
          >
            Gestión de Espacios Deportivos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra tus instalaciones y asigna gestores.
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
                backgroundColor: COLOR_VERDE_LIMA,
                color: COLOR_NEGRO_SUAVE,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: COLOR_VERDE_LIMA,
                  opacity: 0.9,
                  boxShadow: '0 4px 8px rgba(162, 232, 49, 0.4)',
                },
              }}
            >
              Nuevo Espacio
            </Button>
          </motion.div>
        )}
      </Box>

      <Grid container spacing={4}> {/* Aumentado el spacing para mejor separación */}
        {espacios.map((espacio, index) => (
          <Grid item xs={12} sm={6} md={4} key={espacio.id_espacio_deportivo}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                sx={{
                  borderRadius: 3, // Mayor redondeo
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Sombra sutil pero visible
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-4px)', // Efecto de elevación
                  },
                  opacity: espacio.estado === 'inactivo' ? 0.6 : 1, // Desactivado
                }}
              >
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
                        // 👇 CAMBIO CLAVE: Se añaden las clases para forzar el llenado total del contenedor.
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <Box className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn sx={{ color: 'white', opacity: 0, transition: 'opacity 0.3s' }} className="hover:opacity-100" />
                      </Box>
                    </>
                  ) : (
                    <Box 
                      className="absolute inset-0 flex items-center justify-center"
                      sx={{ backgroundColor: `${COLOR_AZUL_ELECTRICO}30` }} 
                    >
                      <Stadium sx={{ fontSize: 80, color: COLOR_BLANCO, opacity: 0.5 }} />
                    </Box>
                  )}
                  
                  <Box className="absolute top-3 right-3">
                    <Chip 
                      label={espacio.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                      size="small"
                      sx={{
                        // Estilo del Chip con colores de marca
                        backgroundColor: espacio.estado === 'activo' ? COLOR_VERDE_LIMA : COLOR_NARANJA_VIBRANTE,
                        color: COLOR_NEGRO_SUAVE, // Texto negro sobre fondo de color
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>
                
                <CardContent sx={{ pb: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE, mb: 1 }}
                  >
                    {espacio.nombre}
                  </Typography>
                  
                  {/* Ubicación con Ícono */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {espacio.ubicacion}
                    </Typography>
                  </Box>

                  {/* Capacidad con Ícono */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Capacidad: {espacio.capacidad} personas
                    </Typography>
                  </Box>

                  {/* Descripción */}
                  <Typography 
                    variant="caption" 
                    color="text.disabled" 
                    sx={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, height: 'auto', minHeight: 30 }}
                  >
                    {espacio.descripcion || 'Sin descripción detallada.'}
                  </Typography>

                  {isAdmin && (
                    <Box className="mt-2">
                      <Typography variant="caption" color="text.primary" sx={{ fontWeight: 'medium' }}>
                        Gestor asignado: {espacio.gestor_asignado || 'Sin asignar'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <IconButton
                    onClick={() => handleEdit(espacio)}
                    sx={{ color: COLOR_AZUL_ELECTRICO, '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` } }}
                  >
                    <Edit />
                  </IconButton>
                  {espacio.estado === 'activo' ? (
                    <IconButton
                      onClick={() => handleDelete(espacio.id_espacio_deportivo)}
                      sx={{ color: COLOR_NARANJA_VIBRANTE, '&:hover': { backgroundColor: `${COLOR_NARANJA_VIBRANTE}10` } }}
                    >
                      <Delete />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={() => handleActivar(espacio.id_espacio_deportivo)}
                      sx={{ color: COLOR_VERDE_LIMA, '&:hover': { backgroundColor: `${COLOR_VERDE_LIMA}10` } }}
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
        <DialogTitle 
          sx={{ 
            // ✅ CORREGIDO: Usando COLOR_AZUL_ELECTRICO plano en lugar de degradado
            backgroundColor: COLOR_AZUL_ELECTRICO, 
            color: COLOR_BLANCO, 
            fontWeight: 'bold' 
          }}
        >
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
                // ✅ CORREGIDO: Usando COLOR_NARANJA_VIBRANTE plano en lugar de degradado
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#CC6A11', // Tono más oscuro de naranja para hover
                  boxShadow: '0 4px 10px rgba(253, 126, 20, 0.5)',
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
            No hay espacios deportivos asignados
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <Box sx={{ mt: 12, p: 3 }}>
      {renderBreadcrumbs()}
      
      {view === 'espacios' && renderEspaciosView()}
      {view === 'canchas' && (
        <CanchasList 
          espacio={selectedEspacio}
          canchas={canchas}
          onCanchaClick={handleCanchaClick}
          onBack={handleBackToEspacios}
        />
      )}
      {view === 'horarios' && (
        <HorariosCancha 
          cancha={selectedCancha}
          espacio={selectedEspacio}
          onBack={handleBackToCanchas}
        />
      )}
    </Box>
  );
}