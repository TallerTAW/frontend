//responsive design
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { disciplinasApi } from "../api/disciplinas";
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
  useMediaQuery,
  useTheme,
  Fab
} from "@mui/material";
import { Add, Edit, Delete, Add as AddIcon, Menu as MenuIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

// === PALETA DE COLORES ===
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';
const COLOR_VERDE_LIMA = '#A2E831';

// Colores de íconos temáticos
const ICON_COLORS = [
  'text-blue-500',
  'text-red-500',
  'text-green-600',
  'text-yellow-600',
  'text-purple-500',
  'text-pink-500',
];

export default function Disciplinas() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

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

  // Función para obtener el ícono Emoji
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
    <Box sx={{ 
      mt: 0, 
      p: { xs: 1, sm: 2, md: 4 },
      minHeight: '100vh'
    }}>
      {/* --- Cabecera Responsive --- */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: { xs: 3, sm: 4 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ flex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
              sx={{
                fontWeight: 'bold',
                color: COLOR_AZUL_ELECTRICO,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              Gestión de Disciplinas
            </Typography>
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Administra los tipos de deporte que se ofrecen en tus canchas.
            </Typography>
          </motion.div>
        </Box>

        {/* Botón Responsive */}
        {isMobile ? (
          <Fab
            color="primary"
            onClick={() => setOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              backgroundColor: COLOR_NARANJA_VIBRANTE,
              '&:hover': {
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                opacity: 0.9,
              },
            }}
          >
            <AddIcon />
          </Fab>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
              size={isTablet ? "medium" : "large"}
              sx={{
                textTransform: 'none',
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                fontSize: { sm: '0.875rem', md: '1rem' },
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
        )}
      </Box>

      {/* --- Grilla de Disciplinas Responsive --- */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ 
        mt: 3, 
        justifyContent: 'center' // <-- AÑADIDO: Centra el grupo de tarjetas
    }}>
        {disciplinas.map((disciplina, index) => {
          const emoji = getSportIcon(disciplina.nombre);
          const iconColorClass = ICON_COLORS[index % ICON_COLORS.length];

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={disciplina.id_disciplina}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      transform: isMobile ? 'none' : 'translateY(-4px)',
                    },
                    minWidth: 300, 
                    maxWidth: 300, 
                    height: 330,
                  }}
                >
                  <CardContent sx={{
                    p: { xs: 2, sm: 3 },
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    {/* Ícono de Deporte Responsive */}
                    <Box sx={{
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                      mb: { xs: 2, sm: 3 },
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}>
                      <span style={{ fontSize: 'inherit' }}>{emoji}</span>
                    </Box>

                    {/* Título Responsive */}
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      sx={{
                        fontWeight: 'bold',
                        color: COLOR_NEGRO_SUAVE,
                        lineHeight: 1.2,
                        mb: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      {disciplina.nombre}
                    </Typography>

                    {/* Descripción Responsive */}
                    {disciplina.descripcion && (
                      <Typography
                        variant={isMobile ? "caption" : "body2"}
                        color="text.secondary"
                        sx={{
                          color: '#666',
                          lineHeight: 1.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {disciplina.descripcion}
                      </Typography>
                    )}
                  </CardContent>

                  {/* Acciones Responsive */}
                  <CardActions sx={{
                    justifyContent: 'flex-end',
                    p: { xs: 1.5, sm: 2 },
                    pt: 0,
                    borderTop: '1px solid #eee',
                    gap: { xs: 0.5, sm: 1 }
                  }}>
                    <IconButton
                      onClick={() => handleEdit(disciplina)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        color: COLOR_AZUL_ELECTRICO,
                        '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` }
                      }}
                      title="Editar Disciplina"
                    >
                      <Edit fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(disciplina.id_disciplina)}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        color: '#E53935',
                        '&:hover': { backgroundColor: `#E5393510` }
                      }}
                      title="Eliminar Disciplina"
                    >
                      <Delete fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
        {disciplinas.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{
              textAlign: 'center',
              py: { xs: 6, sm: 8, md: 12 },
              width: '100%'
            }}>
              <Typography sx={{
                fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                color: 'grey.400',
                mb: 2
              }}>
                🏆
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ color: 'grey.600', mb: 1 }}
              >
                No hay disciplinas registradas
              </Typography>
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{ color: 'grey.500' }}
              >
                Crea tu primera disciplina para categorizar tus canchas
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* --- Diálogo Responsive --- */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
            height: { xs: '100%', sm: 'auto' }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(to right, ${COLOR_AZUL_ELECTRICO}, ${COLOR_NARANJA_VIBRANTE})`,
            color: COLOR_BLANCO,
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            py: { xs: 2, sm: 3 }
          }}
        >
          {editing ? "Editar Disciplina" : "Nueva Disciplina"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{
            mt: { xs: 2, sm: 4 },
            p: { xs: 2, sm: 3 }
          }}>
            <TextField
              fullWidth
              label="Nombre *"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              required
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              multiline
              rows={isMobile ? 2 : 3}
              margin="normal"
              size={isMobile ? "small" : "medium"}
            />
          </DialogContent>
          <DialogActions sx={{
            p: { xs: 2, sm: 3 },
            borderTop: '1px solid #eee',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Button
              onClick={handleClose}
              sx={{
                color: 'text.secondary',
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 2, sm: 1 }
              }}
              size={isMobile ? "medium" : "large"}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              size={isMobile ? "medium" : "large"}
              sx={{
                textTransform: 'none',
                background: `linear-gradient(to right, ${COLOR_AZUL_ELECTRICO}, ${COLOR_NARANJA_VIBRANTE})`,
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 },
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