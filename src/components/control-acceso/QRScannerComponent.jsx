import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Button,
  Paper,
  IconButton
} from '@mui/material';
import {
  Cancel,
  QrCodeScanner,
  Refresh
} from '@mui/icons-material';

const QRScannerComponent = ({ onScan, onStop, isScanning }) => {
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  // Detectar si es móvil
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Solicitar permisos
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: isMobile() ? 'environment' : 'user' } 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      setError('Permiso de cámara denegado');
      return false;
    }
  };

  // Iniciar scanner
  const startScanner = useCallback(async () => {
    try {
      setError('');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      };

      const cameraConfig = isMobile() ? { facingMode: "environment" } : { facingMode: "user" };

      await html5QrCode.start(
        cameraConfig,
        config,
        (decodedText) => {
          if (isScanningRef.current) {
            console.log('✅ QR detectado:', decodedText);
            onScan(decodedText);
            // No detener automáticamente, permitir múltiples escaneos
          }
        },
        (errorMessage) => {
          // Ignorar errores normales de "no se encontró código"
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            console.log('⚠️ Error de escaneo:', errorMessage);
          }
        }
      );

      isScanningRef.current = true;
      setIsInitialized(true);
      
    } catch (err) {
      console.error('Error iniciando scanner:', err);
      setError(err.message || 'Error al iniciar la cámara');
    }
  }, [onScan]);

  // Detener scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
        isScanningRef.current = false;
        setIsInitialized(false);
        if (onStop) onStop();
      } catch (err) {
        console.error('Error deteniendo scanner:', err);
      }
    }
  }, [onStop]);

  // Efecto para controlar estado del scanner
  useEffect(() => {
    if (isScanning && !isInitialized) {
      startScanner();
    } else if (!isScanning && isInitialized) {
      stopScanner();
    }

    return () => {
      if (isInitialized) {
        stopScanner();
      }
    };
  }, [isScanning, isInitialized, startScanner, stopScanner]);

  // Timeout automático después de 60 segundos
  useEffect(() => {
    let timeoutId;
    
    if (isScanning) {
      timeoutId = setTimeout(() => {
        if (isScanningRef.current) {
          console.log('⏰ Scanner detenido por timeout');
          stopScanner();
        }
      }, 60000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isScanning, stopScanner]);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Contenedor del scanner */}
      <Box
        id="qr-reader"
        sx={{
          width: '100%',
          height: 300,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#000',
          position: 'relative',
          border: '2px solid #0f9fe1'
        }}
      >
        {/* Overlay de escaneo */}
        {isScanning && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 250,
                height: 250,
                border: '2px solid #0f9fe1',
                borderRadius: 1,
                zIndex: 2,
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Línea animada */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: '#0f9fe1',
                  animation: 'scanLine 2s linear infinite',
                  '@keyframes scanLine': {
                    '0%': { top: 0 },
                    '50%': { top: '100%' },
                    '100%': { top: 0 }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
              <Typography variant="body2" sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.7)', px: 2, py: 1, borderRadius: 2, display: 'inline-block' }}>
                <QrCodeScanner sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Escaneando...
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Controles */}
      {isScanning && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={stopScanner}
            startIcon={<Cancel />}
            size="small"
          >
            Detener
          </Button>
          
          <Button
            variant="outlined"
            onClick={startScanner}
            startIcon={<Refresh />}
            size="small"
          >
            Reiniciar
          </Button>
        </Box>
      )}

      {/* Estados */}
      {!isScanning && error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={startScanner}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Indicador de dispositivo */}
      <Paper elevation={1} sx={{ mt: 2, p: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {isMobile() ? '📱 Modo Móvil' : '💻 Modo Desktop'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default QRScannerComponent;
