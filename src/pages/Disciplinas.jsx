import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { disciplinasApi } from "../api/disciplinas"; // [cite: 2]
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
  CardActions, // Importado para las acciones de la tarjeta
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

// === PALETA DE COLORES (Tomada de Courts.jsx para consistencia) ===
// Azul Eléctrico: Para títulos y acentos principales.
const COLOR_AZUL_ELECTRICO = '#00BFFF'; 
// Naranja Vibrante: Para el botón principal y acentos de acción.
const COLOR_NARANJA_VIBRANTE = '#FD7E14'; 
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

// Colores de íconos temáticos (para hacerlos más vibrantes que el gris por defecto)
const ICON_COLORS = [
    'text-blue-500', 
    'text-red-500', 
    'text-green-600', 
    'text-yellow-600', 
    'text-purple-500',
    'text-pink-500',
];


export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  const fetchDisciplinas = async () => {
    try {
      const data = await disciplinasApi.getAll();
      setDisciplinas(data);
    } catch (error) {
      toast.error("Error al cargar disciplinas");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
      };

      if (editing) {
        await disciplinasApi.update(editing.id_disciplina, dataToSubmit);
        toast.success("Disciplina actualizada correctamente");
      } else {
        await disciplinasApi.create(dataToSubmit);
        toast.success("Disciplina creada correctamente");
      }
      handleClose(); 
      fetchDisciplinas();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al guardar la disciplina");
    }
  };

  const handleEdit = (disciplina) => {
    setEditing(disciplina);
    setFormData({
        nombre: disciplina.nombre,
        descripcion: disciplina.descripcion,
    }); 
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta disciplina?")) {
      try {
        await disciplinasApi.delete(id);
        toast.success("Disciplina eliminada correctamente");
        fetchDisciplinas();
      } catch (error) {
        toast.error("Error al eliminar la disciplina");
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({ nombre: "", descripcion: "" });
  };

  // Función para obtener el ícono Emoji (adaptada de la versión anterior)
  const getSportIcon = (nombre) => {
    const defaultIcon = '🏆';
    const normalizedName = nombre.toLowerCase();

    if (normalizedName.includes('fútbol') || normalizedName.includes('soccer')) return '⚽';
    if (normalizedName.includes('baloncesto') || normalizedName.includes('básquetbol') || normalizedName.includes('basket')) return '🏀';
    if (normalizedName.includes('natación') || normalizedName.includes('piscina')) return '🏊';
    if (normalizedName.includes('voleibol') || normalizedName.includes('vóley')) return '🏐';
    if (normalizedName.includes('tenis')) {
        if (normalizedName.includes('mesa')) return '🏓';
        return '🎾';
    }
    
    return defaultIcon;
  };

  return (
    <Box sx={{ mt: 0, p: 0 }}>
      {/* --- Cabecera: Título y Botón (Estilo Courts.jsx) --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, px: 4, pt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: COLOR_AZUL_ELECTRICO // Título en Azul Eléctrico
            }}
          >
            Gestión de Disciplinas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los tipos de deporte que se ofrecen en tus canchas.
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
            sx={{
              textTransform: 'none',
              backgroundColor: COLOR_NARANJA_VIBRANTE, // Botón principal en Naranja Vibrante
              color: COLOR_BLANCO,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                opacity: 0.9,
                boxShadow: '0 4px 8px rgba(253, 126, 20, 0.4)',
              },
            }}
          >
            Nueva Disciplina
          </Button>
        </motion.div>
      </Box>
      
      {/* --- Grilla de Disciplinas (Estilo Courts.jsx Card) --- */}
      <Grid container spacing={4} sx={{ p: 4 }}>
        {disciplinas.map((disciplina, index) => {
            const emoji = getSportIcon(disciplina.nombre);
            // Asigna un color vibrante del array basado en el índice
            const iconColorClass = ICON_COLORS[index % ICON_COLORS.length];
            
            return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={disciplina.id_disciplina}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card 
                            sx={{
                                borderRadius: 3, // Bordes redondeados de Courts.jsx
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Sombra elegante de Courts.jsx
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                                    transform: 'translateY(-4px)', // Efecto hover
                                },
                            }}
                        >
                            <CardContent className="text-center p-6 flex flex-col items-center"> 
                                {/* Ícono de Deporte - Grande y con color dinámico */}
                                <Box className={`text-6xl mb-4 transform transition-transform duration-300 hover:scale-110 ${iconColorClass}`}> 
                                    {/* En lugar de usar el emoji solo, lo encerramos en un span con el color de texto para un toque de color */}
                                    <span className="text-6xl">{emoji}</span>
                                </Box>
                                
                                {/* Título de la Disciplina */}
                                <Typography 
                                    variant="h6" 
                                    className="font-sans"
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        color: COLOR_NEGRO_SUAVE, 
                                        lineHeight: 1.2, 
                                        mb: 1
                                    }}
                                >
                                    {disciplina.nombre}
                                </Typography>
                                
                                {/* Descripción de la Disciplina */}
                                {disciplina.descripcion && (
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        className="text-sm min-h-[40px] leading-relaxed"
                                        sx={{ color: '#666' }}
                                    >
                                        {disciplina.descripcion}
                                    </Typography>
                                )}

                            </CardContent>
                            
                            {/* Acciones de Editar y Eliminar (Estilo Courts.jsx CardActions) */}
                            <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0, borderTop: '1px solid #eee' }}>
                                <IconButton
                                    onClick={() => handleEdit(disciplina)}
                                    sx={{ color: COLOR_AZUL_ELECTRICO, '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` } }}
                                    title="Editar Disciplina"
                                >
                                    <Edit />
                                </IconButton>
                                {/*
                                <IconButton
                                    onClick={() => handleDelete(disciplina.id_disciplina)}
                                    sx={{ color: '#E53935', '&:hover': { backgroundColor: `#E5393510` } }}
                                    title="Eliminar Disciplina"
                                >
                                    <Delete />
                                </IconButton>*/}
                            </CardActions>
                        </Card>
                    </motion.div>
                </Grid>
            );
        })}
        {disciplinas.length === 0 && (
            <Box className="text-center w-full py-12">
              <Typography className="text-8xl text-gray-400 mb-2">🏆</Typography>
              <Typography variant="h6" className="text-gray-500">
                No hay disciplinas registradas
              </Typography>
              <Typography variant="body2" className="text-gray-400 mt-2">
                Crea tu primera disciplina para categorizar tus canchas
              </Typography>
            </Box>
        )}
      </Grid>

      {/* --- Diálogo (Modal) (Estilo Courts.jsx Dialog) --- */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl", // Misma clase que Courts.jsx
        }}
      >
        <DialogTitle 
            sx={{ 
                // Degradado de Azul a Naranja para el título del Modal
                background: `linear-gradient(to right, ${COLOR_AZUL_ELECTRICO}, ${COLOR_NARANJA_VIBRANTE})`, 
                color: COLOR_BLANCO, 
                fontWeight: 'bold' 
            }}
        >
          {editing ? "Editar Disciplina" : "Nueva Disciplina"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4 space-y-4">
            <TextField
              fullWidth
              label="Nombre *"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              multiline
              rows={3}
              margin="normal"
            />
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
                // Degradado de Azul a Naranja para el botón de acción
                background: `linear-gradient(to right, ${COLOR_AZUL_ELECTRICO}, ${COLOR_NARANJA_VIBRANTE})`,
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                '&:hover': {
                  background: `linear-gradient(to right, #0d8dc7, #e06320)`,
                },
              }}
            >
              {editing ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}