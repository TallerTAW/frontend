import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Paper,
  Grid,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';

export default function AsistentesForm({
  cantidadAsistentes,
  asistentes,
  onAsistentesChange,
  maxCapacity
}) {
  const [asistentesData, setAsistentesData] = useState(asistentes || []);

  // Inicializar asistentes cuando cambia la cantidad
  useEffect(() => {
    const newAsistentes = [];
    for (let i = 0; i < cantidadAsistentes; i++) {
      newAsistentes[i] = asistentesData[i] || { nombre: '', email: '' };
    }
    setAsistentesData(newAsistentes);
  }, [cantidadAsistentes]);

  // Notificar cambios al padre
  useEffect(() => {
    onAsistentesChange(asistentesData);
  }, [asistentesData]);

  const handleAsistenteChange = (index, field, value) => {
    const newAsistentes = [...asistentesData];
    newAsistentes[index] = {
      ...newAsistentes[index],
      [field]: value
    };
    setAsistentesData(newAsistentes);
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const allAsistentesValid = () => {
    return asistentesData.every(asistente => 
      asistente.nombre.trim() !== '' && 
      isValidEmail(asistente.email)
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ 
        color: '#1a237e', 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1 
      }}>
        <PersonIcon sx={{ color: '#0f9fe1' }} />
        Información de Asistentes ({asistentesData.length}/{maxCapacity})
      </Typography>

      {cantidadAsistentes > maxCapacity && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          La cantidad de asistentes supera la capacidad máxima ({maxCapacity})
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Cada asistente recibirá un código QR personal por email para acceder a la cancha.
      </Alert>

      {allAsistentesValid() && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          ✅ Todos los asistentes tienen información válida
        </Alert>
      )}

      <Grid container spacing={3}>
        {asistentesData.map((asistente, index) => (
          <Grid item xs={12} key={index}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2.5, 
                borderRadius: 2,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                position: 'relative'
              }}
            >
              <Chip 
                label={`Asistente ${index + 1}`}
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  left: 16,
                  backgroundColor: '#0f9fe1',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    value={asistente.nombre}
                    onChange={(e) => handleAsistenteChange(index, 'nombre', e.target.value)}
                    required
                    variant="outlined"
                    size="medium"
                    error={asistente.nombre === '' && asistente.nombre.length > 0}
                    helperText={asistente.nombre === '' && asistente.nombre.length > 0 ? 'Nombre requerido' : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fafafa',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ color: '#0f9fe1', mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={asistente.email}
                    onChange={(e) => handleAsistenteChange(index, 'email', e.target.value)}
                    required
                    variant="outlined"
                    size="medium"
                    error={asistente.email !== '' && !isValidEmail(asistente.email)}
                    helperText={
                      asistente.email !== '' && !isValidEmail(asistente.email) 
                        ? 'Email inválido' 
                        : 'Recibirá el código QR aquí'
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fafafa',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ color: '#9eca3f', mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {asistentesData.length > 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Importante:</strong> Cada asistente recibirá un email con:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Código QR personal para el acceso
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Detalles de la reserva (fecha, hora, cancha)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Instrucciones para usar el código QR
              </Typography>
            </li>Ca
          </Box>
        </Box>
      )}
    </Paper>
  );
}