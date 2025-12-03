import { Box, Typography, Chip, Grid } from '@mui/material';
import { MonetizationOn, Discount } from '@mui/icons-material';

export default function PaymentSummary({ calcularCostoTotal, selectedCoupon, totalHours }) {
  const total = calcularCostoTotal();

  return (
    <Box sx={{ 
      mt: 4, 
      p: 4, 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)',
      borderRadius: 3,
      border: '1px solid #bbdefb',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elemento decorativo */}
      <Box sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        background: 'linear-gradient(135deg, rgba(15, 159, 225, 0.1) 0%, rgba(158, 202, 63, 0.1) 100%)',
        borderRadius: '50%',
      }} />
      
      <Typography variant="h6" sx={{ 
        color: '#1a237e', 
        mb: 3, 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <MonetizationOn sx={{ color: '#0f9fe1' }} />
        Resumen de Pago
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {totalHours > 0 && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Duración:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {totalHours} hora{totalHours !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ 
        backgroundColor: 'white', 
        p: 3, 
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        mt: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Total a pagar:
          </Typography>
          <Typography variant="h4" sx={{ 
            color: '#2e7d32', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #0f9fe1, #2e7d32)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ${total.toFixed(2)}
          </Typography>
        </Box>
        
        {selectedCoupon && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mt: 2,
            p: 1.5,
            backgroundColor: '#e8f5e9',
            borderRadius: 1,
            borderLeft: '4px solid #4caf50'
          }}>
            <Discount sx={{ color: '#4caf50' }} />
            <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'medium' }}>
              ¡Cupón aplicado! Has obtenido un descuento
            </Typography>
          </Box>
        )}
        
        <Typography variant="caption" sx={{ 
          display: 'block', 
          mt: 2, 
          textAlign: 'center',
          color: '#757575'
        }}>
          El pago se procesará de forma segura al confirmar la reserva
        </Typography>
      </Box>
    </Box>
  );
}