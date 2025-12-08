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
  Paper,
  CircularProgress,
  Divider
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
  Map,
  ArrowBack,
  Security,
  Person,
  Cancel,
  GpsFixed
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MapSelector from './MapSelector'; // Asegúrate de que la ruta sea correcta

// === PALETA DE COLORES ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_GRIS_OSCURO = '#333333';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

// Componente para subir imágenes
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
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
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
const HorariosCancha = ({ cancha, espacio, onBack }) => {
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

// Componente principal Facilities
export default function Facilities() {
  const [espacios, setEspacios] = useState([]);
  const [open, setOpen] = useState(false);
  const [gestores, setGestores] = useState([]);
  const [controlesAcceso, setControlesAcceso] = useState([]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const [view, setView] = useState('espacios');
  const [selectedEspacio, setSelectedEspacio] = useState(null);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [canchas, setCanchas] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    capacidad: '',
    descripcion: '',
    latitud: -16.5000,
    longitud: -68.1193,
    gestor_id: '',
    control_acceso_id: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const api_url = import.meta.env.VITE_API_URL;

  const { profile } = useAuth();
  const isAdmin = profile?.rol === 'admin';

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchEspacios();
    if (isAdmin) {
      fetchGestores();
      fetchControlesAcceso();
    }
  }, [isAdmin]);

  // Función para cargar espacios
  const fetchEspacios = async () => {
    try {
      setLoading(true);
      const data = await espaciosApi.getAll();
      setEspacios(data);
    } catch (error) {
      console.error('Error al cargar espacios:', error);
      toast.error('Error al cargar los espacios deportivos');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar gestores
  const fetchGestores = async () => {
    try {
      const data = await espaciosApi.getGestoresDisponibles(); 
      setGestores(data);
    } catch (error) {
      console.error('Error cargando gestores', error);
      toast.error('Error al cargar gestores');
    }
  };

  // Función para cargar controles de acceso
  const fetchControlesAcceso = async () => {
    try {
      const data = await espaciosApi.getControlesAccesoDisponibles();
      setControlesAcceso(data);
    } catch (error) {
      console.error('Error cargando controles de acceso', error);
      toast.error('Error al cargar controles de acceso');
    }
  };

  // Función para cargar canchas de un espacio
  const fetchCanchasByEspacio = async (espacioId) => {
    try {
      const data = await canchasApi.getByEspacio(espacioId);
      setCanchas(data);
    } catch (error) {
      console.error("Error cargando canchas", error);
      toast.error('Error al cargar las canchas');
    }
  };

  // Manejar click en espacio
  const handleEspacioClick = (espacio) => {
    setSelectedEspacio(espacio);
    fetchCanchasByEspacio(espacio.id_espacio_deportivo);
    setView('canchas');
  };

  // Manejar envío del formulario
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
      
      if (formData.latitud) {
        submitData.append('latitud', formData.latitud);
      }
      if (formData.longitud) {
        submitData.append('longitud', formData.longitud);
      }
      
      // Manejar gestor
      if (isAdmin && formData.gestor_id) {
        submitData.append('gestor_id', formData.gestor_id);
      } else if (isAdmin && formData.gestor_id === '') {
        submitData.append('gestor_id', '');
      }
      
      // Manejar control de acceso
      if (isAdmin && formData.control_acceso_id) {
        submitData.append('control_acceso_id', formData.control_acceso_id);
      } else if (isAdmin && formData.control_acceso_id === '') {
        submitData.append('control_acceso_id', '');
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
      console.error('Error al guardar:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar el espacio');
    }
  };

  // Navegación entre vistas
  const handleBackToEspacios = () => {
    setSelectedEspacio(null);
    setSelectedCancha(null);
    setView('espacios');
  };

  const handleBackToCanchas = () => {
    setSelectedCancha(null);
    setView('canchas');
  };

  // Activar espacio
  const handleActivar = async (id) => {
    try {
      await espaciosApi.activar(id);
      toast.success('Espacio activado correctamente');
      fetchEspacios();
    } catch (error) {
      toast.error('Error al activar el espacio');
    }
  };

  // Editar espacio
  const handleEdit = (espacio) => {
    setEditing(espacio);
    setFormData({
      nombre: espacio.nombre || '',
      ubicacion: espacio.ubicacion || '',
      capacidad: espacio.capacidad || '',
      descripcion: espacio.descripcion || '',
      estado: espacio.estado || 'activo',
      latitud: espacio.latitud || -16.5000,
      longitud: espacio.longitud || -68.1193,
      gestor_id: espacio.gestor_id || '',
      control_acceso_id: espacio.control_acceso_id || '',
    });
    setPreviewImage(espacio.imagen ? `${api_url}${espacio.imagen}` : null);
    setImageFile(null); 
    setOpen(true); 
  };

  // Eliminar espacio
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
      try {
        await espaciosApi.desactivar(id);
        toast.success('Espacio eliminado correctamente');
        fetchEspacios();
      } catch (error) {
        toast.error('Error al eliminar el espacio');
      }
    }
  };

  // Cerrar modal
  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      nombre: '',
      ubicacion: '',
      capacidad: '',
      descripcion: '',
      latitud: -16.5000,
      longitud: -68.1193,
      gestor_id: '',
      control_acceso_id: '',
    });
    setImageFile(null);
    setPreviewImage(null);
  };

  // Zoom de imagen
  const handleImageZoom = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomOpen(true);
  };

  // Click en cancha
  const handleCanchaClick = (cancha) => {
    setSelectedCancha(cancha);
    setView('horarios');
  };

  // Buscar canchas cercanas
  const handleBuscarCercanas = async () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      const espaciosCercanos = await espaciosApi.getNearby(lat, lon, 5);
      
      if (espaciosCercanos.length === 0) {
        toast.info('No se encontraron espacios deportivos cerca de tu ubicación');
        return;
      }

      setEspacios(espaciosCercanos);
      toast.success(`Se encontraron ${espaciosCercanos.length} espacios cerca de ti`);
      
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      toast.error('No se pudo obtener tu ubicación. Verifica los permisos.');
    }
  };

  // Manejar cambio de ubicación desde el mapa
  const handleLocationChange = (lat, lon, address) => {
    setFormData(prev => ({ 
      ...prev, 
      latitud: lat, 
      longitud: lon 
    }));
    
    // Si hay dirección detectada, actualizar el campo de ubicación
    if (address && !formData.ubicacion) {
      setFormData(prev => ({ 
        ...prev, 
        ubicacion: address 
      }));
    }
    
    toast.success('Ubicación actualizada en el mapa');
  };

  // Usar ubicación actual
  const handleUseCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.error('Geolocalización no soportada por este navegador');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setFormData(prev => ({ ...prev, latitud: lat, longitud: lon }));
      toast.success('Ubicación actual obtenida');
    },
    (error) => {
      console.error('Error obteniendo ubicación:', error);
      toast.error('No se pudo obtener la ubicación. Revisa permisos.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

  // Usar ubicación por defecto (La Paz)
  const handleUseDefaultLocation = () => {
  setFormData(prev => ({ 
    ...prev, 
    latitud: -16.5000, 
    longitud: -68.1193 
  }));
  toast.success('Ubicación establecida en La Paz, Bolivia');
};

  // Renderizar breadcrumbs
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

  // Renderizar vista de espacios
  const renderEspaciosView = () => (
    <>
      <Box sx={{ 
      display: 'flex', 
      // CAMBIO: Columna en móvil (xs), Fila en tablet/PC (sm)
      flexDirection: { xs: 'column', sm: 'row' }, 
      justifyContent: 'space-between', 
      // CAMBIO: Alinear a la izquierda en móvil, al centro en PC
      alignItems: { xs: 'flex-start', sm: 'center' }, 
      mb: 4,
      // CAMBIO: Espacio vertical entre título y botón en móvil
      gap: 2 
    }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: COLOR_AZUL_ELECTRICO,
            // CAMBIO: Fuente un poco más pequeña en celular para que no ocupe tanto
            fontSize: { xs: '1.75rem', md: '2.125rem' } 
          }}
        >
          Espacios Deportivos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestiona tus complejos y sedes
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        // CAMBIO: En celular, queremos que el contenedor del botón ocupe todo el ancho
        style={{ width: window.innerWidth < 600 ? '100%' : 'auto' }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{
            textTransform: 'none',
            backgroundColor: COLOR_NARANJA_VIBRANTE,
            color: COLOR_BLANCO,
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(253, 126, 20, 0.3)',
            // CAMBIO: Botón ancho completo en móvil
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              backgroundColor: '#CC6A11',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 15px rgba(253, 126, 20, 0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Nuevo Espacio
        </Button>
      </motion.div>
    </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                          src={espacio.imagen}
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

                    {espacio.latitud && espacio.longitud && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <GpsFixed sx={{ fontSize: 16, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {parseFloat(espacio.latitud).toFixed(4)}, {parseFloat(espacio.longitud).toFixed(4)}
                        </Typography>
                      </Box>
                    )}

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

                    {isAdmin && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                        {/* Gestor Responsable */}
                        <Typography variant="caption" color="text.secondary" display="block">
                          <Person sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          Gestor Responsable
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          {espacio.gestor_nombre ? (
                            <>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  fontSize: '0.75rem', 
                                  bgcolor: 'primary.main',
                                  color: 'white'
                                }}
                              >
                                {espacio.gestor_nombre.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {espacio.gestor_nombre} {espacio.gestor_apellido}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {espacio.gestor_id}
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Sin asignar
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Control de Acceso */}
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          <Security sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          Control de Acceso
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          {espacio.control_acceso_nombre ? (
                            <>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  fontSize: '0.75rem', 
                                  bgcolor: 'secondary.main',
                                  color: 'white'
                                }}
                              >
                                {espacio.control_acceso_nombre.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {espacio.control_acceso_nombre} {espacio.control_acceso_apellido}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {espacio.control_acceso_id}
                                </Typography>
                              </Box>
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
                      sx={{ 
                        color: COLOR_AZUL_ELECTRICO, 
                        '&:hover': { 
                          backgroundColor: `${COLOR_AZUL_ELECTRICO}10`,
                          transform: 'scale(1.1)'
                        } 
                      }}
                    >
                      <Edit />
                    </IconButton>
                    {espacio.estado === 'activo' ? (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(espacio.id_espacio_deportivo);
                        }}
                        sx={{ 
                          color: COLOR_NARANJA_VIBRANTE, 
                          '&:hover': { 
                            backgroundColor: `${COLOR_NARANJA_VIBRANTE}10`,
                            transform: 'scale(1.1)'
                          } 
                        }}
                      >
                        <Delete />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivar(espacio.id_espacio_deportivo);
                        }}
                        sx={{ 
                          color: COLOR_VERDE_LIMA, 
                          '&:hover': { 
                            backgroundColor: `${COLOR_VERDE_LIMA}10`,
                            transform: 'scale(1.1)'
                          } 
                        }}
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
      )}

      {espacios.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Stadium sx={{ fontSize: 80, color: 'gray', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'gray' }}>
            No hay espacios deportivos asignados
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              sx={{ mt: 2 }}
            >
              Crear primer espacio
            </Button>
          )}
        </Box>
      )}

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
            fontWeight: 'bold',
            py: 2
          }}
        >
          {editing ? '✏️ Editar Espacio Deportivo' : '➕ Nuevo Espacio Deportivo'}
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
              variant="outlined"
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Ubicación"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              required
              margin="normal"
              variant="outlined"
              placeholder="Ej: Av. 6 de Agosto, La Paz"
            />
            <TextField
              fullWidth
              label="Capacidad"
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || '' })}
              required
              margin="normal"
              variant="outlined"
              inputProps={{ min: '1' }}
            />
            
            {/* Mapa Interactivo */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: COLOR_NEGRO_SUAVE }}>
                📍 Seleccionar ubicación en el mapa
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    onClick={handleUseCurrentLocation}
                    fullWidth
                    startIcon={<GpsFixed />}
                    sx={{
                      textTransform: 'none',
                      borderColor: COLOR_AZUL_ELECTRICO,
                      color: COLOR_AZUL_ELECTRICO,
                      '&:hover': {
                        borderColor: COLOR_AZUL_ELECTRICO,
                        backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                      }
                    }}
                  >
                    Usar mi ubicación
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    onClick={handleUseDefaultLocation}
                    startIcon={<LocationOn />}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      borderColor: COLOR_VERDE_LIMA,
                      color: COLOR_NEGRO_SUAVE,
                      '&:hover': {
                        borderColor: COLOR_VERDE_LIMA,
                        backgroundColor: `${COLOR_VERDE_LIMA}10`
                      }
                    }}
                  >
                    Usar La Paz
                  </Button>
                </Grid>
              </Grid>
              
              <MapSelector
                lat={formData.latitud}
                lon={formData.longitud}
                onChange={handleLocationChange}
                height={300}
              />
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Latitud"
                    value={formData.latitud}
                    onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      readOnly: false,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Longitud"
                    value={formData.longitud}
                    onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      readOnly: false,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            {isAdmin && (
              <>
                {/* Selector de Gestor */}
                <FormControl fullWidth margin="normal" variant="outlined">
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
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                            {gestor.nombre?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {gestor.nombre} {gestor.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {gestor.email}
                            </Typography>
                          </Box>
                          <Chip 
                            label="Gestor" 
                            size="small" 
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.contrastText',
                              fontSize: '0.65rem'
                            }} 
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selector de Control de Acceso */}
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Control de Acceso asignado</InputLabel>
                  <Select
                    value={formData.control_acceso_id}
                    onChange={(e) => setFormData({ ...formData, control_acceso_id: e.target.value })}
                    label="Control de Acceso asignado"
                  >
                    <MenuItem value="">
                      <em>Sin asignar</em>
                    </MenuItem>
                    {controlesAcceso.map((control) => (
                      <MenuItem key={control.id_usuario} value={control.id_usuario}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                            {control.nombre?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {control.nombre} {control.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {control.email}
                            </Typography>
                          </Box>
                          <Chip 
                            label="Control" 
                            size="small" 
                            icon={<Security sx={{ fontSize: 14 }} />}
                            sx={{ 
                              bgcolor: 'secondary.light', 
                              color: 'secondary.contrastText',
                              fontSize: '0.65rem'
                            }} 
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
              margin="normal"
              variant="outlined"
              placeholder="Describe las características del espacio..."
              sx={{ mb: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={handleClose} 
              sx={{ 
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
              }}
              startIcon={<Cancel />}
            >
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
                px: 3,
                '&:hover': {
                  backgroundColor: '#CC6A11',
                  boxShadow: '0 4px 10px rgba(253, 126, 20, 0.5)',
                },
              }}
              startIcon={editing ? <Edit /> : <Add />}
            >
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal de zoom de imagen */}
      <ImageZoomModal
        image={selectedImage}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
      />
    </>
  );

  // Render principal
  return (
    <Box sx={{ mt: { xs: 10, md: 12 }, p: { xs: 2, md: 3 } }}>
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