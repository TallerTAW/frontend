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
} from '@mui/material';
import { AccountBalanceWallet, CardGiftcard, CheckCircle, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Wallet() {
  const { profile } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    monto_descuento: '',
    tipo: 'porcentaje',
    fecha_expiracion: '',
    id_usuario: ''
  });

  useEffect(() => {
    if (profile) {
      fetchCoupons();
    }
  }, [profile]);

  const fetchCoupons = async () => {
    try {
      let data;
      if (profile.rol === 'admin') {
        data = await cuponesApi.getAll();
      } else {
        data = await cuponesApi.getByUsuario(profile.id);
      }
      setCoupons(data);
    } catch (error) {
      toast.error('Error al cargar cupones');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cuponesApi.create({
        ...formData,
        monto_descuento: parseFloat(formData.monto_descuento),
        id_usuario: formData.id_usuario || null
      });
      toast.success('Cupón creado correctamente');
      handleClose();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear cupón');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      codigo: '',
      monto_descuento: '',
      tipo: 'porcentaje',
      fecha_expiracion: '',
      id_usuario: ''
    });
  };

  const totalAvailable = coupons
    .filter(c => c.estado === 'activo' && (!c.fecha_expiracion || new Date(c.fecha_expiracion) > new Date()))
    .reduce((sum, c) => {
      if (c.tipo === 'porcentaje') {
        return sum + c.monto_descuento;
      }
      return sum + c.monto_descuento;
    }, 0);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CUP_';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, codigo: result });
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-2">
          {profile?.rol === 'admin' ? 'Gestión de Cupones' : 'Mi Billetera'}
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6 font-body">
          {profile?.rol === 'admin' ? 'Administra todos los cupones del sistema' : 'Administra tus cupones y descuentos'}
        </Typography>
      </motion.div>

      {profile?.rol === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-secondary to-accent text-white rounded-xl shadow-lg"
          >
            Crear Cupón
          </Button>
        </motion.div>
      )}

      {profile?.rol !== 'admin' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-3xl shadow-2xl mb-8 overflow-hidden">
            <Box
              className="p-8 text-white relative"
              sx={{
                background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 50%, #fbab22 100%)',
              }}
            >
              <Box className="flex items-center gap-3 mb-6">
                <AccountBalanceWallet sx={{ fontSize: 50 }} />
                <Box>
                  <Typography variant="h6" className="font-title opacity-90">
                    Cupones Disponibles
                  </Typography>
                  <Typography variant="h3" className="font-title">
                    {coupons.filter(c => c.estado === 'activo').length}
                  </Typography>
                </Box>
              </Box>
              <Box className="flex justify-between items-center">
                <Typography variant="body2" className="font-body">
                  {coupons.filter(c => c.estado === 'activo').length} cupones activos
                </Typography>
                <Typography variant="body2" className="font-body">
                  {profile?.nombre}
                </Typography>
              </Box>
            </Box>
          </Card>
        </motion.div>
      )}

      <Typography variant="h5" className="font-title text-primary mb-4">
        {profile?.rol === 'admin' ? 'Todos los Cupones' : 'Mis Cupones'}
      </Typography>

      <Grid container spacing={3}>
        {coupons.map((coupon, index) => (
          <Grid item xs={12} sm={6} md={4} key={coupon.id_cupon}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`rounded-2xl shadow-lg transition-all duration-300 ${
                  coupon.estado !== 'activo' ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-2'
                }`}
                sx={{
                  borderLeft: `6px solid ${
                    coupon.estado === 'utilizado' ? '#9e9e9e' : 
                    coupon.estado === 'activo' ? '#9eca3f' : '#f44336'
                  }`,
                }}
              >
                <CardContent className="p-6">
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex items-center gap-2">
                      <CardGiftcard
                        sx={{
                          fontSize: 40,
                          color: coupon.estado === 'activo' ? '#fbab22' : '#9e9e9e',
                        }}
                      />
                      <Box>
                        <Typography variant="h4" className="font-title text-accent">
                          {coupon.tipo === 'porcentaje' ? `${coupon.monto_descuento}%` : `$${coupon.monto_descuento}`}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {coupon.codigo}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={coupon.estado === 'utilizado' ? <CheckCircle /> : undefined}
                      label={coupon.estado}
                      color={
                        coupon.estado === 'activo' ? 'success' : 
                        coupon.estado === 'utilizado' ? 'default' : 'error'
                      }
                      size="small"
                      className="font-bold"
                    />
                  </Box>

                  {coupon.fecha_expiracion && (
                    <Box className="bg-gray-50 p-3 rounded-xl mb-3">
                      <Typography variant="body2" className="font-body text-gray-700">
                        Válido hasta: {new Date(coupon.fecha_expiracion).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="caption" className="text-gray-500 block">
                    Creado: {new Date(coupon.fecha_creacion).toLocaleDateString('es-ES')}
                  </Typography>

                  {coupon.estado === 'activo' && !coupon.id_reserva && (
                    <Box className="mt-4 p-3 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl">
                      <Typography variant="caption" className="font-body text-gray-700">
                        {coupon.tipo === 'porcentaje' ? 
                          `Descuento del ${coupon.monto_descuento}% aplicable` : 
                          `Descuento de $${coupon.monto_descuento} aplicable`}
                      </Typography>
                    </Box>
                  )}

                  {coupon.id_reserva && (
                    <Box className="mt-4 p-3 bg-gray-100 rounded-xl">
                      <Typography variant="caption" className="font-body text-gray-700">
                        Utilizado en reserva #{coupon.id_reserva}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {coupons.length === 0 && (
        <Box className="text-center py-12">
          <CardGiftcard sx={{ fontSize: 100, color: '#0f9fe1', opacity: 0.3 }} />
          <Typography variant="h6" className="text-gray-500 mt-4 font-body">
            No hay cupones disponibles
          </Typography>
        </Box>
      )}

      {/* Dialog para crear cupón (solo admin) */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'rounded-2xl',
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-secondary to-accent text-white font-title">
          Crear Nuevo Cupón
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent className="mt-4">
            <Box className="flex gap-2 mb-4">
              <TextField
                fullWidth
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                margin="normal"
              />
              <Button 
                onClick={generateCode}
                variant="outlined"
                className="mt-4"
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
              inputProps={{ step: '0.01', min: '0' }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
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
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={handleClose} className="text-gray-600">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(to right, #9eca3f, #fbab22)',
                '&:hover': {
                  background: 'linear-gradient(to right, #8ab637, #e09a1e)',
                },
              }}
            >
              Crear Cupón
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}