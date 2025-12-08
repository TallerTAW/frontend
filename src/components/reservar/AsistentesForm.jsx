import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
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

  useEffect(() => {
    const newAsistentes = [];
    for (let i = 0; i < cantidadAsistentes; i++) {
      newAsistentes[i] = asistentesData[i] || { nombre: '', email: '' };
    }
    setAsistentesData(newAsistentes);
  }, [cantidadAsistentes]);

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
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        bgcolor: '#f5f5f5', 
        borderRadius: 2, 
        mt: 2 
      }}
    >
      {/* Título */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1a237e', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          <PersonIcon sx={{ color: '#0f9fe1', fontSize: { xs: 18, sm: 20 } }} />
          Asistentes ({asistentesData.length}/{maxCapacity})
        </Typography>
      </Box>

      {/* Alertas */}
      {cantidadAsistentes > maxCapacity && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Supera capacidad máxima ({maxCapacity})
        </Alert>
      )}

      <Alert 
        severity="info" 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}
      >
        Cada asistente recibirá un código QR por email para acceder.
      </Alert>

      {allAsistentesValid() && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          ✅ Todos válidos
        </Alert>
      )}

      {/* Formulario de Asistentes - EN COLUMNA EN MÓVIL */}
      <Stack spacing={2}>
        {asistentesData.map((asistente, index) => (
          <Paper 
            key={index}
            elevation={1} 
            sx={{ 
              p: { xs: 2, sm: 2.5 }, 
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
                fontWeight: 'bold',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            />
            
            <Stack spacing={2}>
              {/* Nombre */}
              <TextField
                fullWidth
                label="Nombre completo"
                value={asistente.nombre}
                onChange={(e) => handleAsistenteChange(index, 'nombre', e.target.value)}
                required
                variant="outlined"
                size="small"
                error={asistente.nombre === '' && asistente.nombre.length > 0}
                helperText={asistente.nombre === '' && asistente.nombre.length > 0 ? 'Requerido' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <PersonIcon sx={{ color: '#0f9fe1', mr: 1, fontSize: 18 }} />
                  ),
                }}
              />
              
              {/* Email */}
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={asistente.email}
                onChange={(e) => handleAsistenteChange(index, 'email', e.target.value)}
                required
                variant="outlined"
                size="small"
                error={asistente.email !== '' && !isValidEmail(asistente.email)}
                helperText={
                  asistente.email !== '' && !isValidEmail(asistente.email) 
                    ? 'Email inválido' 
                    : 'Recibirá QR aquí'
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ color: '#9eca3f', mr: 1, fontSize: 18 }} />
                  ),
                }}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Información importante */}
      {asistentesData.length > 0 && (
        <Box sx={{ 
          mt: 3, 
          p: { xs: 1.5, sm: 2 }, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 2 
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ fontWeight: 'bold' }}
          >
            Importante:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
            <li>
              <Typography variant="caption" color="text.secondary">
                Código QR personal
              </Typography>
            </li>
            <li>
              <Typography variant="caption" color="text.secondary">
                Detalles de la reserva
              </Typography>
            </li>
            <li>
              <Typography variant="caption" color="text.secondary">
                Instrucciones de uso
              </Typography>
            </li>
          </Box>
        </Box>
      )}
    </Paper>
  );
}