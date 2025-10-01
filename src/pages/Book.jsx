import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Rating,
} from '@mui/material';
import { Stadium, Category, SportsSoccer, ArrowBack, ArrowForward, Star } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Book() {
  const { profile } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [facilities, setFacilities] = useState([]);
  const [sports, setSports] = useState([]);
  const [courts, setCourts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [reservationDate, setReservationDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [courtRatings, setCourtRatings] = useState({});

  useEffect(() => {
    fetchFacilities();
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (selectedFacility && selectedSport) {
      fetchCourts();
    }
  }, [selectedFacility, selectedSport]);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_facilities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      toast.error('Error al cargar espacios deportivos');
    }
  };

  const fetchSports = async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSports(data || []);
    } catch (error) {
      toast.error('Error al cargar deportes');
    }
  };

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('facility_id', selectedFacility)
        .eq('sport_id', selectedSport);

      if (error) throw error;

      const courtIds = data.map(c => c.id);
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('court_id, rating');

      const ratings = {};
      if (ratingsData) {
        ratingsData.forEach(r => {
          if (!ratings[r.court_id]) {
            ratings[r.court_id] = { total: 0, count: 0 };
          }
          ratings[r.court_id].total += r.rating;
          ratings[r.court_id].count += 1;
        });
      }

      Object.keys(ratings).forEach(courtId => {
        ratings[courtId] = ratings[courtId].total / ratings[courtId].count;
      });

      setCourtRatings(ratings);

      let filteredCourts = data || [];

      if (filter === 'available') {
        filteredCourts = filteredCourts.filter(c => c.available);
      } else if (filter === 'price') {
        filteredCourts.sort((a, b) => a.price_per_hour - b.price_per_hour);
      }

      if (sortBy === 'rating') {
        filteredCourts.sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0));
      } else if (sortBy === 'price') {
        filteredCourts.sort((a, b) => a.price_per_hour - b.price_per_hour);
      }

      setCourts(filteredCourts);
    } catch (error) {
      toast.error('Error al cargar canchas');
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('user_id', profile.id)
        .eq('used', false);

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error al cargar cupones');
    }
  };

  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility.id);
    setActiveStep(1);
    fetchSports();
  };

  const handleSportSelect = (sport) => {
    setSelectedSport(sport.id);
    setActiveStep(2);
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setActiveStep(3);
  };

  const calculateTotal = () => {
    if (!selectedCourt || !startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);

    let total = hours * selectedCourt.price_per_hour;

    if (selectedCoupon) {
      const coupon = coupons.find(c => c.id === selectedCoupon);
      if (coupon) {
        total -= coupon.amount;
      }
    }

    return Math.max(0, total);
  };

  const handleConfirmReservation = async () => {
    try {
      const total = calculateTotal();

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: profile.id,
          court_id: selectedCourt.id,
          reservation_date: reservationDate,
          start_time: startTime,
          end_time: endTime,
          total_price: total,
          status: 'confirmed',
          payment_amount: total,
        })
        .select()
        .single();

      if (error) throw error;

      if (selectedCoupon) {
        const { error: couponError } = await supabase
          .from('coupons')
          .update({ used: true, used_in_reservation_id: data.id })
          .eq('id', selectedCoupon);

        if (couponError) throw couponError;
      }

      toast.success('Reserva creada exitosamente');
      setConfirmOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al crear la reserva');
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setSelectedFacility(null);
    setSelectedSport(null);
    setSelectedCourt(null);
    setReservationDate('');
    setStartTime('');
    setEndTime('');
    setSelectedCoupon('');
    fetchCoupons();
  };

  const steps = ['Seleccionar Espacio', 'Seleccionar Deporte', 'Seleccionar Cancha', 'Confirmar Reserva'];

  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" className="font-title text-primary mb-6">
          Reservar Cancha
        </Typography>
      </motion.div>

      <Stepper activeStep={activeStep} className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" className="font-title mb-4">
            Selecciona un Espacio Deportivo
          </Typography>
          <Grid container spacing={3}>
            {facilities.map((facility, index) => (
              <Grid item xs={12} sm={6} md={4} key={facility.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => handleFacilitySelect(facility)}
                  >
                    <CardMedia
                      component="div"
                      className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                      sx={{
                        backgroundImage: facility.image_url
                          ? `url(${facility.image_url})`
                          : 'linear-gradient(to bottom right, #0f9fe1, #9eca3f)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!facility.image_url && <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="h6" className="font-title">
                        {facility.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 font-body">
                        {facility.address}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeStep === 1 && (
        <Box>
          <Box className="flex items-center gap-4 mb-4">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(0)}
              className="text-primary"
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Selecciona un Deporte
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {sports.map((sport, index) => (
              <Grid item xs={12} sm={6} md={3} key={sport.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-secondary/10 to-accent/10"
                    onClick={() => handleSportSelect(sport)}
                  >
                    <CardContent className="text-center py-8">
                      <Box className="text-7xl mb-4">{sport.icon}</Box>
                      <Typography variant="h5" className="font-title">
                        {sport.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-4">
              <Button
                startIcon={<ArrowBack />}
                onClick={() => setActiveStep(1)}
                className="text-primary"
              >
                Atrás
              </Button>
              <Typography variant="h6" className="font-title">
                Selecciona una Cancha
              </Typography>
            </Box>
            <Box className="flex gap-2">
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(e, value) => {
                  if (value !== null) {
                    setFilter(value);
                    fetchCourts();
                  }
                }}
                size="small"
              >
                <ToggleButton value="all">Todas</ToggleButton>
                <ToggleButton value="available">Disponibles</ToggleButton>
              </ToggleButtonGroup>
              <FormControl size="small" className="w-40">
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    fetchCourts();
                  }}
                >
                  <MenuItem value="name">Nombre</MenuItem>
                  <MenuItem value="rating">Calificación</MenuItem>
                  <MenuItem value="price">Precio</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Grid container spacing={3}>
            {courts.map((court, index) => (
              <Grid item xs={12} sm={6} md={4} key={court.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => court.available && handleCourtSelect(court)}
                    sx={{
                      opacity: court.available ? 1 : 0.6,
                      cursor: court.available ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <CardMedia
                      component="div"
                      className="h-48 bg-gradient-to-br from-accent to-highlight flex items-center justify-center relative"
                      sx={{
                        backgroundImage: court.image_url
                          ? `url(${court.image_url})`
                          : 'linear-gradient(to bottom right, #fbab22, #f87326)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {!court.image_url && <SportsSoccer sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />}
                      <Chip
                        label={court.available ? 'Disponible' : 'No disponible'}
                        className={`absolute top-2 right-2 ${
                          court.available ? 'bg-secondary' : 'bg-gray-500'
                        } text-white font-bold`}
                        size="small"
                      />
                    </CardMedia>
                    <CardContent>
                      <Typography variant="h6" className="font-title mb-2">
                        {court.name}
                      </Typography>
                      <Box className="flex items-center gap-2 mb-2">
                        <Rating value={courtRatings[court.id] || 0} readOnly precision={0.5} size="small" />
                        <Typography variant="caption" className="text-gray-500">
                          ({(courtRatings[court.id] || 0).toFixed(1)})
                        </Typography>
                      </Box>
                      <Typography variant="h6" className="font-title text-accent">
                        ${court.price_per_hour}/hora
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {activeStep === 3 && selectedCourt && (
        <Box>
          <Box className="flex items-center gap-4 mb-4">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setActiveStep(2)}
              className="text-primary"
            >
              Atrás
            </Button>
            <Typography variant="h6" className="font-title">
              Confirmar Reserva
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card className="rounded-2xl shadow-lg p-4">
                <Typography variant="h6" className="font-title mb-4">
                  Detalles de la Cancha
                </Typography>
                <Typography className="font-body mb-2">
                  <strong>Cancha:</strong> {selectedCourt.name}
                </Typography>
                <Typography className="font-body mb-2">
                  <strong>Precio:</strong> ${selectedCourt.price_per_hour}/hora
                </Typography>
                <Box className="flex items-center gap-2">
                  <strong>Calificación:</strong>
                  <Rating value={courtRatings[selectedCourt.id] || 0} readOnly precision={0.5} size="small" />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="rounded-2xl shadow-lg p-4">
                <Typography variant="h6" className="font-title mb-4">
                  Información de la Reserva
                </Typography>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  required
                  className="mb-4"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Hora de inicio"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Hora de fin"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
                {coupons.length > 0 && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Cupón de descuento</InputLabel>
                    <Select
                      value={selectedCoupon}
                      onChange={(e) => setSelectedCoupon(e.target.value)}
                    >
                      <MenuItem value="">Sin cupón</MenuItem>
                      {coupons.map((coupon) => (
                        <MenuItem key={coupon.id} value={coupon.id}>
                          ${coupon.amount} - {coupon.reason}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Box className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
                  <Typography variant="h5" className="font-title text-primary">
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setConfirmOpen(true)}
                  disabled={!reservationDate || !startTime || !endTime}
                  className="mt-4"
                  sx={{
                    textTransform: 'none',
                    background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
                    '&:hover': {
                      background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
                    },
                    fontSize: '1.1rem',
                    py: 1.5,
                  }}
                >
                  Confirmar Reserva
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle className="font-title">Confirmar Reserva</DialogTitle>
        <DialogContent>
          <Typography className="font-body">
            ¿Estás seguro de confirmar esta reserva?
          </Typography>
          <Box className="mt-4 p-4 bg-gray-100 rounded-xl">
            <Typography className="font-body mb-1">
              <strong>Cancha:</strong> {selectedCourt?.name}
            </Typography>
            <Typography className="font-body mb-1">
              <strong>Fecha:</strong> {reservationDate}
            </Typography>
            <Typography className="font-body mb-1">
              <strong>Horario:</strong> {startTime} - {endTime}
            </Typography>
            <Typography className="font-title text-primary text-xl mt-2">
              <strong>Total:</strong> ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmReservation}
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #0f9fe1, #9eca3f)',
              '&:hover': {
                background: 'linear-gradient(to right, #0d8dc7, #8ab637)',
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
