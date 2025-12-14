import { Box, Typography, Chip, Grid, Divider } from '@mui/material';
import { MonetizationOn, Discount, Euro, Savings } from '@mui/icons-material';

export default function PaymentSummary({ 
  calcularCostoBase, 
  calcularDescuento, 
  calcularCostoTotal, 
  selectedCoupon, 
  selectedCouponData,
  cupones = [], 
  totalHours 
}) {
  const costoBase = calcularCostoBase ? calcularCostoBase() : 0;
  const descuento = calcularDescuento ? calcularDescuento() : 0;
  const totalConDescuento = calcularCostoTotal ? calcularCostoTotal() : costoBase;
  
  const cuponAplicado = cupones.find(c => c.codigo === selectedCoupon) || selectedCouponData;

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
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1.5,
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
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
        {/* Detalle de costos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {/* Costo Base */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Costo base ({totalHours} hora{totalHours !== 1 ? 's' : ''}):
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              ${costoBase.toFixed(2)}
            </Typography>
          </Box>
          
          {/* Descuento por cupón */}
          {selectedCoupon && cuponAplicado && descuento > 0 && (
            <>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1.5,
                bgcolor: '#e8f5e9',
                borderRadius: 1,
                borderLeft: '4px solid #4caf50'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Discount sx={{ color: '#4caf50', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" color="#2e7d32" fontWeight="medium">
                      Descuento ({cuponAplicado.codigo})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cuponAplicado.tipo === 'porcentaje' 
                        ? `${cuponAplicado.monto_descuento}% de descuento` 
                        : `Descuento fijo`}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" fontWeight="bold" color="#2e7d32">
                  -${descuento.toFixed(2)}
                </Typography>
              </Box>
              
              {/* Ahorro */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1,
                bgcolor: '#f1f8e9',
                borderRadius: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Savings sx={{ color: '#9eca3f', fontSize: 18 }} />
                  <Typography variant="body2" color="#2e7d32">
                    ¡Estás ahorrando!
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold" color="#2e7d32">
                  ${descuento.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Total final */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2,
            borderTop: '2px solid',
            borderColor: 'primary.main'
          }}>
            <Typography variant="subtitle1" fontWeight="bold" color="#1a237e">
              Total a pagar:
            </Typography>
            <Typography variant="h4" sx={{ 
              color: '#2e7d32', 
              fontWeight: 'bold',
              background: selectedCoupon 
                ? 'linear-gradient(135deg, #2e7d32, #9eca3f)' 
                : 'linear-gradient(135deg, #0f9fe1, #2e7d32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ${totalConDescuento.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        
        {selectedCoupon && cuponAplicado ? (
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
              ¡Cupón aplicado! {cuponAplicado.tipo === 'porcentaje' 
                ? `${cuponAplicado.monto_descuento}% de descuento` 
                : `$${cuponAplicado.monto_descuento} de descuento`}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ 
            display: 'block', 
            mt: 2, 
            textAlign: 'center',
            color: '#757575'
          }}>
            ¿Tienes un cupón? Aplícalo arriba para obtener descuento
          </Typography>
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