import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  CheckCircle,
  Cancel,
  Refresh,
  CameraAlt,
  VerifiedUser,
  Person,
  Email,
  CalendarToday,
  AccessTime,
  SportsSoccer,
  Error as ErrorIcon,
  Info,
  ContentCopy,
  Close,
  History,
  ConfirmationNumber,
  Event,
  Schedule,
  Sports,
  Warning
} from '@mui/icons-material';
import QRScannerComponent from '../components/control-acceso/QRScannerComponent';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { reservasApi } from '../api/reservas';

export default function ControlAcceso() {
  const { profile } = useAuth();
  const [scannedData, setScannedData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [showAdminInfo, setShowAdminInfo] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [reservaInfo, setReservaInfo] = useState(null);

  const scanDebounceRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Cargar historial
  useEffect(() => {
    const savedHistory = localStorage.getItem('verificationHistory');
    if (savedHistory) {
      try {
        setVerificationHistory(JSON.parse(savedHistory).slice(0, 10));
      } catch (e) {
        console.error('Error cargando historial:', e);
      }
    }
  }, []);

  // Guardar historial
  useEffect(() => {
    if (verificationHistory.length > 0) {
      localStorage.setItem('verificationHistory', JSON.stringify(verificationHistory.slice(0, 50)));
    }
  }, [verificationHistory]);

  // Parsear QR
  const parseQRData = useCallback((qrString) => {
    try {
      const [codigo_qr, token_verificacion] = qrString.split('|');
      if (!codigo_qr || !token_verificacion) {
        throw new Error('Formato de QR inválido');
      }
      return { codigo_qr, token_verificacion };
    } catch (error) {
      console.error('Error parsing QR:', error);
      return null;
    }
  }, []);

  // Manejar escaneo
  const handleScan = useCallback(async (scannedResult) => {
    if (!scannedResult || isProcessingRef.current) return;

    const now = Date.now();
    if (scanDebounceRef.current && now - scanDebounceRef.current < 2000) return;
    scanDebounceRef.current = now;

    const qrData = parseQRData(scannedResult);
    if (!qrData) {
      toast.error('❌ Formato de código QR inválido');
      return;
    }

    setIsScanning(false);
    isProcessingRef.current = true;
    setScannedData(qrData);

    await verificarQRBackend(qrData);
  }, [parseQRData]);

  // Verificar QR en backend
  const verificarQRBackend = useCallback(async (qrData) => {
    try {
      setLoading(true);
      setVerificationResult(null);
      setAdminInfo(null);
      setReservaInfo(null);

      console.log('🔍 Verificando QR:', qrData.codigo_qr);
      
      const result = await reservasApi.verificarQR(qrData.codigo_qr, qrData.token_verificacion);
      
      console.log('✅ Verificación exitosa:', result);

      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fecha: new Date().toLocaleString(),
        tipo: 'exitoso',
        asistente: result.asistente?.nombre || 'Desconocido',
        reserva: result.reserva?.codigo_reserva || '',
        mensaje: result.message
      };

      setVerificationResult({
        success: true,
        ...result
      });

      setVerificationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      
      toast.success(`✅ ${result.message || 'Acceso permitido'}`);

    } catch (error) {
      console.error('❌ Error en verificación:', error);
      
      let errorMessage = 'Error verificando el código QR';
      let isReservaPendiente = false;
      let detallesTecnicos = '';
      let reservaInfoDetalle = null;

      // ✅ MANEJO MEJORADO DE ERRORES CON INFORMACIÓN DE RESERVA
      if (error.response?.data?.detail) {
        const errorDetail = error.response.data.detail;
        
        // Si el error es un objeto con información estructurada
        if (typeof errorDetail === 'object') {
          errorMessage = errorDetail.message || errorMessage;
          reservaInfoDetalle = errorDetail.reserva_info || null;
          
          // Detectar si es reserva pendiente
          if (errorDetail.message?.toLowerCase().includes('pendiente') || 
              (reservaInfoDetalle && reservaInfoDetalle.estado_actual === 'pendiente')) {
            isReservaPendiente = true;
          }
        } else {
          // Si es un string simple
          errorMessage = errorDetail;
          if (errorDetail.toLowerCase().includes('pendiente')) {
            isReservaPendiente = true;
          }
        }
        
        detallesTecnicos = JSON.stringify(error.response.data.detail);
      }

      // ✅ GUARDAR INFORMACIÓN DE LA RESERVA
      if (reservaInfoDetalle) {
        setReservaInfo(reservaInfoDetalle);
      }

      // Crear item de historial
      const errorItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        fecha: new Date().toLocaleString(),
        tipo: 'error',
        asistente: isReservaPendiente ? 'Reserva Pendiente' : 'Error de Validación',
        error: errorMessage,
        isReservaPendiente,
        detallesTecnicos,
        reserva_info: reservaInfoDetalle,
        codigo_qr: qrData?.codigo_qr
      };

      setVerificationResult({
        success: false,
        error: errorMessage,
        isReservaPendiente,
        detallesTecnicos,
        reserva_info: reservaInfoDetalle
      });

      setVerificationHistory(prev => [errorItem, ...prev.slice(0, 9)]);

      // Guardar info para admin
      if (isReservaPendiente && qrData) {
        setAdminInfo({
          codigo_qr: qrData.codigo_qr,
          token_verificacion: qrData.token_verificacion,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          reserva_info: reservaInfoDetalle
        });
      }

      // ✅ TOAST MEJORADO CON ID DE RESERVA
      if (isReservaPendiente && reservaInfoDetalle) {
        toast.error(
          `❌ Reserva No Confirmada - ID: ${reservaInfoDetalle.id_reserva} - Código: ${reservaInfoDetalle.codigo_reserva}`, 
          {
            position: "top-center",
            autoClose: 10000,
          }
        );
      } else {
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000,
        });
      }

    } finally {
      setLoading(false);
      isProcessingRef.current = false;
      scanDebounceRef.current = null;
    }
  }, []);

  // Componente para información de reserva pendiente (MEJORADO)
  const ReservaPendienteInfo = () => {
    const info = verificationResult?.reserva_info || reservaInfo;
    
    if (!info) return null;

    return (
      <Card sx={{ 
        mt: 2, 
        border: '2px solid #ff9800',
        backgroundColor: '#fff8e1'
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#ff6f00', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#ff6f00' }} />
            Información de la Reserva Pendiente
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <ConfirmationNumber sx={{ color: '#ff9800' }} />
              </ListItemIcon>
              <ListItemText 
                primary="ID de Reserva" 
                secondary={
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {info.id_reserva || 'N/A'}
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <ConfirmationNumber sx={{ color: '#ff9800' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Código de Reserva" 
                secondary={
                  <Typography variant="body2" fontFamily="monospace">
                    {info.codigo_reserva || 'N/A'}
                  </Typography>
                }
              />
            </ListItem>
            
            {info.fecha && (
              <ListItem>
                <ListItemIcon>
                  <Event sx={{ color: '#ff9800' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Fecha" 
                  secondary={info.fecha || 'N/A'}
                />
              </ListItem>
            )}
            
            {info.horario && (
              <ListItem>
                <ListItemIcon>
                  <Schedule sx={{ color: '#ff9800' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Horario" 
                  secondary={info.horario || 'N/A'}
                />
              </ListItem>
            )}
            
            {info.cancha && (
              <ListItem>
                <ListItemIcon>
                  <Sports sx={{ color: '#ff9800' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Cancha" 
                  secondary={info.cancha || 'N/A'}
                />
              </ListItem>
            )}
            
            <ListItem>
              <ListItemIcon>
                <ErrorIcon sx={{ color: '#ff9800' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Estado Actual" 
                secondary={
                  <Chip 
                    label={info.estado_actual || 'pendiente'} 
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                }
              />
            </ListItem>
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Acción requerida:</strong> Esta reserva debe ser confirmada en el panel de administración antes de poder validar accesos.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setShowAdminInfo(true)}
              startIcon={<Info />}
              sx={{ flex: 1 }}
            >
              Más detalles
            </Button>
            
            {info.id_reserva && (
              <Tooltip title="Copiar ID de reserva">
                <IconButton 
                  onClick={() => copiarAlPortapapeles(info.id_reserva.toString())}
                  sx={{ border: '1px solid #ff9800', color: '#ff9800' }}
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Copiar al portapapeles
  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    toast.success(`📋 Copiado: ${texto}`);
  };

  // Iniciar escaneo
  const handleStartScan = () => {
    setScannedData(null);
    setVerificationResult(null);
    setAdminInfo(null);
    setReservaInfo(null);
    setIsScanning(true);
  };

  // Detener escaneo
  const handleStopScan = () => {
    setIsScanning(false);
  };

  // Reiniciar
  const handleReset = () => {
    handleStopScan();
    setScannedData(null);
    setVerificationResult(null);
    setAdminInfo(null);
    setReservaInfo(null);
    toast.info('🔄 Escáner reiniciado');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#1a237e',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <VerifiedUser sx={{ fontSize: 40, color: '#0f9fe1' }} />
          Control de Acceso
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Verifica la asistencia escaneando códigos QR
        </Typography>
        <Chip 
          label={`Operador: ${profile?.nombre || 'No identificado'}`} 
          color="primary" 
          sx={{ mt: 1 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Scanner */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScannerIcon sx={{ color: '#0f9fe1' }} />
              Escáner de Código QR
            </Typography>

            {isScanning ? (
              <>
                <QRScannerComponent 
                  onScan={handleScan}
                  onStop={handleStopScan}
                  isScanning={isScanning}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={handleStopScan}
                  sx={{ mt: 2 }}
                  startIcon={<Cancel />}
                >
                  Detener Escaneo
                </Button>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ 
                  width: 150, 
                  height: 150, 
                  mx: 'auto', 
                  mb: 3,
                  borderRadius: '50%',
                  backgroundColor: loading ? '#e3f2fd' : verificationResult?.success ? '#e8f5e9' : verificationResult?.success === false ? '#ffebee' : '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {loading ? (
                    <CircularProgress size={60} color="primary" />
                  ) : verificationResult?.success ? (
                    <CheckCircle sx={{ fontSize: 60, color: '#4caf50' }} />
                  ) : verificationResult?.success === false ? (
                    <ErrorIcon sx={{ fontSize: 60, color: '#f44336' }} />
                  ) : (
                    <CameraAlt sx={{ fontSize: 60, color: '#0f9fe1' }} />
                  )}
                </Box>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {loading 
                    ? 'Verificando código QR...' 
                    : verificationResult?.success
                    ? '✅ Escaneo completado exitosamente'
                    : verificationResult?.success === false
                    ? '❌ Error en la verificación'
                    : 'Presiona el botón para iniciar el escáner'
                  }
                </Typography>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleStartScan}
                  disabled={loading}
                  sx={{ mb: 1, py: 1.5 }}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ScannerIcon />}
                >
                  {loading ? 'Procesando...' : 'Iniciar Escáner QR'}
                </Button>
                
                {(verificationResult || scannedData) && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<Refresh />}
                  >
                    Nuevo Escaneo
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Resultados */}
        <Grid item xs={12} md={6}>
          {loading ? (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="primary">
                  Verificando código QR...
                </Typography>
                <LinearProgress sx={{ width: '100%', mt: 3 }} />
              </Box>
            </Paper>
          ) : verificationResult ? (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              {verificationResult.success ? (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 3,
                    py: 2,
                    borderRadius: 2,
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #4caf50'
                  }}>
                    <CheckCircle sx={{ fontSize: 50, color: '#4caf50', mr: 2 }} />
                    <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      ✅ Acceso Permitido
                    </Typography>
                  </Box>
                  
                  {/* Información exitosa */}
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person />
                        Información del Asistente
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Nombre:</strong> {verificationResult.asistente?.nombre || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            <strong>Email:</strong> {verificationResult.asistente?.email || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsSoccer />
                        Detalles de la Reserva
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            ID Reserva:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {verificationResult.reserva?.id_reserva || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Código:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {verificationResult.reserva?.codigo_reserva || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Cancha:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {verificationResult.reserva?.cancha || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Chip 
                            label={`Estado: ${verificationResult.reserva?.estado || 'N/A'}`}
                            color={verificationResult.reserva?.estado === 'confirmada' ? 'success' : 'primary'}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Alert 
                    severity={verificationResult.isReservaPendiente ? "warning" : "error"}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {verificationResult.isReservaPendiente ? '⚠️ Reserva No Confirmada' : '❌ Acceso Denegado'}
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.error}
                    </Typography>
                  </Alert>
                  
                  {verificationResult.isReservaPendiente && <ReservaPendienteInfo />}
                </>
              )}
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleReset}
                sx={{ mt: 3 }}
                startIcon={<Refresh />}
              >
                Escanear otro código
              </Button>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3, textAlign: 'center', py: 6 }}>
              <VerifiedUser sx={{ fontSize: 80, color: '#0f9fe1', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Esperando escaneo...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Escanea un código QR para verificar el acceso
              </Typography>
            </Paper>
          )}

          {/* Historial */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Historial Reciente
              </Typography>
              {verificationHistory.length > 0 && (
                <Button 
                  size="small" 
                  onClick={() => setVerificationHistory([])}
                >
                  Limpiar
                </Button>
              )}
            </Box>
            
            {verificationHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No hay verificaciones recientes
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {verificationHistory.map((item) => (
                  <Card 
                    key={item.id} 
                    sx={{ 
                      mb: 1, 
                      borderLeft: `4px solid ${item.tipo === 'exitoso' ? '#4caf50' : '#f44336'}`,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                    }}
                    onClick={() => {
                      if (item.reserva_info) {
                        setReservaInfo(item.reserva_info);
                      }
                    }}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <Typography variant="body2" noWrap>
                            {item.asistente}
                            {item.isReservaPendiente && item.reserva_info && (
                              <Tooltip title={`ID Reserva: ${item.reserva_info.id_reserva}`}>
                                <Chip 
                                  label={`ID: ${item.reserva_info.id_reserva}`}
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1 }}
                                />
                              </Tooltip>
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Chip 
                            label={item.tipo === 'exitoso' ? 'APROBADO' : 'RECHAZADO'} 
                            size="small"
                            color={item.tipo === 'exitoso' ? 'success' : 'error'}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Estadísticas */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📊 Estadísticas
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {verificationHistory.filter(h => h.tipo === 'exitoso').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accesos Permitidos
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="error">
                {verificationHistory.filter(h => h.tipo === 'error').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accesos Rechazados
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff9800' }}>
                {verificationHistory.filter(h => h.isReservaPendiente).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reservas Pendientes
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Diálogo de información técnica */}
      <Dialog open={showAdminInfo} onClose={() => setShowAdminInfo(false)} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Información Técnica para Administrador
          <IconButton onClick={() => setShowAdminInfo(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {adminInfo ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
                  📋 Información del Error
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mensaje de Error:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  {adminInfo.error}
                </Typography>
              </Grid>
              
              {adminInfo.reserva_info && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                      🏷️ Información de la Reserva:
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>ID Reserva:</strong> {adminInfo.reserva_info.id_reserva}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Código Reserva:</strong> {adminInfo.reserva_info.codigo_reserva}
                    </Typography>
                  </Grid>
                  
                  {adminInfo.reserva_info.fecha && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Fecha:</strong> {adminInfo.reserva_info.fecha}
                      </Typography>
                    </Grid>
                  )}
                  
                  {adminInfo.reserva_info.horario && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Horario:</strong> {adminInfo.reserva_info.horario}
                      </Typography>
                    </Grid>
                  )}
                  
                  {adminInfo.reserva_info.cancha && (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Cancha:</strong> {adminInfo.reserva_info.cancha}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
              
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>⚠️ Acción Requerida:</strong> La reserva ID <strong>{adminInfo.reserva_info?.id_reserva || 'N/A'}</strong> 
                    debe ser confirmada en el panel de administración.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay información disponible
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          {adminInfo?.reserva_info?.id_reserva && (
            <Button 
              onClick={() => copiarAlPortapapeles(adminInfo.reserva_info.id_reserva.toString())}
              startIcon={<ContentCopy />}
            >
              Copiar ID Reserva
            </Button>
          )}
          <Button onClick={() => setShowAdminInfo(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
