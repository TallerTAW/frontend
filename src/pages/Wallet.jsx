import { useEffect, useState, useRef } from 'react';
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
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Fab,
  Stack,
  CircularProgress,
  Paper
} from '@mui/material';
import { 
  AccountBalanceWallet,
  CardGiftcard,
  CheckCircle,
  Add,
  Edit,
  Delete,
  ContentCopy,
  LocalOffer,
  Percent,
  AttachMoney,
  CalendarToday,
  Person,
  Refresh,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  QrCode
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Paleta de colores consistente
const COLOR_AZUL_ELECTRICO = '#00BFFF';
const COLOR_VERDE_LIMA = '#A2E831';
const COLOR_NARANJA_VIBRANTE = '#FD7E14';
const COLOR_ROSA = '#FF4081';
const COLOR_BLANCO = '#FFFFFF';
const COLOR_NEGRO_SUAVE = '#212121';

export default function Wallet() {
  const { profile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [cupones, setCupones] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Para navegación manual en móvil
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
        data = await cuponesApi.getByUsuario(profile.id);
      }
      setCupones(data || []);
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

  // Navegación manual para móvil
  const nextCoupon = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === cupones.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevCoupon = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? cupones.length - 1 : prevIndex - 1
    );
  };

  // Estadísticas
  const cuponesActivos = cupones.filter(c => c.estado === 'activo');
  const cuponesExpirados = cupones.filter(c => 
    c.fecha_expiracion && new Date(c.fecha_expiracion) < new Date()
  );
  const cuponesUtilizados = cupones.filter(c => c.estado === 'utilizado');
  const cuponesGenerales = cupones.filter(c => !c.id_usuario);
  const cuponesEspecificos = cupones.filter(c => c.id_usuario);

  // Función para obtener color según tipo
  const getTipoColor = (tipo) => {
    return tipo === 'porcentaje' ? COLOR_ROSA : COLOR_VERDE_LIMA;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress sx={{ color: COLOR_AZUL_ELECTRICO }} />
        <Typography color="text.secondary">Cargando cupones...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Responsive */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            mb: 2
          }}>
            <Box>
              <Typography
                variant={isMobile ? "h5" : isTablet ? "h4" : "h4"}
                sx={{
                  fontWeight: 'bold',
                  color: COLOR_AZUL_ELECTRICO,
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {profile?.rol === 'admin' ? 'Gestión de Cupones' : 'Mi Billetera'}
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {profile?.rol === 'admin' ? 'Administra todos los cupones del sistema' : 'Administra tus cupones y descuentos'}
              </Typography>
            </Box>
            
            {profile?.rol === 'admin' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpen(true)}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    backgroundColor: COLOR_VERDE_LIMA,
                    color: COLOR_NEGRO_SUAVE,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: COLOR_VERDE_LIMA,
                      opacity: 0.9,
                    },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    px: { xs: 2, sm: 3 }
                  }}
                >
                  Crear Cupón
                </Button>
              </motion.div>
            )}
          </Box>
        </motion.div>
      </Box>

      {/* Tarjeta de resumen para usuarios normales */}
      {profile?.rol !== 'admin' && cupones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 4 }}
        >
          <Card 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${COLOR_AZUL_ELECTRICO} 0%, ${COLOR_VERDE_LIMA} 100%)`,
              color: COLOR_BLANCO,
              boxShadow: '0 8px 32px rgba(0, 191, 255, 0.2)'
            }}
          >
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  p: 2, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AccountBalanceWallet sx={{ fontSize: { xs: 32, sm: 40 } }} />
                </Box>
                <Box>
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    sx={{ opacity: 0.9, mb: 0.5 }}
                  >
                    Cupones Disponibles
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h3" : "h2"} 
                    sx={{ fontWeight: 'bold', lineHeight: 1 }}
                  >
                    {cuponesActivos.length}
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ fontWeight: 'bold', lineHeight: 1, mb: 0.5 }}
                    >
                      {cuponesActivos.length}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ opacity: 0.9 }}
                    >
                      Activos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ fontWeight: 'bold', lineHeight: 1, mb: 0.5 }}
                    >
                      {cuponesUtilizados.length}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ opacity: 0.9 }}
                    >
                      Usados
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ fontWeight: 'bold', lineHeight: 1, mb: 0.5 }}
                    >
                      {cuponesExpirados.length}
                    </Typography>
                    <Typography 
                      variant={isMobile ? "caption" : "body2"} 
                      sx={{ opacity: 0.9 }}
                    >
                      Expirados
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </motion.div>
      )}

      {/* Estadísticas para Admin */}
      {profile?.rol === 'admin' && cupones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ mb: 4 }}
        >
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
            {[
              { label: 'Total', value: cupones.length, color: COLOR_AZUL_ELECTRICO, icon: <CardGiftcard /> },
              { label: 'Activos', value: cuponesActivos.length, color: COLOR_VERDE_LIMA, icon: <CheckCircle /> },
              { label: 'Generales', value: cuponesGenerales.length, color: COLOR_NARANJA_VIBRANTE, icon: <LocalOffer /> },
              { label: 'Específicos', value: cuponesEspecificos.length, color: COLOR_ROSA, icon: <Person /> },
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: { xs: 1.5, sm: 2 },
                  backgroundColor: `${stat.color}15`,
                  border: `2px solid ${stat.color}`,
                  borderRadius: 2,
                  height: '100%'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 1 
                  }}>
                    <Box sx={{ 
                      backgroundColor: stat.color, 
                      color: COLOR_BLANCO, 
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: stat.color,
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 'medium',
                      color: 'text.secondary',
                      fontSize: { xs: '0.7rem', sm: '0.875rem' }
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Título de la sección de cupones con espacio adecuado */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        mt: profile?.rol === 'admin' ? 0 : 4
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          sx={{ 
            fontWeight: 'bold', 
            color: COLOR_AZUL_ELECTRICO,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          {profile?.rol === 'admin' ? 'Todos los Cupones' : 'Mis Cupones'}
        </Typography>
        
        {profile?.rol === 'admin' && cupones.length > 0 && (
          <Button
            startIcon={<Refresh />}
            onClick={fetchCupones}
            size="small"
            sx={{ 
              color: COLOR_AZUL_ELECTRICO,
              '&:hover': {
                backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
              }
            }}
          >
            Actualizar
          </Button>
        )}
      </Box>

      {/* Cupones - Navegación manual en móvil, Grid en tablet/desktop */}
      {cupones.length > 0 ? (
        <>
          {isMobile ? (
            // Vista móvil con navegación manual
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ position: 'relative', mb: 4 }}>
                {/* Indicador de posición */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  gap: 1
                }}>
                  {cupones.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: index === currentIndex ? 
                          COLOR_AZUL_ELECTRICO : 'rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s'
                      }}
                    />
                  ))}
                </Box>

                {/* Cupón actual */}
                <CouponCard 
                  cupon={cupones[currentIndex]} 
                  profile={profile}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onActivate={handleActivar}
                  onCopy={copiarCodigo}
                  isMobile={isMobile}
                />

                {/* Controles de navegación */}
                {cupones.length > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 3 
                  }}>
                    <Button
                      startIcon={<KeyboardArrowLeft />}
                      onClick={prevCoupon}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: COLOR_AZUL_ELECTRICO,
                        color: COLOR_AZUL_ELECTRICO,
                        '&:hover': {
                          borderColor: COLOR_AZUL_ELECTRICO,
                          backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                        }
                      }}
                    >
                      Anterior
                    </Button>
                    
                    <Typography variant="body2" color="text.secondary">
                      {currentIndex + 1} / {cupones.length}
                    </Typography>
                    
                    <Button
                      endIcon={<KeyboardArrowRight />}
                      onClick={nextCoupon}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: COLOR_AZUL_ELECTRICO,
                        color: COLOR_AZUL_ELECTRICO,
                        '&:hover': {
                          borderColor: COLOR_AZUL_ELECTRICO,
                          backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                        }
                      }}
                    >
                      Siguiente
                    </Button>
                  </Box>
                )}
              </Box>
            </motion.div>
          ) : (
            // Grid para tablet y desktop
            <Grid container spacing={3}>
              {cupones.map((cupon, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cupon.id_cupon}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CouponCard 
                      cupon={cupon} 
                      profile={profile}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onActivate={handleActivar}
                      onCopy={copiarCodigo}
                      isMobile={isMobile}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        // Estado vacío
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, sm: 8, md: 10 },
            backgroundColor: `${COLOR_AZUL_ELECTRICO}05`,
            borderRadius: 3
          }}>
            <CardGiftcard sx={{ 
              fontSize: { xs: 60, sm: 80, md: 100 }, 
              color: 'grey.400', 
              mb: 2 
            }} />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              No hay cupones disponibles
            </Typography>
            <Typography 
              variant={isMobile ? "body2" : "body1"} 
              color="text.secondary"
              sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}
            >
              {profile?.rol === 'admin' ? 
                'Crea tu primer cupón usando el botón "Crear Cupón"' : 
                'No tienes cupones asignados en este momento'
              }
            </Typography>
            
            {profile?.rol === 'admin' && (
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
                Crear Primer Cupón
              </Button>
            )}
          </Box>
        </motion.div>
      )}

      {/* FAB para crear cupón en móvil (solo admin) */}
      {profile?.rol === 'admin' && isMobile && (
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: COLOR_VERDE_LIMA,
            color: COLOR_NEGRO_SUAVE,
            '&:hover': {
              backgroundColor: COLOR_VERDE_LIMA,
              opacity: 0.9,
            },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Dialog para crear/editar cupón */}
      <CouponDialog 
        open={open}
        editing={editing}
        formData={formData}
        setFormData={setFormData}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        generarCodigo={generarCodigo}
        isMobile={isMobile}
      />
    </Box>
  );
}

// Componente de Tarjeta de Cupón Reutilizable
function CouponCard({ cupon, profile, onEdit, onDelete, onActivate, onCopy, isMobile }) {
  const isExpirado = cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < new Date();
  const isActivo = cupon.estado === 'activo' && !isExpirado;
  const tipoColor = cupon.tipo === 'porcentaje' ? COLOR_ROSA : COLOR_VERDE_LIMA;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        opacity: !isActivo ? 0.7 : 1,
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          transform: isMobile ? 'none' : 'translateY(-4px)',
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isActivo ? 
          `linear-gradient(135deg, ${tipoColor}15 0%, ${COLOR_AZUL_ELECTRICO}15 100%)` : 
          'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        border: `2px solid ${isActivo ? tipoColor : '#bdbdbd'}`,
        position: 'relative',
        borderLeft: `4px solid ${
          cupon.estado === 'utilizado' ? '#9e9e9e' : 
          cupon.estado === 'activo' ? COLOR_VERDE_LIMA : 
          COLOR_NARANJA_VIBRANTE
        }`,
      }}
    >
      {/* Ribbon de estado */}
      <Box sx={{
        position: 'absolute',
        top: 16,
        right: -8,
        backgroundColor: isActivo ? COLOR_VERDE_LIMA : 
                       cupon.estado === 'utilizado' ? '#757575' : COLOR_NARANJA_VIBRANTE,
        color: COLOR_BLANCO,
        padding: '4px 16px',
        borderRadius: '4px 0 0 4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transform: 'rotate(0deg)',
        zIndex: 1
      }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
          {isExpirado ? 'EXPIRO' : cupon.estado.toUpperCase()}
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        {/* Encabezado del cupón */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box sx={{
              backgroundColor: isActivo ? tipoColor : '#bdbdbd',
              color: COLOR_BLANCO,
              p: 1.5,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cupon.tipo === 'porcentaje' ? 
                <Percent sx={{ fontSize: 24 }} /> : 
                <AttachMoney sx={{ fontSize: 24 }} />
              }
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                sx={{ 
                  fontWeight: 'bold', 
                  color: isActivo ? tipoColor : '#757575',
                  lineHeight: 1
                }}
              >
                {cupon.tipo === 'porcentaje' ? 
                  `${cupon.monto_descuento}%` : 
                  `$${parseFloat(cupon.monto_descuento).toFixed(2)}`
                }
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  mt: 0.5
                }}
              >
                DESCUENTO {cupon.tipo === 'porcentaje' ? 'EN PORCENTAJE' : 'FIJO'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Código del cupón */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          backgroundColor: 'rgba(0,0,0,0.03)', 
          borderRadius: 2,
          border: '1px dashed rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontFamily: 'monospace', 
                fontWeight: 'bold',
                color: isActivo ? COLOR_NEGRO_SUAVE : '#757575'
              }}
            >
              {cupon.codigo}
            </Typography>
            <Tooltip title="Copiar código">
              <IconButton 
                size="small" 
                onClick={() => onCopy(cupon.codigo)}
                sx={{ 
                  color: isActivo ? COLOR_AZUL_ELECTRICO : '#757575',
                  '&:hover': {
                    backgroundColor: `${isActivo ? COLOR_AZUL_ELECTRICO : '#757575'}10`
                  }
                }}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Información adicional */}
        <Stack spacing={1.5}>
          {cupon.fecha_expiracion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Válido hasta: {new Date(cupon.fecha_expiracion).toLocaleDateString('es-ES')}
              </Typography>
              {isExpirado && (
                <Chip 
                  label="Expirado" 
                  size="small" 
                  sx={{ 
                    ml: 1,
                    backgroundColor: COLOR_NARANJA_VIBRANTE,
                    color: COLOR_BLANCO,
                    fontSize: '0.6rem'
                  }}
                />
              )}
            </Box>
          )}

          {cupon.id_usuario && profile?.rol === 'admin' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 16, color: COLOR_ROSA }} />
              <Typography variant="body2" color="text.secondary">
                Usuario específico: #{cupon.id_usuario}
              </Typography>
            </Box>
          )}

          {cupon.id_reserva && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
              <Typography variant="body2" color="text.secondary">
                Usado en reserva #{cupon.id_reserva}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Acciones (solo para admin) */}
        {profile?.rol === 'admin' && (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mt: 3,
            pt: 2,
            borderTop: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Tooltip title="Editar cupón">
              <IconButton
                size="small"
                onClick={() => onEdit(cupon)}
                sx={{ 
                  color: COLOR_AZUL_ELECTRICO,
                  '&:hover': { backgroundColor: `${COLOR_AZUL_ELECTRICO}10` }
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            
            {cupon.estado === 'activo' ? (
              <Tooltip title="Desactivar cupón">
                <IconButton
                  size="small"
                  onClick={() => onDelete(cupon.id_cupon)}
                  sx={{ 
                    color: COLOR_NARANJA_VIBRANTE,
                    '&:hover': { backgroundColor: `${COLOR_NARANJA_VIBRANTE}10` }
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activar cupón">
                <IconButton
                  size="small"
                  onClick={() => onActivate(cupon.id_cupon)}
                  sx={{ 
                    color: COLOR_VERDE_LIMA,
                    '&:hover': { backgroundColor: `${COLOR_VERDE_LIMA}10` }
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Diálogo Reutilizable
function CouponDialog({ open, editing, formData, setFormData, handleClose, handleSubmit, generarCodigo, isMobile }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          m: { xs: 0, sm: 2 }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: `linear-gradient(135deg, ${COLOR_AZUL_ELECTRICO} 0%, ${COLOR_VERDE_LIMA} 100%)`, 
          color: COLOR_BLANCO, 
          fontWeight: 'bold',
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          py: { xs: 2, sm: 3 }
        }}
      >
        {editing ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: { xs: 2, sm: 3 } }}>
          {/* Código */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            mb: 2,
            alignItems: { xs: 'stretch', sm: 'flex-end' }
          }}>
            <TextField
              fullWidth
              label="Código"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              required
              margin="normal"
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: <QrCode sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button 
              onClick={generarCodigo}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                mt: { xs: 0, sm: 2 },
                minWidth: { xs: '100%', sm: '120px' },
                borderColor: COLOR_AZUL_ELECTRICO,
                color: COLOR_AZUL_ELECTRICO,
                '&:hover': {
                  borderColor: COLOR_AZUL_ELECTRICO,
                  backgroundColor: `${COLOR_AZUL_ELECTRICO}10`
                }
              }}
            >
              Generar
            </Button>
          </Box>
          
          {/* Monto y Tipo */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 2 
          }}>
            <TextField
              fullWidth
              label="Monto Descuento"
              type="number"
              value={formData.monto_descuento}
              onChange={(e) => setFormData({ ...formData, monto_descuento: e.target.value })}
              required
              margin="normal"
              size={isMobile ? "small" : "medium"}
              inputProps={{ 
                step: '0.01', 
                min: '0',
                max: formData.tipo === 'porcentaje' ? '100' : undefined
              }}
              helperText={formData.tipo === 'porcentaje' ? 'Máximo 100%' : ''}
            />
            
            <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
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
          </Box>

          {/* Fecha de expiración */}
          <TextField
            fullWidth
            label="Fecha Expiración"
            type="date"
            value={formData.fecha_expiracion}
            onChange={(e) => setFormData({ ...formData, fecha_expiracion: e.target.value })}
            InputLabelProps={{ shrink: true }}
            margin="normal"
            size={isMobile ? "small" : "medium"}
            helperText="Dejar vacío para cupón sin expiración"
          />

          {/* ID Usuario */}
          <TextField
            fullWidth
            label="ID Usuario (opcional)"
            type="number"
            value={formData.id_usuario}
            onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
            margin="normal"
            size={isMobile ? "small" : "medium"}
            helperText="Dejar vacío para cupón general"
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          {/* Estado */}
          <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
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
        
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
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
              backgroundColor: COLOR_NARANJA_VIBRANTE,
              color: COLOR_BLANCO,
              fontWeight: 'bold',
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 1, sm: 2 },
              '&:hover': {
                backgroundColor: '#CC6A11',
              },
            }}
          >
            {editing ? 'Actualizar' : 'Crear Cupón'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}