import { useEffect, useState, useCallback } from 'react';
import { espaciosApi } from '../api/espacios';
import { canchasApi } from '../api/canchas';
import { reservasApi } from '../api/reservas';
import { usuariosApi } from "../api/usuarios";
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
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Paper // Nuevo import para el componente de mapa simulado
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Stadium,
  CloudUpload,
  Delete as DeleteIcon,
  ZoomIn,
  LocationOn,
  People,
  SportsSoccer,
  Schedule,
  Home,
  Map, // Nuevo icono
  ArrowBack
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// === PALETA DE COLORES ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_GRIS_OSCURO = '#333333';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

// Componente para subir imágenes con drag & drop
// ... (ImageUploader Componente sin cambios)
const ImageUploader = ({ onImageChange, currentImage }) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const api_url = import.meta.env.VITE_API_URL;

  const handleFileChange = (file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten imágenes JPG, PNG o GIF');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

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
// ... (ImageZoomModal Componente sin cambios)
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
            zIndex: 10,
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

// Componente para listar canchas
// ... (CanchasList Componente sin cambios)
const CanchasList = ({ espacio, canchas, onCanchaClick, onBack }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ color: COLOR_AZUL_ELECTRICO, fontWeight: 'bold' }}>
          Canchas de {espacio.nombre}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {canchas.map((cancha) => (
          <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }
              }}
              onClick={() => onCanchaClick(cancha)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE }}>
                  {cancha.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tipo: {cancha.tipo}
                </Typography>
                <Chip
                  label={cancha.estado}
                  size="small"
                  sx={{
                    backgroundColor: cancha.estado === 'disponible' ? COLOR_VERDE_LIMA : COLOR_NARANJA_VIBRANTE,
                    color: COLOR_NEGRO_SUAVE,
                    fontWeight: 'bold',
                    mt: 1
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Componente para horarios de cancha
// ... (HorariosCancha Componente sin cambios)
const HorariosCancha = ({ cancha, espacio, onBack }) => {
  const [horarios, setHorarios] = useState([]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ color: COLOR_AZUL_ELECTRICO, fontWeight: 'bold' }}>
          Horarios - {cancha.nombre}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Espacio: {espacio.nombre}
      </Typography>
      {/* Aquí iría la lógica para mostrar horarios */}
    </Box>
  );
};

// Icono de flecha hacia atrás (añadir en imports si es necesario)
// ... (ArrowBack Componente sin cambios)
// Ya está definido arriba

// ⭐ NUEVO COMPONENTE: Selector de Mapa
const MapPickerModal = ({ open, onClose, onLocationSelect, initialLat, initialLon }) => {
    // Estado para la ubicación seleccionada en el mapa (simulado)
    const [mapLocation, setMapLocation] = useState({ lat: initialLat || -16.5, lon: initialLon || -68.15 });
    
    // Función de simulación para seleccionar ubicación
    // En una implementación real con Leaflet/Google Maps, esto se llamaría con un evento click en el mapa
    const handleMapClick = (e) => {
        // Simulación: establecer coordenadas aleatorias cercanas para demostración
        const newLat = -16.5 + (Math.random() - 0.5) * 0.05;
        const newLon = -68.15 + (Math.random() - 0.5) * 0.05;
        setMapLocation({ lat: newLat.toFixed(6), lon: newLon.toFixed(6) });
        toast.info(`Nueva Ubicación Simulada: ${newLat.toFixed(6)}, ${newLon.toFixed(6)}`);
    };

    const handleConfirm = () => {
        onLocationSelect(mapLocation.lat, mapLocation.lon);
        onClose();
    };

    useEffect(() => {
      setMapLocation({ lat: initialLat || -16.5, lon: initialLon || -68.15 });
    }, [initialLat, initialLon, open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: COLOR_AZUL_ELECTRICO,
                    color: COLOR_BLANCO,
                    fontWeight: 'bold'
                }}
            >
                📍 Seleccionar Ubicación en el Mapa
            </DialogTitle>
            <DialogContent dividers>
                <Paper 
                    elevation={3}
                    sx={{ 
                        height: '50vh', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'crosshair',
                        backgroundColor: '#f0f0f0'
                    }}
                    onClick={handleMapClick} // Simula el click en el mapa
                >
                    {/* Aquí iría el componente de tu librería de mapas (e.g., Leaflet MapContainer) */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Map sx={{ fontSize: 60, color: COLOR_GRIS_OSCURO, opacity: 0.6 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                           Click para **simular** la selección en el mapa
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                            Coordenadas Seleccionadas: {mapLocation.lat}, {mapLocation.lon}
                        </Typography>
                    </Box>
                </Paper>
                
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    startIcon={<LocationOn />}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: COLOR_VERDE_LIMA,
                        color: COLOR_NEGRO_SUAVE,
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: COLOR_VERDE_LIMA, opacity: 0.9 }
                    }}
                >
                    Confirmar Ubicación
                </Button>
            </DialogActions>
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
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // ✅ ESTADOS FALTANTES Y NUEVO ESTADO DE MAPA AÑADIDO
  const [view, setView] = useState('espacios');
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [mapOpen, setMapOpen] = useState(false); // ⭐ NUEVO ESTADO: Controla la apertura del modal del mapa

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    gestor_id: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const api_url = import.meta.env.VITE_API_URL;

  const { profile } = useAuth();
  const isAdmin = profile?.rol === 'admin';

  // ✅ useEffect corregido
  useEffect(() => {
    fetchEspacios();
    if (isAdmin) {
      fetchGestores();
    }
  }, [isAdmin]);

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      let data;
      
      // SI ES ADMIN, USAMOS EL ENDPOINT QUE TRAE GESTORES
      if (isAdmin) {
          data = await espaciosApi.getAdminAll(true); // true para ver inactivos si quieres
      } else {
          // Si es cliente/gestor, usamos el normal
          data = await espaciosApi.getAll();
      }
      
      setEspacios(data);
    } catch (error) {
      console.error('Error al cargar espacios:', error);
      toast.error('Error al cargar los espacios deportivos');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN FALTANTE AÑADIDA
  const fetchGestores = async () => {
  try {
    const data = await usuariosApi.getGestores(); 
    setGestores(data);
  } catch (error) {
    toast.error('Error al cargar gestores');
  }
};

  const fetchCanchasByEspacio = async (espacioId) => {
    try {
      const data = await canchasApi.getByEspacio(espacioId);
      setCanchas(data);
    } catch (error) {
      console.error("Error cargando gestores", error);
      toast.error('Error al cargar las canchas');
    }
  };

  const handleEspacioClick = (espacio) => {
    setSelectedEspacio(espacio);
    fetchCanchasByEspacio(espacio.id_espacio_deportivo);
    setView('canchas');
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
      if (formData.latitud) submitData.append('latitud', formData.latitud);
      if (formData.longitud) submitData.append('longitud', formData.longitud);
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

  // ✅ FUNCIÓN FALTANTE AÑADIDA
  const handleEdit = (espacio) => {
    setSelectedEspacio(espacio);
    setFormData({
      nombre: espacio.nombre,
      ubicacion: espacio.ubicacion,
      capacidad: espacio.capacidad,
      descripcion: espacio.descripcion,
      estado: espacio.estado,
      latitud: espacio.latitud || -16.5000,
      longitud: espacio.longitud || -68.1193,
      // AQUÍ LA CLAVE: Si el backend devuelve null, ponemos string vacío para que el Select no falle
      gestor_id: espacio.gestor_id || '', 
      imagen: null
    });
    setPreviewImage(espacio.imagen_url ? `http://localhost:8000${espacio.imagen_url}` : null);
    setOpen(true);
  };

  // ✅ FUNCIÓN FALTANTE AÑADIDA
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
      try {
        await espaciosApi.eliminar(id);
        toast.success('Espacio eliminado correctamente');
        fetchEspacios();
      } catch (error) {
        toast.error('Error al eliminar el espacio');
      }
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
      latitud: '',
      longitud: '',
      gestor_id: '',
    });
    setImageFile(null);
  };

  const handleImageZoom = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomOpen(true);
  };

  const handleCanchaClick = (cancha) => {
    setSelectedCancha(cancha);
    setView('horarios');
  };

  // ⭐ NUEVO HANDLER: Abre el modal del mapa
  const handleOpenMap = () => {
    setMapOpen(true);
  };

  // ⭐ NUEVO HANDLER: Cierra el modal del mapa y establece las coordenadas
  const handleLocationSelect = (lat, lon) => {
    setFormData(prev => ({ ...prev, latitud: lat, longitud: lon }));
    toast.success(`Coordenadas seleccionadas: Latitud ${lat}, Longitud ${lon}`);
    setMapOpen(false);
  };


  // ✅ COMPONENTE FALTANTE AÑADIDO
  const renderBreadcrumbs = () => (
    <Breadcrumbs sx={{ mb: 3 }}>
      <Link
        underline="hover"
        color="inherit"
        onClick={() => {
          setView('espacios');
          setSelectedEspacio(null);
          setSelectedCancha(null);
        }}
        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <Home sx={{ mr: 0.5 }} fontSize="inherit" />
        Espacios
      </Link>
      {selectedEspacio && (
        <Link
          underline="hover"
          color="inherit"
          onClick={() => {
            setView('canchas');
            setSelectedCancha(null);
          }}
          sx={{ cursor: 'pointer' }}
        >
          {selectedEspacio.nombre}
        </Link>
      )}
      {selectedCancha && (
        <Typography color="text.primary">
          {selectedCancha.nombre}
        </Typography>
      )}
    </Breadcrumbs>
  );

  // ✅ FUNCIÓN FALTANTE AÑADIDA
  const renderEspaciosView = () => (
    <>
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
                marginRight: 2,
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

            <Button variant="contained"
            onClick={async () => {
              navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                const nearby = await espaciosApi.getNearbyEspacios(lat, lon, 5);
                setEspacios(nearby); // mostrar solo cercanos o abrir modal/mapa
              }, (err) => toast.error('No se obtuvo ubicación'));
            }}
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
              }}>
              Buscar canchas cerca de mí
            </Button>
          </motion.div>
        )}
      </Box>

      <Grid container spacing={4}>
        {espacios.map((espacio, index) => (
          <Grid item xs={12} sm={6} md={4} key={espacio.id_espacio_deportivo}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-4px)',
                  },
                  opacity: espacio.estado === 'inactivo' ? 0.6 : 1,
                  cursor: 'pointer'
                }}
                onClick={() => handleEspacioClick(espacio)}
              >
                <Box
                  sx={{
                    height: 200,
                    position: 'relative',
                    borderRadius: '12px 12px 0 0',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (espacio.imagen) handleImageZoom(espacio.imagen);
                  }}
                >
                  {espacio.imagen ? (
                    <>
                      <img
                        src={`${api_url}${espacio.imagen}`}
                        alt={espacio.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0)',
                          transition: 'background-color 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.3)'
                          }
                        }}
                      >
                        <ZoomIn
                          sx={{
                            color: 'white',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            fontSize: 40
                          }}
                          className="hover:opacity-100"
                        />
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${COLOR_AZUL_ELECTRICO}30`
                      }}
                    >
                      <Stadium sx={{ fontSize: 80, color: COLOR_BLANCO, opacity: 0.5 }} />
                    </Box>
                  )}

                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip
                      label={espacio.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                      size="small"
                      sx={{
                        backgroundColor: espacio.estado === 'activo' ? COLOR_VERDE_LIMA : COLOR_NARANJA_VIBRANTE,
                        color: COLOR_NEGRO_SUAVE,
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

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {espacio.ubicacion}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <People sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Capacidad: {espacio.capacidad} personas
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      height: 'auto',
                      minHeight: 30
                    }}
                  >
                    {espacio.descripcion || 'Sin descripción detallada.'}
                  </Typography>

                  {/* ... dentro del map de espacios ... */}
                    {isAdmin && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Gestor Responsable
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            {/* Usamos gestor_nombre que ahora SÍ llega del backend */}
                            {espacio.gestor_nombre ? (
                                <>
                                    <Avatar 
                                        sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}
                                    >
                                        {espacio.gestor_nombre.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {espacio.gestor_nombre} {espacio.gestor_apellido}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Sin asignar
                                </Typography>
                            )}
                        </Box>
                      </Box>
                    )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(espacio);
                    }}
                    sx={{ color: COLOR_AZUL_ELECTRICO, '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` } }}
                  >
                    <Edit />
                  </IconButton>
                  {espacio.estado === 'activo' ? (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(espacio.id_espacio_deportivo);
                      }}
                      sx={{ color: COLOR_NARANJA_VIBRANTE, '&:hover': { backgroundColor: `${COLOR_NARANJA_VIBRANTE}10` } }}
                    >
                      <Delete />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivar(espacio.id_espacio_deportivo);
                      }}
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
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: COLOR_AZUL_ELECTRICO,
            color: COLOR_BLANCO,
            fontWeight: 'bold'
          }}
        >
          {editing ? 'Editar Espacio Deportivo' : 'Nuevo Espacio Deportivo'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
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
            
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1, mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Latitud"
                        value={formData.latitud}
                        onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                        placeholder="-16.5000"
                        margin="normal"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Longitud"
                        value={formData.longitud}
                        onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                        placeholder="-68.1500"
                        margin="normal"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          alert('Geolocalización no soportada por este navegador');
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const lat = pos.coords.latitude;
                            const lon = pos.coords.longitude;
                            setFormData(prev => ({ ...prev, latitud: lat, longitud: lon }));
                            toast.success('Ubicación capturada');
                          },
                          (err) => {
                            console.error(err);
                            toast.error('No se pudo obtener la ubicación. Revisa permisos.');
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      }}
                      fullWidth
                    >
                      Usar mi ubicación
                    </Button>
                </Grid>
                {/* ⭐ NUEVO BOTÓN AÑADIDO */}
                <Grid item xs={12} sm={6}>
                    <Button
                      variant="outlined"
                      onClick={handleOpenMap}
                      startIcon={<Map />}
                      fullWidth
                    >
                      Buscar en Mapa
                    </Button>
                </Grid>
            </Grid>
            
            {isAdmin && (
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#CC6A11',
                  boxShadow: '0 4px 10px rgba(253, 126, 20, 0.5)',
                },
              }}
            >
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ⭐ NUEVO MODAL: Selector de Mapa */}
      <MapPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLat={formData.latitud}
        initialLon={formData.longitud}
      />
      {/* Fin Nuevo Modal */}

      {/* Modal para zoom de imagen */}
      <ImageZoomModal
        image={selectedImage}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
      />

      {espacios.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Stadium sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'gray' }}>
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
      {view === 'canchas' && selectedEspacio && (
        <CanchasList
          espacio={selectedEspacio}
          canchas={canchas}
          onCanchaClick={handleCanchaClick}
          onBack={handleBackToEspacios}
        />
      )}
      {view === 'horarios' && selectedCancha && selectedEspacio && (
        <HorariosCancha
          cancha={selectedCancha}
          espacio={selectedEspacio}
          onBack={handleBackToCanchas}
        />
      )}
    </Box>
  );
}