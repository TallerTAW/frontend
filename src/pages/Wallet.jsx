import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cuponesApi } from '../api/cupones';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
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
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  CardGiftcard, 
  CheckCircle, 
  Add,
  Edit,
  Delete,
  ContentCopy,
  LocalOffer
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Paleta de colores consistente
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

export default function Wallet() {
  const { profile } = useAuth();
  const [cupones, setCupones] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    monto_descuento: '',
    tipo: 'porcentaje',
    fecha_expiracion: '',
    id_usuario: '',
    estado: 'activo'
  });

  useEffect(() => {
    if (profile) {
      fetchCupones();
    }
  }, [profile]);

  const fetchCupones = async () => {
    try {
      setLoading(true);
      let data;
      if (profile.rol === 'admin') {
        data = await cuponesApi.getAll();
      } else {
        // Para usuarios normales, obtener sus cupones
        data = await cuponesApi.getByUsuario(profile.id);
      }
      setCupones(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        monto_descuento: parseFloat(formData.monto_descuento),
        id_usuario: formData.id_usuario ? parseInt(formData.id_usuario) : null,
        fecha_expiracion: formData.fecha_expiracion || null
      };

      if (editing) {
        await cuponesApi.update(editing.id_cupon, submitData);
        toast.success('Cupón actualizado correctamente');
      } else {
        await cuponesApi.create(submitData);
        toast.success('Cupón creado correctamente');
      }
      
      handleClose();
      fetchCupones();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.detail || 'Error al guardar cupón');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setFormData({
      codigo: '',
      monto_descuento: '',
      tipo: 'porcentaje',
      fecha_expiracion: '',
      id_usuario: '',
      estado: 'activo'
    });
  };

  const handleEdit = (cupon) => {
    setEditing(cupon);
    setFormData({
      codigo: cupon.codigo,
      monto_descuento: cupon.monto_descuento.toString(),
      tipo: cupon.tipo,
      fecha_expiracion: cupon.fecha_expiracion || '',
      id_usuario: cupon.id_usuario ? cupon.id_usuario.toString() : '',
      estado: cupon.estado
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
      try {
        await cuponesApi.desactivar(id);
        toast.success('Cupón eliminado correctamente');
        fetchCupones();
      } catch (error) {
        toast.error('Error al eliminar cupón');
      }
    }
  };

  const handleActivar = async (id) => {
    try {
      await cuponesApi.activar(id);
      toast.success('Cupón activado correctamente');
      fetchCupones();
    } catch (error) {
      toast.error('Error al activar cupón');
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado al portapapeles');
  };

  const generarCodigo = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CUP_';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, codigo: result });
  };

  // Estadísticas para usuarios normales
  const cuponesActivos = cupones.filter(c => c.estado === 'activo');
  const cuponesExpirados = cupones.filter(c => 
    c.fecha_expiracion && new Date(c.fecha_expiracion) < new Date()
  );
  const cuponesUtilizados = cupones.filter(c => c.estado === 'utilizado');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Cargando cupones...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO, mb: 2 }}>
          {profile?.rol === 'admin' ? 'Gestión de Cupones' : 'Mi Billetera'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {profile?.rol === 'admin' ? 'Administra todos los cupones del sistema' : 'Administra tus cupones y descuentos'}
        </Typography>
      </motion.div>

      {profile?.rol === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: COLOR_VERDE_LIMA,
              color: COLOR_NEGRO_SUAVE,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: COLOR_VERDE_LIMA,
                opacity: 0.9,
              },
            }}
          >
            Crear Cupón
          </Button>
        </motion.div>
      )}

      {/* Tarjeta de resumen para usuarios normales */}
      {profile?.rol !== 'admin' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card 
            sx={{ 
              borderRadius: 3, 
              mb: 4, 
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${COLOR_AZUL_ELECTRICO} 0%, ${COLOR_VERDE_LIMA} 100%)`,
              color: COLOR_BLANCO
            }}
          >
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <AccountBalanceWallet sx={{ fontSize: 50 }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Cupones Disponibles
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {cuponesActivos.length}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {cuponesActivos.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Activos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {cuponesUtilizados.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Usados
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {cuponesExpirados.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Expirados
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </motion.div>
      )}

      <Typography variant="h5" sx={{ fontWeight: 'bold', color: COLOR_AZUL_ELECTRICO, mb: 3 }}>
        {profile?.rol === 'admin' ? 'Todos los Cupones' : 'Mis Cupones'}
      </Typography>

      <Grid container spacing={3}>
        {cupones.map((cupon, index) => (
          <Grid item xs={12} sm={6} md={4} key={cupon.id_cupon}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  opacity: cupon.estado !== 'activo' ? 0.7 : 1,
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    transform: 'translateY(-4px)',
                  },
                  borderLeft: `4px solid ${
                    cupon.estado === 'utilizado' ? '#9e9e9e' : 
                    cupon.estado === 'activo' ? COLOR_VERDE_LIMA : COLOR_NARANJA_VIBRANTE
                  }`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CardGiftcard
                        sx={{
                          fontSize: 32,
                          color: cupon.estado === 'activo' ? COLOR_NARANJA_VIBRANTE : '#9e9e9e',
                        }}
                      />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLOR_NARANJA_VIBRANTE }}>
                          {cupon.tipo === 'porcentaje' ? `${cupon.monto_descuento}%` : `$${cupon.monto_descuento}`}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {cupon.codigo}
                          </Typography>
                          <Tooltip title="Copiar código">
                            <IconButton 
                              size="small" 
                              onClick={() => copiarCodigo(cupon.codigo)}
                              sx={{ p: 0.5 }}
                            >
                              <ContentCopy sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        icon={cupon.estado === 'utilizado' ? <CheckCircle /> : undefined}
                        label={cupon.estado}
                        color={
                          cupon.estado === 'activo' ? 'success' : 
                          cupon.estado === 'utilizado' ? 'default' : 'error'
                        }
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                      
                      {profile?.rol === 'admin' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(cupon)}
                            sx={{ color: COLOR_AZUL_ELECTRICO }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {cupon.estado === 'activo' ? (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(cupon.id_cupon)}
                              sx={{ color: COLOR_NARANJA_VIBRANTE }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          ) : (
                            <IconButton
                              size="small"
                              onClick={() => handleActivar(cupon.id_cupon)}
                              sx={{ color: COLOR_VERDE_LIMA }}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {cupon.fecha_expiracion && (
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Válido hasta: {new Date(cupon.fecha_expiracion).toLocaleDateString('es-ES')}
                      </Typography>
                      {new Date(cupon.fecha_expiracion) < new Date() && (
                        <Typography variant="caption" color="error">
                          Expirado
                        </Typography>
                      )}
                    </Box>
                  )}

                  {cupon.id_usuario && profile?.rol === 'admin' && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Usuario específico: {cupon.id_usuario}
                    </Typography>
                  )}

                  {cupon.estado === 'activo' && !cupon.id_reserva && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: 'success.light', 
                      borderRadius: 1,
                      background: `linear-gradient(45deg, ${COLOR_VERDE_LIMA}20, ${COLOR_AZUL_ELECTRICO}20)`
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {cupon.tipo === 'porcentaje' ? 
                          `Descuento del ${cupon.monto_descuento}% aplicable` : 
                          `Descuento de $${cupon.monto_descuento} aplicable`}
                      </Typography>
                    </Box>
                  )}

                  {cupon.id_reserva && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Utilizado en reserva #{cupon.id_reserva}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {cupones.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CardGiftcard sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay cupones disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {profile?.rol === 'admin' ? 
              'Crea tu primer cupón usando el botón "Crear Cupón"' : 
              'No tienes cupones asignados en este momento'}
          </Typography>
        </Box>
      )}

      {/* Dialog para crear/editar cupón (solo admin) */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
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
          {editing ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                margin="normal"
              />
              <Button 
                onClick={generarCodigo}
                variant="outlined"
                sx={{ mt: 2, minWidth: '100px' }}
              >
                Generar
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Monto Descuento"
              type="number"
              value={formData.monto_descuento}
              onChange={(e) => setFormData({ ...formData, monto_descuento: e.target.value })}
              required
              margin="normal"
              inputProps={{ 
                step: '0.01', 
                min: '0',
                max: formData.tipo === 'porcentaje' ? '100' : undefined
              }}
              helperText={formData.tipo === 'porcentaje' ? 'Máximo 100%' : ''}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
                label="Tipo"
              >
                <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
                <MenuItem value="fijo">Monto Fijo ($)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fecha Expiración"
              type="date"
              value={formData.fecha_expiracion}
              onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />

            <TextField
              fullWidth
              label="ID Usuario (opcional)"
              type="number"
              value={formData.id_usuario}
              onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
              margin="normal"
              helperText="Dejar vacío para cupón general"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                required
                label="Estado"
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: COLOR_NARANJA_VIBRANTE,
                color: COLOR_BLANCO,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#CC6A11',
                },
              }}
            >
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}