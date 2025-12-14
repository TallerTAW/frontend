// Crear un nuevo archivo UnirseReservaButton.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { TextField, Button, Paper, Box } from '@mui/material';
import { reservasApi } from '../api/reservas';

export default function UnirseReservaButton() {
  const [codigoInput, setCodigoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleUnirseReserva = async () => {
    if (!codigoInput.trim()) {
      toast.error('Ingresa un código');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Verificar que el código de reserva existe
      const reservaData = await reservasApi.getByCodigo(codigoInput);
      
      // 2. Verificar cupo disponible
      const asistentesActuales = reservaData.asistentes?.length || 0;
      const cuposDisponibles = reservaData.cantidad_asistentes - (asistentesActuales + 1);
      
      if (cuposDisponibles <= 0) {
        toast.error('No hay cupo disponible en esta reserva');
        setLoading(false);
        return;
      }
      
      // 3. Manejar según si está logueado o no
      if (profile) {
        // Usuario logueado - unirse directamente
        try {
          await reservasApi.unirseConCodigo(codigoInput, {
            nombre: profile.nombre,
            email: profile.email
          });
          
          toast.success('¡Te has unido exitosamente a la reserva! Revisa tu email para el QR.');
          setCodigoInput('');
        } catch (error) {
          console.error('Error al unirse:', error);
          toast.error(error.response?.data?.detail || 'Error al unirse a la reserva');
        }
      } else {
        // Usuario NO logueado - redirigir a registro/login con código
        navigate('/register', {
          state: {
            codigoAcceso: codigoInput,
            reservaData: reservaData
          }
        });
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      toast.error(error.response?.data?.detail || 'Código no válido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder="Código de reserva"
        value={codigoInput}
        onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
        sx={{ flexGrow: 1 }}
        disabled={loading}
      />
      <Button
        variant="contained"
        size="small"
        onClick={handleUnirseReserva}
        disabled={loading || !codigoInput.trim()}
        sx={{ 
          backgroundColor: '#00BFFF', 
          color: 'white',
          minWidth: '80px'
        }}
      >
        {loading ? 'Uniendo...' : 'Unirse'}
      </Button>
    </Paper>
  );
}