import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getSports,
  createSport,
  updateSport,
  deleteSport,
} from "../api/sportsApi";

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

export default function Sports() {
  const [sports, setSports] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "⚽",
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const data = await getSports();
      setSports(data);
    } catch (error) {
      toast.error("Error al cargar deportes");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSport(editing.id, formData);
        toast.success("Deporte actualizado correctamente");
      } else {
        await createSport(formData);
        toast.success("Deporte creado correctamente");
      }
      setOpen(false);
      setEditing(null);
      setFormData({ name: "", icon: "⚽" });
      fetchSports();
    } catch (error) {
      toast.error("Error al guardar el deporte");
    }
  };

  const handleEdit = (sport) => {
    setEditing(sport);
    setFormData(sport);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este deporte?")) {
      try {
        await deleteSport(id);
        toast.success("Deporte eliminado correctamente");
        fetchSports();
      } catch (error) {
        toast.error("Error al eliminar el deporte");
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({ name: "", icon: "⚽" });
  };

  const sportIcons = ["⚽", "🏀", "🎾", "🏐", "🏈", "⚾", "🏒", "🏓", "🥊", "🎱"];

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" className="font-title text-primary">
            Deportes
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
            Nuevo Deporte
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        {sports.map((sport, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={sport.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-secondary/10 to-accent/10">
                <CardContent className="text-center py-8">
                  <Box className="text-7xl mb-4">{sport.icon}</Box>
                  <Typography variant="h5" className="font-title text-gray-800">
                    {sport.name}
                  </Typography>
                </CardContent>
                <CardActions className="justify-center pb-4">
                  <IconButton
                    onClick={() => handleEdit(sport)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(sport.id)}
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
          {editing ? "Editar Deporte" : "Nuevo Deporte"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4">
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              margin="normal"
            />
            <Box className="mt-4">
              <Typography
                variant="body2"
                className="mb-2 font-body text-gray-600"
              >
                Selecciona un ícono:
              </Typography>
              <Grid container spacing={1}>
                {sportIcons.map((icon) => (
                  <Grid item key={icon}>
                    <Button
                      variant={formData.icon === icon ? "contained" : "outlined"}
                      onClick={() => setFormData({ ...formData, icon })}
                      className="text-4xl min-w-0 w-16 h-16"
                      sx={{
                        borderColor:
                          formData.icon === icon ? "#9eca3f" : "#ddd",
                        backgroundColor:
                          formData.icon === icon ? "#9eca3f" : "transparent",
                        "&:hover": {
                          backgroundColor:
                            formData.icon === icon ? "#8ab637" : "#f5f5f5",
                        },
                      }}
                    >
                      {icon}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
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
