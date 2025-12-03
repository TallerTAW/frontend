import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

export default function ConfirmacionDialog({
  open,
  onClose,
  onConfirm,
  selectedCancha,
  reservationData,
  selectedCoupon,
  cupones,
  isHorarioDisponible,
  calcularCostoTotal
}) {
  const cupon = selectedCoupon 
    ? cupones.find(c => c.id_cupon === parseInt(selectedCoupon))
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold text-lg">
        Confirmar Reserva
      </DialogTitle>
      <DialogContent>
        <Typography className="mb-4">
          Revisa los detalles finales antes de proceder al pago:
        </Typography>
        <Box className="p-4 bg-gray-100 rounded-xl">
          <Typography className="mb-2">
            <strong className="text-blue-600">Cancha:</strong> {selectedCancha?.nombre}
          </Typography>
          <Typography className="mb-2">
            <strong className="text-gray-700">Fecha:</strong> {reservationData.fecha_reserva}
          </Typography>
          <Typography className="mb-2">
            <strong className="text-gray-700">Horario:</strong> {reservationData.hora_inicio} - {reservationData.hora_fin}
          </Typography>
          <Typography className="mb-2">
            <strong className="text-gray-700">Asistentes:</strong> {reservationData.cantidad_asistentes}
          </Typography>
          {cupon && (
            <Typography className="mb-2 text-green-600">
              <strong>Cupón aplicado:</strong> {cupon.codigo}
            </Typography>
          )}
          <Typography className="font-bold text-blue-700 text-2xl mt-3">
            <strong>Total a Pagar:</strong> ${calcularCostoTotal().toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={!isHorarioDisponible()}
          sx={{
            background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
            '&:hover': {
              background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
            },
            '&:disabled': {
              background: '#ccc',
              color: '#666'
            }
          }}
        >
          Confirmar y Pagar
        </Button>
      </DialogActions>
    </Dialog>
  );
}