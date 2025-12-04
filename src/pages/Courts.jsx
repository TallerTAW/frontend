import { useEffect, useState, useCallback } from 'react';
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
  Avatar,
  OutlinedInput,
  Stack,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  SportsSoccer, 
  Block, 
  CheckCircle,
  CloudUpload,
  Delete as DeleteIcon,
  ZoomIn,
  Close,
  LocationOn,
  Schedule,
  AttachMoney,
  Search,
  Refresh,
  Sort // Icono para ordenar
} from '@mui/icons-material';
import { motion } from 'framer-motion';


// === PALETA DE COLORES (Tomada de Facilities.jsx para consistencia) ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
// Primario: Títulos, iconos
const COLOR_VERDE_LIMA = '#A2E831';     // Acento: Botones, estado ACTIVO
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
// Acento: Estado INACTIVO/MANTENIMIENTO
const COLOR_GRIS_OSCURO = '#333333';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

// Componente para subir imágenes con drag & drop (Estilo moderno)
const ImageUploader = ({ onImageChange, currentImage }) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const api_url = import.meta.env.VITE_API_URL;

  // Actualizar la vista previa si cambia la imagen inicial (al abrir la edición)
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

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
        // Pasar el archivo al componente padre
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
    // Notificar al padre que la imagen ha sido removida
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        // Estilo moderno: bordes suaves, colores de acento
        border: dragOver ? `2px dashed ${COLOR_NARANJA_VIBRANTE}` : '2px dashed #D3D3D3',
        borderRadius: 3, // Bordes más redondeados
        padding: 3,
        textAlign: 'center',
        
        backgroundColor: dragOver ? 'rgba(253, 126, 20, 0.1)' : '#f9f9f9', // Fondo gris claro
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
    
      <input
        type="file"
        accept="image/jpeg, image/jpg, image/png, image/gif"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        id="image-upload-cancha"
      />
      
      {preview ? (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <img 
       
          // Manejo de URL: si es blob/base64, usarlo;
          // si no, concatenar API_URL
            src={preview.startsWith('data:') || preview.startsWith('blob:') ?
          preview : `${api_url}${preview}`}
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: 250, 
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
         
              backgroundColor: COLOR_NARANJA_VIBRANTE, // Botón de eliminar en color de acento
              color: 'white',
              '&:hover': { backgroundColor: '#CC6A11' }
            }}
          >
            <DeleteIcon />
          </IconButton>
        
        </Box>
      ) : (
        <label htmlFor="image-upload-cancha" style={{ cursor: 'pointer' }}>
          <CloudUpload sx={{ fontSize: 50, color: COLOR_AZUL_ELECTRICO, mb: 1 }} />
          <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 'bold' }}>
            Arrastra una imagen aquí o haz click para seleccionar
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ 
          color: '#888' }}>
            PNG, JPG, GIF hasta 5MB
          </Typography>
        </label>
      )}
    </Box>
  );
};

// Modal para ver imagen en zoom (Estilo moderno)
const ImageZoomModal = ({ image, open, onClose }) => {
  const api_url = import.meta.env.VITE_API_URL;
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden'
        }
      }}
    >
      <Box 
      sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: COLOR_NARANJA_VIBRANTE,
    
            color: 'white',
            '&:hover': { backgroundColor: '#CC6A11' }
          }}
        >
          <Close /> 
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

export default function Courts() {
  const { profile } = useAuth();
  const [canchas, setCanchas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [open, setOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editing, setEditing] = useState(null);
  
  // ===================================================
  // ESTADOS DE FILTRO
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState(''); // Filtro por Tipo/Deporte
  const [selectedEstado, setSelectedEstado] = useState(''); // Filtro por Estado
  const [selectedTime, setSelectedTime] = useState(''); // Filtro por Hora
  const [sortPriceDirection, setSortPriceDirection] = useState(''); // Ordenamiento por Precio
  // ===================================================

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    hora_apertura: '08:00',
    hora_cierre: '22:00',
    precio_por_hora: '',
    id_espacio_deportivo: '',
    estado: 'disponible',
  });
  const [imageFile, setImageFile] = useState(null);
  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, [profile]);
  
  const fetchData = async () => {
    try {
      // Obtener canchas según el rol
      const canchasData = await canchasApi.getAll(); // Usar getAll() que ya filtra por rol
      
      // Obtener espacios según el rol
      const espaciosData = await espaciosApi.getAll(); // Usar getAll() que ya filtra por rol
      
      setCanchas(canchasData);
      setEspacios(espaciosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('nombre', formData.nombre);
      submitData.append('tipo', formData.tipo);
      submitData.append('hora_apertura', formData.hora_apertura);
      submitData.append('hora_cierre', formData.hora_cierre);
      submitData.append('precio_por_hora', formData.precio_por_hora);
      submitData.append('id_espacio_deportivo', formData.id_espacio_deportivo);
      submitData.append('estado', formData.estado);
      
      // Solo agregar la imagen si hay un nuevo archivo seleccionado
      if (imageFile instanceof File) {
        submitData.append('imagen', imageFile);
      } else if (editing && imageFile === null) {
        // Opción para manejar la eliminación de la imagen en edición si la API lo requiere
        // Por ahora, no enviamos nada si es null, confiando en que el backend lo maneje.
      } 


      if (editing) {
        await canchasApi.update(editing.id_cancha, submitData);
        toast.success('Cancha actualizada correctamente');
      } else {
        await canchasApi.create(submitData);
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
    });
    // Si hay una imagen existente, la pasamos al ImageUploader
    setImageFile(cancha.imagen || null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cancha? Esta acción es permanente.')) {
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
    if (window.confirm('¿Estás seguro de desactivar esta cancha y marcarla como inactiva?')) {
        try {
            await canchasApi.desactivar(id);
            toast.success('Cancha desactivada/marcada como inactiva');
            fetchData();
        } catch (error) {
            toast.error('Error al desactivar la cancha');
        }
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
    });
    setImageFile(null);
  };

  const handleImageZoom = (imageUrl) => {
    setSelectedImage(imageUrl); 
    setZoomOpen(true);
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
    switch(estado) {
      case 'disponible':
        return COLOR_VERDE_LIMA;
      case 'mantenimiento':
        return COLOR_NARANJA_VIBRANTE;
      case 'inactiva':
        return COLOR_GRIS_OSCURO;
      default:
        return COLOR_GRIS_OSCURO;
    }
  };

  const getEstadoText = (estado) => {
    const texts = {
      'disponible': 'DISPONIBLE',
      'mantenimiento': 'MANTENIMIENTO',
      'inactiva': 'INACTIVA'
    };
    return texts[estado] || estado.toUpperCase();
  };

  const getEspacioNombre = (idEspacio) => {
    if (!idEspacio) return 'Sin espacio asignado';
    const espacio = espacios.find(e => e.id_espacio_deportivo === parseInt(idEspacio));
    return espacio ? espacio.nombre : 'Espacio no encontrado';
  };
  
  // ===================================================
  // 1. GENERAR LISTA DE TIPOS DE DEPORTE ÚNICOS
  const tipoDeportes = Array.from(new Set(canchas.map(c => c.tipo))).filter(tipo => tipo);
  
  // ===================================================
  // 2. LÓGICA DE FILTRADO Y ORDENAMIENTO
  const filteredCanchas = canchas
    .filter(cancha => {
      // 1. Filtro de Texto (nombre y tipo)
      const matchesSearchTerm = searchTerm === '' || 
        (cancha.nombre && cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (cancha.tipo && cancha.tipo.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Filtro por Tipo de Deporte
      const matchesTipo = selectedTipo === '' || cancha.tipo === selectedTipo;

      // 3. Filtro por Estado
      const matchesEstado = selectedEstado === '' || cancha.estado === selectedEstado;

      // 4. Filtro por Hora - CORRECCIÓN IMPORTANTE
      let matchesTime = true;
      if (selectedTime) {
        // Convertir tiempo seleccionado a minutos para comparación
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const selectedMinutes = hours * 60 + minutes;
        
        // Convertir hora_apertura de la cancha a minutos
        const aperturaTime = cancha.hora_apertura;
        const [aperturaHours, aperturaMinutes] = typeof aperturaTime === 'string' 
          ? aperturaTime.split(':').map(Number)
          : [aperturaTime.getHours ? aperturaTime.getHours() : 8, aperturaTime.getMinutes ? aperturaTime.getMinutes() : 0];
        const aperturaMinutesTotal = aperturaHours * 60 + aperturaMinutes;
        
        // Convertir hora_cierre de la cancha a minutos
        const cierreTime = cancha.hora_cierre;
        const [cierreHours, cierreMinutes] = typeof cierreTime === 'string'
          ? cierreTime.split(':').map(Number)
          : [cierreTime.getHours ? cierreTime.getHours() : 22, cierreTime.getMinutes ? cierreTime.getMinutes() : 0];
        const cierreMinutesTotal = cierreHours * 60 + cierreMinutes;
        
        matchesTime = selectedMinutes >= aperturaMinutesTotal && 
                    selectedMinutes < cierreMinutesTotal;
      }
      
      return matchesSearchTerm && matchesTipo && matchesEstado && matchesTime;
    })
    .sort((a, b) => {
      if (sortPriceDirection === '') return 0;
      
      const priceA = parseFloat(a.precio_por_hora) || 0;
      const priceB = parseFloat(b.precio_por_hora) || 0;
      
      if (sortPriceDirection === 'asc') {
        return priceA - priceB;
      } else if (sortPriceDirection === 'desc') {
        return priceB - priceA;
      }
      return 0;
    });
  // ===================================================

  return (
    <Box sx={{ mt: 0, p: 0 }}>
      {/* --- Encabezado de la página (Gestión de Canchas) --- */}
      <Box sx={{ 
          display: 'flex', 
          // CAMBIO: Columna en móvil (xs), Fila en escritorio (md)
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          // CAMBIO: Alinear al inicio en móvil, al centro en escritorio
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: 4, 
          // CAMBIO: Menos padding en celular para aprovechar espacio
          px: { xs: 2, md: 4 }, 
          pt: 4,
          // CAMBIO: Espacio entre elementos cuando están en columna
          gap: 2 
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: COLOR_AZUL_ELECTRICO,
              // CAMBIO: Texto un poco más pequeño en celular
              fontSize: { xs: '1.75rem', md: '2.125rem' } 
            }}
          >
            Gestión de Canchas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los campos de juego dentro de tus espacios.
          </Typography>
        </motion.div>

        <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
             {/* El resto de los botones se queda igual, 
                 solo asegúrate de cerrar el Stack y el Box correctamente */}
             <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchData}
                sx={{ 
                    textTransform: 'none', 
                    color: COLOR_AZUL_ELECTRICO, 
                    borderColor: COLOR_AZUL_ELECTRICO,
                    // Opcional: Que los botones llenen el ancho en celular
                    flex: { xs: 1, md: 'initial' }
                }}
            >
              Actualizar
            </Button>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1 }} // Para que crezca en móvil
            >
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    sx={{
                        textTransform: 'none',
                        backgroundColor: COLOR_NARANJA_VIBRANTE,
                        color: COLOR_BLANCO,
                        fontWeight: 'bold',
                        width: '100%', // Ancho completo dentro de su contenedor flex
                        '&:hover': {
                            backgroundColor: COLOR_NARANJA_VIBRANTE,
                            opacity: 0.9,
                            boxShadow: '0 4px 8px rgba(253, 126, 20, 0.4)',
                        },
                    }}
                >
                    Nueva Cancha
                </Button>
            </motion.div>
        </Stack>
      </Box>
      
      {/* ---------------------------------------------------- */}
      {/* BARRA DE FILTROS Y BÚSQUEDA (5 Elementos) */}
      {/* ---------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{ px: { xs: 1, md: 4 }, mb: 3 }}
      >
        {/* Espaciado ajustado (1) para ganar espacio horizontal en celular */}
        <Grid container spacing={1}>
          
          {/* 1. BUSCADOR (Ancho completo en móvil) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por Nombre o Deporte"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: COLOR_AZUL_ELECTRICO }} />,
                style: { fontSize: '0.9rem', backgroundColor: '#FFF', borderRadius: '4px' }
              }}
              InputLabelProps={{ style: { fontSize: '0.9rem' } }}
              sx={{ '& fieldset': { borderRadius: 1 } }}
            />
          </Grid>

          {/* === FILA 1: HORA y DEPORTE (50% cada uno) === */}

          {/* 2. FILTRO HORA */}
          <Grid item xs={6} md={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Hora"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              InputLabelProps={{ shrink: true, style: { fontSize: '0.8rem' } }}
              InputProps={{ 
                style: { fontSize: '0.8rem', backgroundColor: '#FFF', borderRadius: '4px' } 
              }}
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 1 } }} 
            />
          </Grid>

          {/* 3. FILTRO DEPORTE (Igual ancho que Hora) */}
          <Grid item xs={22} md={14}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel sx={{ fontSize: '0.8rem', backgroundColor: '#FFF', px: 0.5 }}>Deporte</InputLabel>
              <Select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                label="Deporte" // Necesario para que el borde no corte el label
                sx={{ 
                    backgroundColor: '#FFF',
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    '& .MuiSelect-select': { py: 1 } // Ajuste vertical para igualar al input de hora
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                {tipoDeportes.map((tipo) => (
                  <MenuItem key={tipo} value={tipo} sx={{ fontSize: '0.85rem' }}>{tipo}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* === FILA 2: ESTADO y ORDENAR (50% cada uno) === */}

          {/* 4. FILTRO ESTADO */}
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel sx={{ fontSize: '0.8rem', backgroundColor: '#FFF', px: 0.5 }}>Estado</InputLabel>
              <Select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                label="Estado"
                sx={{ 
                    backgroundColor: '#FFF',
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    '& .MuiSelect-select': { py: 1 }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>Todos</MenuItem>
                <MenuItem value="disponible" sx={{ fontSize: '0.85rem' }}>Disponible</MenuItem>
                <MenuItem value="mantenimiento" sx={{ fontSize: '0.85rem' }}>Mantenimiento</MenuItem>
                <MenuItem value="inactiva" sx={{ fontSize: '0.85rem' }}>Inactiva</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* 5. FILTRO ORDENAR */}
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel sx={{ fontSize: '0.8rem', backgroundColor: '#FFF', px: 0.5 }}>Ordenar</InputLabel>
              <Select
                value={sortPriceDirection}
                onChange={(e) => setSortPriceDirection(e.target.value)}
                label="Ordenar"
                sx={{ 
                    backgroundColor: '#FFF',
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    '& .MuiSelect-select': { py: 1 }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>Sin Orden</MenuItem>
                <MenuItem value="asc" sx={{ fontSize: '0.85rem' }}>
                    <AttachMoney sx={{ fontSize: 14, color: COLOR_VERDE_LIMA, mr: 0.2 }} />
                    Asc.
                </MenuItem>
                <MenuItem value="desc" sx={{ fontSize: '0.85rem' }}>
                    <AttachMoney sx={{ fontSize: 14, color: COLOR_NARANJA_VIBRANTE, mr: 0.2 }} />
                    Desc.
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

        </Grid>
      </motion.div>


      {/* --- Grilla de Canchas --- */}
      <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
        {filteredCanchas.length === 0 ? (
           <Grid item xs={12}>
                <Box className="text-center py-12">
                    <SportsSoccer sx={{ fontSize: 80, color: COLOR_AZUL_ELECTRICO, opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" className="text-gray-500">
                        No se encontraron canchas que coincidan con los filtros.
                    </Typography>
                    <Typography variant="body2" className="text-gray-400 mt-2">
                        Intenta ajustar los criterios de búsqueda.
                    </Typography>
                </Box>
            </Grid>
        ) : (
            filteredCanchas.map((cancha, index) => (
            <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
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
                    opacity: cancha.estado === 'inactiva' ?
                    0.6 : 1,
                  }}
                >
                  {/* SECCIÓN DE IMAGEN Y CHIP DE ESTADO */}
                  <Box 
                    className="h-48 relative rounded-t-2xl overflow-hidden cursor-pointer" 
      
                    sx={{ height: 200 }}
                    onClick={() => cancha.imagen && handleImageZoom(cancha.imagen)}
                  >
                    {cancha.imagen ?
                  (
                      <>
                        <img 
                          src={`${api_url}${cancha.imagen}`} 
                          alt={cancha.nombre} 
         
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
                        <Typography className="text-8xl text-white opacity-60">
         
                          {getSportIcon(cancha.tipo)}
                        </Typography>
                      </Box>
                    )}
                    
       
                    <Box className="absolute top-3 right-3">
                      <Chip
                        label={getEstadoText(cancha.estado)}
                        size="small"
                      
                      sx={{
                          backgroundColor: getEstadoColor(cancha.estado),
                          fontWeight: 'bold',
                          color: cancha.estado === 'inactiva' ?
                          COLOR_BLANCO : COLOR_NEGRO_SUAVE
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ pb: 1 }}>
    
                    {/* TÍTULO Y PRECIO RE-ESTRUCTURADOS */}
                    <Box className="flex flex-col mb-3">
                      <Typography 
                        variant="h6" 
                
                        sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE, lineHeight: 1.2 }}
                      >
                        {cancha.nombre}
                      </Typography>
                      
     
                      {/* PRECIO AHORA DEBAJO DEL NOMBRE */}
                      <Box className="flex items-baseline mt-0.5">
                        <Typography 
                          variant="h5" 
        
                          sx={{ fontWeight: 'extrabold', color: COLOR_AZUL_ELECTRICO, lineHeight: 1 }}
                        >
                          Bs. {parseFloat(cancha.precio_por_hora).toFixed(2)} {/* <--- CAMBIO AQUÍ: $ a Bs. */}
                        </Typography>
         
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                          /hora
                        </Typography>
                      </Box>
             
                      </Box>
                    
                    {/* DETALLES EN LISTA */}
                    <Box sx={{ borderTop: '1px solid #eee', pt: 2, mt: 1 }}>
                      {/* Espacio Deportivo */}
    
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <LocationOn sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                        <Typography 
                      
                          variant="body2" 
                          color="text.primary"
                          sx={{ fontWeight: 'bold' }}
                        >
                        
                          {getEspacioNombre(cancha.id_espacio_deportivo)}
                        </Typography>
                      </Box>

                      {/* Tipo y Horario */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
      
                        <Avatar sx={{ width: 20, height: 20, bgcolor: COLOR_AZUL_ELECTRICO, color: COLOR_BLANCO, fontSize: 14, mr: 1 }}>
                          {getSportIcon(cancha.tipo)}
                        </Avatar>
                        
                        <Typography variant="body2" color="text.secondary">
                          {cancha.tipo ||
                          'Sin Tipo'}
                        </Typography>
                        <Schedule sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, ml: 2, mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                      
                          {cancha.hora_apertura.slice(0, 5)} - {cancha.hora_cierre.slice(0, 5)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  
                  {/* ACCIONES */}
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                    <IconButton
                      onClick={() => handleEdit(cancha)}
                      sx={{ color: COLOR_AZUL_ELECTRICO, '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` } }}
        
                      title="Editar Cancha"
                    >
                      <Edit />
                    </IconButton>
                    
            
                    {cancha.estado === 'disponible' || cancha.estado === 'mantenimiento' ?
                    (
                      <IconButton
                        onClick={() => handleDesactivar(cancha.id_cancha)}
                        sx={{ color: COLOR_NARANJA_VIBRANTE, '&:hover': { backgroundColor: `${COLOR_NARANJA_VIBRANTE}10` } }}
                        title="Desactivar / Poner en 
                        Mantenimiento"
                      >
                        <Block />
                      </IconButton>
                    ) : (
                   
                      <IconButton
                        onClick={() => handleActivar(cancha.id_cancha)}
                        sx={{ color: COLOR_VERDE_LIMA, '&:hover': { backgroundColor: `${COLOR_VERDE_LIMA}10` } }}
                        title="Activar Cancha"
                      
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    
                    <IconButton
     
                      onClick={() => handleDelete(cancha.id_cancha)}
                      sx={{ color: '#E53935', '&:hover': { backgroundColor: `#E5393510` } }}
                      title="Eliminar (Permanente)"
                    >
                
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      {canchas.length === 0 
      && (
        <Box className="text-center py-12">
          <SportsSoccer sx={{ fontSize: 80, color: COLOR_AZUL_ELECTRICO, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" className="text-gray-500">
            No hay canchas registradas
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2">
            Crea tu primera cancha para comenzar 
            a recibir reservas
          </Typography>
        </Box>
      )}

      {/* --- DIALOG DE CREACIÓN/EDICIÓN (Formulario con colores planos) --- */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'rounded-2xl shadow-2xl',
        }}
      >
        <DialogTitle 
          sx={{ 
            // Color plano de Azul Eléctrico
            backgroundColor: COLOR_AZUL_ELECTRICO, 
            color: COLOR_BLANCO, 
            fontWeight: 'bold',
        
            fontSize: '1.5rem'
          }}
        >
          {editing ?
          'Editar Cancha' : 'Nueva Cancha'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4 space-y-6">
            
            {/* 1. Uploader de imagen */}
            <ImageUploader 
              onImageChange={setImageFile}
           
              currentImage={editing?.imagen}
            />

            {/* 2. Espacio Deportivo */}
            <FormControl fullWidth margin="normal" required variant="outlined">
              <InputLabel sx={{ color: COLOR_GRIS_OSCURO }}>Espacio Deportivo *</InputLabel>
              <Select
                value={formData.id_espacio_deportivo}
   
                onChange={(e) => setFormData({ ...formData, id_espacio_deportivo: e.target.value })}
                label="Espacio Deportivo"
                input={<OutlinedInput label="Espacio Deportivo *" />}
                sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' } }}
              >
      
                {espacios.map((espacio) => (
                  <MenuItem key={espacio.id_espacio_deportivo} value={espacio.id_espacio_deportivo}>
                    <LocationOn sx={{ fontSize: 18, color: COLOR_AZUL_ELECTRICO, mr: 1 }} />
                    {espacio.nombre}
                  </MenuItem>
 
                ))}
              </Select>
            </FormControl>

            {/* 3. Nombre de la Cancha */}
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              margin="normal"
              variant="outlined"
              sx={{ '& fieldset': { borderRadius: 2, borderColor: '#ddd' } }}
 
            />

            {/* 4. Tipo de Deporte */}
            <TextField
              fullWidth
              label="Tipo de Deporte"
              value={formData.tipo}
              onChange={(e) => 
                setFormData({ ...formData, tipo: e.target.value })}
              margin="normal"
              variant="outlined"
              helperText="Ej: Fútbol, Básquetbol, Tenis, etc."
              sx={{ '& fieldset': { borderRadius: 2, borderColor: '#ddd' } }}
            />
          
            {/* 5. Horario (en una fila) */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, // CAMBIO AQUÍ
                gap: { xs: 2, sm: 4 } // Separación ajustada
            }}>
              <TextField
                fullWidth
                label="Hora Apertura"
                type="time"
                value={formData.hora_apertura}
                onChange={(e) => setFormData({ ...formData, hora_apertura: e.target.value })}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <Schedule sx={{ color: COLOR_AZUL_ELECTRICO, mr: 1 }} /> }}
                variant="outlined"
                sx={{ '& fieldset': { borderRadius: 2, borderColor: '#ddd' } }}
              />
              <TextField
                fullWidth
                label="Hora Cierre"
                type="time"
                value={formData.hora_cierre}
                onChange={(e) => setFormData({ ...formData, hora_cierre: e.target.value })}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <Schedule sx={{ color: COLOR_AZUL_ELECTRICO, mr: 1 }} /> }}
                variant="outlined"
                sx={{ '& fieldset': { borderRadius: 2, borderColor: '#ddd' } }}
              />
            </Box>

            {/* 6. Precio por hora */}
            <TextField
              fullWidth
              label="Precio por hora"
              type="number"
            
              value={formData.precio_por_hora}
              onChange={(e) => setFormData({ ...formData, precio_por_hora: e.target.value })}
              required
              margin="normal"
              variant="outlined"
              inputProps={{ step: '0.01', min: '0' }}
              // Usamos el icono AttachMoney para representar moneda, independientemente de si es $ o Bs.
              InputProps={{ startAdornment: <AttachMoney 
              sx={{ color: COLOR_NARANJA_VIBRANTE, mr: 0.5 }} /> }}
              sx={{ '& fieldset': { borderRadius: 2, borderColor: '#ddd' } }}
            />

            {/* 7. Estado (Visible solo al editar) */}
            {editing && (
              <FormControl fullWidth margin="normal" variant="outlined">
        
                <InputLabel sx={{ color: COLOR_GRIS_OSCURO }}>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  label="Estado"
            
                  input={<OutlinedInput label="Estado" />}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2, borderColor: '#ddd' } }}
                >
                  <MenuItem value="disponible">
                    <CheckCircle sx={{ color: COLOR_VERDE_LIMA, mr: 1 }} /> Disponible
  
                  </MenuItem>
                  <MenuItem value="mantenimiento">
                    <Block sx={{ color: COLOR_NARANJA_VIBRANTE, mr: 1 }} /> En Mantenimiento
                  </MenuItem>
                  
                  <MenuItem value="inactiva">
                    <Block sx={{ color: COLOR_GRIS_OSCURO, mr: 1 }} /> Inactiva
                  </MenuItem>
                </Select>
              </FormControl>
            )}
           
          </DialogContent>

          {/* Acciones del Modal */}
          <DialogActions className="p-4 border-t border-gray-100">
            <Button onClick={handleClose} className="text-gray-600 hover:bg-gray-100">
              Cancelar
            </Button>
            <Button
         
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                // Color plano de Naranja Vibrante
                backgroundColor: COLOR_NARANJA_VIBRANTE,
            
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#CC6A11',
                  boxShadow: '0 4px 10px rgba(253, 126, 20, 0.5)',
                },
 
              }}
            >
              {editing ?
              'Actualizar Cancha' : 'Crear Cancha'}
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
    </Box>
  );
}