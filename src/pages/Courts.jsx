import { useEffect, useState } from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify'; 
import { useCourtsLogic } from '../hooks/useCourtsLogic';


// === 1. LISTA DE DISCIPLINAS PERMITIDAS ===
const DISCIPLINAS = [
  'Fútbol',
  'Futsal',
  'Baloncesto',
  'Voleibol',
  'Tenis',
  'Pádel',
  'Wally',
  'Raquetbol',
  'Natación',
  'Gimnasio'
];


const ImageUploader = ({ onImageChange, currentImage, COLOR_NARANJA_VIBRANTE, COLOR_AZUL_ELECTRICO }) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const api_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

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
        border: dragOver ? `2px dashed ${COLOR_NARANJA_VIBRANTE}` : '2px dashed #D3D3D3',
        borderRadius: 3, 
        padding: 3,
        textAlign: 'center',
        backgroundColor: dragOver ? 'rgba(253, 126, 20, 0.1)' : '#f9f9f9',
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
            src={preview?.startsWith('data:') || preview?.startsWith('blob:') ?
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
              backgroundColor: COLOR_NARANJA_VIBRANTE,
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

const ImageZoomModal = ({ image, open, onClose, COLOR_NARANJA_VIBRANTE }) => {
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
      <Box sx={{ position: 'relative' }}>
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
          src={image?.startsWith('data:') ? 
          image : `${api_url}${image}`}
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
    const {
        COLOR_AZUL_ELECTRICO,
        COLOR_VERDE_LIMA,
        COLOR_NARANJA_VIBRANTE,
        COLOR_GRIS_OSCURO,
        COLOR_BLANCO,
        COLOR_NEGRO_SUAVE,
        SportsSoccer,
        AttachMoney,
        api_url,

        espacios,
        open,
        zoomOpen,
        selectedImage,
        editing,
        formData,
        searchTerm,
        selectedTipo,
        selectedEstado,
        selectedTime,
        sortPriceDirection,
        filteredCanchas,
        tipoDeportes,

        setOpen,
        setSearchTerm,
        setSelectedTipo,
        setSelectedEstado,
        setSelectedTime,
        setSortPriceDirection,
        setFormData,
        setImageFile,
        
        fetchData,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleDesactivar,
        handleActivar,
        handleClose,
        handleImageZoom,
        
        getSportIcon,
        getEstadoColor,
        getEstadoText,
        getEspacioNombre,

    } = useCourtsLogic();


    return (
        <Box sx={{ mt: 0, p: 0 }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: 4, 
                px: { xs: 2, md: 4 },
                pt: 4,
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
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchData}
                        sx={{ 
                            textTransform: 'none', 
                            color: COLOR_AZUL_ELECTRICO, 
                            borderColor: COLOR_AZUL_ELECTRICO,
                            flex: { xs: 1, md: 'initial' }
                        }}
                    >
                        Actualizar
                    </Button>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ flex: 1 }}
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
                                width: '100%',
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
        
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                sx={{ px: { xs: 1, md: 4
            }, mb: 3 }}
            >
                <Grid container spacing={3} sx={{ mb: 2 }}>
                
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

                <Grid container spacing={1} sx={{ mb: 2 }}></Grid>

                {/* --- FILA 2: FILTROS RESTANTES (md={3} para ancho uniforme) --- */}
                <Grid container spacing={2} sx={{ mb: 3 }}> {/* <-- Nuevo Grid container y spacing=2 */}
                
                    <Grid item xs={6} md={3}> {/* <-- Cambiado de md={1.5} a md={3} */}
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

                    <Grid item xs={6} md={3}> 
                        <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: { xs: 100, md: 100 }}}>
                
                        <InputLabel sx={{ fontSize: '0.8rem', backgroundColor: '#FFF', px: 0.5 }}>Deporte</InputLabel>
                            <Select
                                value={selectedTipo}
                                onChange={(e) => setSelectedTipo(e.target.value)}
                                label="Deporte"
                                sx={{ 
                                    backgroundColor: '#FFF',
                                    borderRadius: 1,
                                    fontSize: '0.8rem',
                                    '& .MuiSelect-select': { py: 1 }
                                    }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>Seleccione Deporte</MenuItem>
                                {tipoDeportes.map((tipo) => (
                                <MenuItem key={tipo} value={tipo} sx={{ fontSize: '0.85rem' }}>{tipo}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6} md={3}> 
                        <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: { xs: 100, md: 100 }}}>
                            <InputLabel sx={{ 
                                fontSize: '0.8rem', backgroundColor: '#FFF', px: 0.5 }}>Estado</InputLabel>
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
                    <Grid item xs={6} md={3}> {/* <-- Cambiado de md={1.5} a md={3} */}
                        <FormControl fullWidth size="small" variant="outlined" sx={{ minWidth: { xs: 100, md: 100 }}}>
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
                                <AttachMoney sx={{ fontSize: 14, color: COLOR_VERDE_LIMA, mr: 0.2 }} />Asc.</MenuItem>
                                <MenuItem value="desc" sx={{ fontSize: '0.85rem' }}>
                                <AttachMoney sx={{ fontSize: 14, color: COLOR_NARANJA_VIBRANTE, mr: 0.2 }} />Desc.</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                </Grid>
            </motion.div>


            <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 },justifyContent: 'center'}}>
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
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        height: 480,
                                        minWidth: 380, // Ancho mínimo
                                        maxWidth: 380, // Ancho máximo
                                    }}
                                >
                            
                                    <Box 
                                        className="h-48 relative rounded-t-2xl overflow-hidden cursor-pointer" 
                                        sx={{ height: 200 }}
                                        onClick={() => cancha.imagen && handleImageZoom(cancha.imagen)}
                                    >
                                        {cancha.imagen ? (
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

                            
                                    <CardContent 
                                        sx={{ 
                                            pb: 1,
                                            flexGrow: 1,
                                        }}
                                    >
                            
                                        <Box className="flex flex-col mb-3">
                                            <Typography 
                                                variant="h6" 
                                                sx={{ fontWeight: 'bold', color: COLOR_NEGRO_SUAVE, lineHeight: 1.2 }}
                                            >
                                                {cancha.nombre}
                                            </Typography>
                                    
                                            <Box className="flex items-baseline mt-0.5">
                                                <Typography 
                                                    variant="h5" 
                                                    sx={{ fontWeight: 'extrabold', color: COLOR_AZUL_ELECTRICO, lineHeight: 1 }}
                                                >
                                                    Bs. {parseFloat(cancha.precio_por_hora).toFixed(2)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                                                    /hora
                                                </Typography>
                                            </Box>
                                
                                        </Box>
                                    
                                    
                                        <Box sx={{ borderTop: '1px solid #eee', pt: 2, mt: 1 }}>
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

                                    
                                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                                
                                        <IconButton
                                            onClick={() => handleEdit(cancha)}
                                            sx={{ color: COLOR_AZUL_ELECTRICO, '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` } }}
                                            title="Editar Cancha"
                                        >
                                            <Edit />
                                        </IconButton>
                                        
                                        
                                        {cancha.estado === 'disponible' || cancha.estado === 'mantenimiento' ? (
                                            <IconButton
                                                onClick={() => handleDesactivar(cancha.id_cancha)}
                                                sx={{ color: COLOR_NARANJA_VIBRANTE, '&:hover': { backgroundColor: `${COLOR_NARANJA_VIBRANTE}10` } }}
                                                title="Desactivar / Poner en Mantenimiento"
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

            {filteredCanchas.length === 0 && searchTerm === '' && selectedTipo === '' && selectedEstado === '' && selectedTime === ''
            && (
                <Box className="text-center py-12">
                    <SportsSoccer sx={{ fontSize: 80, color: COLOR_AZUL_ELECTRICO, opacity: 0.3, mb: 2 }} />
                    <Typography variant="h6" className="text-gray-500">
                        No hay canchas registradas
                    </Typography>
                    <Typography variant="body2" className="text-gray-400 mt-2">
                        Crea tu primera cancha para comenzar a recibir reservas
                    </Typography>
                </Box>
            )}

        
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
                        
                        <ImageUploader 
                            onImageChange={setImageFile}
                            currentImage={editing?.imagen}
                            COLOR_NARANJA_VIBRANTE={COLOR_NARANJA_VIBRANTE}
                            COLOR_AZUL_ELECTRICO={COLOR_AZUL_ELECTRICO}
                        />

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

                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Tipo de Deporte</InputLabel>
                            <Select
                                value={formData.tipo}
                                label="Tipo de Deporte"
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            >
                                {DISCIPLINAS.map((disciplina) => (
                                    <MenuItem key={disciplina} value={disciplina}>
                                        {disciplina}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 2, sm: 4 }
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
                            InputProps={{ startAdornment: <AttachMoney 
                            sx={{ color: COLOR_NARANJA_VIBRANTE, mr: 0.5 }} /> }}
                            sx={{ '& fieldset': { borderRadius: 2, borderColor: '#ddd' } }}
                        />

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
                                        <Block sx={{ color: COLOR_NARANJA_VIBRANTE, mr: 1
                                        }} /> En Mantenimiento
                                    </MenuItem>
                                    
                                    <MenuItem value="inactiva">
                                        <Block sx={{ color: COLOR_GRIS_OSCURO, mr: 1 }} /> Inactiva
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    
                    </DialogContent>

                    <DialogActions className="p-4 border-t border-gray-100">
                        <Button onClick={handleClose} className="text-gray-600 hover:bg-gray-100">
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
                            {editing ?
                                'Actualizar Cancha' : 'Crear Cancha'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <ImageZoomModal 
                image={selectedImage}
                open={zoomOpen}
                onClose={() => setZoomOpen(false)}
                COLOR_NARANJA_VIBRANTE={COLOR_NARANJA_VIBRANTE}
            />
        </Box>
    );
}