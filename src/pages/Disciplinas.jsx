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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activo"
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
      if (editing) {
        await disciplinasApi.update(editing.id_disciplina, formData);
        toast.success("Disciplina actualizada correctamente");
      } else {
        await disciplinasApi.create(formData);
        toast.success("Disciplina creada correctamente");
      }
      setOpen(false);
      setEditing(null);
      setFormData({ nombre: "", descripcion: "", estado: "activo" });
      fetchDisciplinas();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al guardar la disciplina");
    }
  };

  const handleEdit = (disciplina) => {
    setEditing(disciplina);
    setFormData(disciplina);
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
    setFormData({ nombre: "", descripcion: "", estado: "activo" });
  };

  const getSportIcon = (nombre) => {
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
    return icons[nombre] || '🏆';
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
            Disciplinas Deportivas
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
            className="bg-gradient-to-r from-secondary to-accent text-white rounded-xl shadow-lg"
            sx={{
              textTransform: "none",
              background: "linear-gradient(to right, #9eca3f, #fbab22)",
              "&:hover": {
                background: "linear-gradient(to right, #8ab637, #e09a1e)",
              },
            }}
          >
            Nueva Disciplina
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {disciplinas.map((disciplina, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={disciplina.id_disciplina}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-secondary/10 to-accent/10 ${
                disciplina.estado === 'inactivo' ? 'opacity-60' : ''
              }`}>
                <CardContent className="text-center py-8">
                  <Box className="text-7xl mb-4">
                    {getSportIcon(disciplina.nombre)}
                  </Box>
                  <Typography variant="h5" className="font-title text-gray-800">
                    {disciplina.nombre}
                  </Typography>
                  {disciplina.descripcion && (
                    <Typography variant="body2" className="text-gray-600 mt-2 font-body">
                      {disciplina.descripcion}
                    </Typography>
                  )}
                  <Box className="mt-2">
                    <Typography 
                      variant="caption" 
                      className={`font-bold ${
                        disciplina.estado === 'activo' ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {disciplina.estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions className="justify-center pb-4">
                  <IconButton
                    onClick={() => handleEdit(disciplina)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(disciplina.id_disciplina)}
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
          className: "rounded-2xl",
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-secondary to-accent text-white font-title">
          {editing ? "Editar Disciplina" : "Nueva Disciplina"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4">
            <TextField
              fullWidth
              label="Nombre"
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
          <DialogActions className="p-4">
            <Button onClick={handleClose} className="text-gray-600">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-gradient-to-r from-secondary to-accent"
              sx={{
                textTransform: "none",
                background: "linear-gradient(to right, #9eca3f, #fbab22)",
                "&:hover": {
                  background: "linear-gradient(to right, #8ab637, #e09a1e)",
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