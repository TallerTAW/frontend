import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
} from '@mui/material';
import { CalendarMonth, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Reservations() {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [profile]);

  const fetchReservations = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          courts (
            name,
            sports (name, icon),
            sports_facilities (name)
          )
        `)
        .order('reservation_date', { ascending: false });

      if (profile?.role === 'client') {
        query = query.eq('user_id', profile.id);
      } else if (profile?.role === 'admin_facility') {
        const { data: courtsData } = await supabase
          .from('courts')
          .select('id')
          .eq('facility_id', profile.facility_id);

        if (courtsData) {
          const courtIds = courtsData.map(c => c.id);
          query = query.in('court_id', courtIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      toast.error('Error al cargar reservas');
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelDialog) return;

    try {
      const refund = parseFloat(refundAmount) || 0;

      const { error: updateError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', cancelDialog.id);

      if (updateError) throw updateError;

      if (refund > 0) {
        const { error: couponError } = await supabase
          .from('coupons')
          .insert({
            user_id: cancelDialog.user_id,
            amount: refund,
            reason: `Reembolso por cancelación de reserva - ${cancelDialog.courts.name}`,
            used: false,
          });

        if (couponError) throw couponError;
        toast.success(`Reserva cancelada. Cupón de $${refund} creado en la billetera`);
      } else {
        toast.success('Reserva cancelada correctamente');
      }

      setCancelDialog(null);
      setRefundAmount('');
      fetchReservations();
    } catch (error) {
      toast.error('Error al cancelar la reserva');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada',
    };
    return texts[status] || status;
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-6">
          {profile?.role === 'client' ? 'Mis Reservas' : 'Reservas'}
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        {reservations.map((reservation, index) => (
          <Grid item xs={12} md={6} lg={4} key={reservation.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <Box className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
                  <Box className="flex items-center gap-2 mb-2">
                    <Typography className="text-4xl">
                      {reservation.courts.sports.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h6" className="font-title">
                        {reservation.courts.name}
                      </Typography>
                      <Typography variant="caption">
                        {reservation.courts.sports_facilities.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <CalendarMonth className="text-primary" />
                      <Typography className="font-body">
                        {new Date(reservation.reservation_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                    <Typography className="font-body text-gray-600">
                      <strong>Horario:</strong> {reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)}
                    </Typography>
                    <Typography className="font-title text-accent text-xl">
                      Total: ${reservation.total_price}
                    </Typography>
                    <Box className="flex justify-between items-center mt-4">
                      <Chip
                        label={getStatusText(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        className="font-bold"
                      />
                      {reservation.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => {
                            setCancelDialog(reservation);
                            setRefundAmount(reservation.payment_amount.toString());
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {reservations.length === 0 && (
        <Box className="text-center py-12">
          <CalendarMonth sx={{ fontSize: 100, color: '#0f9fe1', opacity: 0.3 }} />
          <Typography variant="h6" className="text-gray-500 mt-4 font-body">
            No hay reservas disponibles
          </Typography>
        </Box>
      )}

      <Dialog
        open={Boolean(cancelDialog)}
        onClose={() => {
          setCancelDialog(null);
          setRefundAmount('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-title">Cancelar Reserva</DialogTitle>
        <DialogContent>
          <Typography className="font-body mb-4">
            ¿Estás seguro de cancelar esta reserva?
          </Typography>
          {cancelDialog && (
            <Box className="p-4 bg-gray-100 rounded-xl mb-4">
              <Typography className="font-body mb-1">
                <strong>Cancha:</strong> {cancelDialog.courts.name}
              </Typography>
              <Typography className="font-body mb-1">
                <strong>Fecha:</strong> {new Date(cancelDialog.reservation_date).toLocaleDateString('es-ES')}
              </Typography>
              <Typography className="font-body">
                <strong>Total pagado:</strong> ${cancelDialog.payment_amount}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Monto a reembolsar (cupón)"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            inputProps={{ step: '0.01', min: '0', max: cancelDialog?.payment_amount }}
            helperText="Se creará un cupón en la billetera del cliente por este monto"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCancelDialog(null);
              setRefundAmount('');
            }}
          >
            Volver
          </Button>
          <Button
            onClick={handleCancelReservation}
            variant="contained"
            color="error"
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
