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
} from '@mui/material';
import { AccountBalanceWallet, CardGiftcard, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Wallet() {
  const { profile } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    fetchCoupons();
  }, [profile]);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCoupons(data || []);

      const available = data
        ?.filter(c => !c.used)
        .reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;
      setTotalAvailable(available);
    } catch (error) {
      toast.error('Error al cargar cupones');
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-2">
          Mi Billetera
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6 font-body">
          Administra tus cupones y descuentos
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-3xl shadow-2xl mb-8 overflow-hidden">
          <Box
            className="p-8 text-white relative"
            sx={{
              background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 50%, #fbab22 100%)',
            }}
          >
            <Box className="flex items-center gap-3 mb-6">
              <AccountBalanceWallet sx={{ fontSize: 50 }} />
              <Box>
                <Typography variant="h6" className="font-title opacity-90">
                  Saldo Disponible
                </Typography>
                <Typography variant="h3" className="font-title">
                  ${totalAvailable.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Box className="flex justify-between items-center">
              <Typography variant="body2" className="font-body">
                {coupons.filter(c => !c.used).length} cupones activos
              </Typography>
              <Typography variant="body2" className="font-body">
                {profile?.full_name}
              </Typography>
            </Box>
            <Box
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              sx={{
                background: 'radial-gradient(circle, white 0%, transparent 70%)',
                transform: 'translate(30%, -30%)',
              }}
            />
          </Box>
        </Card>
      </motion.div>

      <Typography variant="h5" className="font-title text-primary mb-4">
        Mis Cupones
      </Typography>

      <Grid container spacing={3}>
        {coupons.map((coupon, index) => (
          <Grid item xs={12} sm={6} md={4} key={coupon.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`rounded-2xl shadow-lg transition-all duration-300 ${
                  coupon.used ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-2'
                }`}
                sx={{
                  borderLeft: `6px solid ${coupon.used ? '#9e9e9e' : '#9eca3f'}`,
                }}
              >
                <CardContent className="p-6">
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex items-center gap-2">
                      <CardGiftcard
                        sx={{
                          fontSize: 40,
                          color: coupon.used ? '#9e9e9e' : '#fbab22',
                        }}
                      />
                      <Box>
                        <Typography variant="h4" className="font-title text-accent">
                          ${coupon.amount}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          Cupón de descuento
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={coupon.used ? <CheckCircle /> : undefined}
                      label={coupon.used ? 'Usado' : 'Activo'}
                      color={coupon.used ? 'default' : 'success'}
                      size="small"
                      className="font-bold"
                    />
                  </Box>

                  <Box className="bg-gray-50 p-3 rounded-xl mb-3">
                    <Typography variant="body2" className="font-body text-gray-700">
                      {coupon.reason}
                    </Typography>
                  </Box>

                  <Typography variant="caption" className="text-gray-500 block">
                    Creado: {new Date(coupon.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>

                  {!coupon.used && (
                    <Box className="mt-4 p-3 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl">
                      <Typography variant="caption" className="font-body text-gray-700">
                        Este cupón se aplicará automáticamente en tu próxima reserva
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {coupons.length === 0 && (
        <Box className="text-center py-12">
          <AccountBalanceWallet sx={{ fontSize: 100, color: '#0f9fe1', opacity: 0.3 }} />
          <Typography variant="h6" className="text-gray-500 mt-4 font-body">
            No tienes cupones en tu billetera
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-2 font-body">
            Los cupones se generan cuando cancelas una reserva con reembolso
          </Typography>
        </Box>
      )}
    </Box>
  );
}
