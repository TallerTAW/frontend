import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReserva } from '../hooks/useReserva';
import Step1Disciplinas from '../components/reservar/Step1Disciplinas';
import Step2CanchasFiltradas from '../components/reservar/Step2CanchasFiltradas';
import Step3Confirmacion from '../components/reservar/Step3Confirmacion';
import ConfirmacionDialog from '../components/reservar/ConfirmacionDialog';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

export default function Reservar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  
  const {
    activeStep,
    steps,
    espacios,
    disciplinas,
    canchas,
    cupones,
    selectedEspacio,
    selectedDisciplina,
    selectedCancha,
    selectedCoupon,
    selectedCouponData,
    reservationData,
    confirmOpen,
    horariosDisponibles,
    isLoading,
    espacioFiltro,
    ubicacionUsuario,
    ordenarPorDistancia,
    obteniendoUbicacion,
    
    // Métodos
    fetchEspacios,
    fetchAllDisciplinas,
    fetchCuponesUsuario,
    fetchCanchasByDisciplina,
    fetchHorariosDisponibles,
    setActiveStep,
    handleDisciplinaSelect,
    handleCanchaSelect,
    setSelectedCoupon,
    setSelectedCouponData,
    setReservationData,
    setConfirmOpen,
    handleConfirmReservation,
    resetForm,
    isHorarioDisponible,
    calcularCostoBase,
    calcularDescuento,
    calcularCostoTotal,
    getOccupiedHours,
    getOcupiedBlocks,
    isHoraInicioValida,
    isHoraFinValida,
    getHorasInicioDisponiblesList,
    getHorasFinDisponiblesList,
    asistentes,
    validarAsistentes,
    handleAsistentesChange,
    filtrarCanchasPorEspacio,
    getEspaciosDisponibles,
    setEspacioFiltro,
    aplicarCupon,
    removerCupon,
    obtenerUbicacion,
    limpiarUbicacion,
    setOrdenarPorDistancia,
    setUbicacionUsuario,
    setObteniendoUbicacion
  } = useReserva();

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Cargar disciplinas y espacios en paralelo
        await Promise.all([
          fetchAllDisciplinas(),
          fetchEspacios()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Cargar cupones cuando el usuario esté autenticado
  useEffect(() => {
    if (profile) {
      console.log(`👤 [Reservar] Usuario autenticado: ${profile.email}, cargando cupones...`);
      fetchCuponesUsuario();
    } else {
      console.log(`👤 [Reservar] Usuario no autenticado`);
    }
  }, [profile, fetchCuponesUsuario]);

  // Actualizar horarios cuando cambia la fecha o cancha
  useEffect(() => {
    if (selectedCancha && reservationData.fecha_reserva) {
      fetchHorariosDisponibles();
    }
  }, [selectedCancha, reservationData.fecha_reserva]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderStepContent = () => {
    if (loading || isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>Cargando...</Typography>
        </Box>
      );
    }

    switch (activeStep) {
      case 0:
        return (
          <Step1Disciplinas
            disciplinas={disciplinas}
            onDisciplinaSelect={handleDisciplinaSelect}
            loading={loading}
          />
        );
      case 1:
        return (
          <Step2CanchasFiltradas
            selectedDisciplina={selectedDisciplina}
            canchas={canchas}
            espacios={espacios}
            onCanchaSelect={handleCanchaSelect}
            onBack={() => setActiveStep(0)}
            loading={loading || isLoading}
            espacioFiltro={espacioFiltro}
            setEspacioFiltro={setEspacioFiltro}
            filtrarCanchasPorEspacio={filtrarCanchasPorEspacio}
            getEspaciosDisponibles={getEspaciosDisponibles}
            ubicacionUsuario={ubicacionUsuario}
            ordenarPorDistancia={ordenarPorDistancia}
            obteniendoUbicacion={obteniendoUbicacion}
            obtenerUbicacion={obtenerUbicacion}
            limpiarUbicacion={limpiarUbicacion}
            fetchCanchasByDisciplina={fetchCanchasByDisciplina}
            setOrdenarPorDistancia={setOrdenarPorDistancia}
          />
        );
      case 2:
        return (
          <Step3Confirmacion
            selectedEspacio={selectedEspacio}
            selectedDisciplina={selectedDisciplina}
            selectedCancha={selectedCancha}
            cupones={cupones}
            reservationData={reservationData}
            horariosDisponibles={horariosDisponibles}
            selectedCoupon={selectedCoupon}
            selectedCouponData={selectedCouponData}
            onBack={() => setActiveStep(1)}
            onCouponChange={aplicarCupon}
            onRemoveCoupon={removerCupon}
            onReservationChange={setReservationData}
            onConfirm={() => setConfirmOpen(true)}
            isHorarioDisponible={isHorarioDisponible}
            calcularCostoBase={calcularCostoBase}
            calcularDescuento={calcularDescuento}
            calcularCostoTotal={calcularCostoTotal}
            getOccupiedHours={getOccupiedHours}
            profile={profile}
            isHoraInicioValida={isHoraInicioValida}
            isHoraFinValida={isHoraFinValida}
            getHorasInicioDisponiblesList={getHorasInicioDisponiblesList}
            getHorasFinDisponiblesList={getHorasFinDisponiblesList}
            horarioDisponible={isHorarioDisponible()}
            asistentes={asistentes}
            validarAsistentes={validarAsistentes}
            onAsistentesChange={handleAsistentesChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Botón para volver al inicio */}
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBackToHome}
        sx={{ 
          mb: 2, 
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        Volver al inicio
      </Button>

      {/* Título con animación */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 4, 
            color: 'primary.main',
            fontSize: { xs: '1.75rem', sm: '2.125rem' }
          }}
        >
          Reservar Cancha
        </Typography>
      </motion.div>

      {/* Stepper - Ocultar en pantallas pequeñas */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Indicador de paso para móviles */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          Paso {activeStep + 1} de {steps.length}: {steps[activeStep]}
        </Typography>
      </Box>

      {/* Contenido del paso actual */}
      {renderStepContent()}

      {/* Diálogo de confirmación */}
      <ConfirmacionDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmReservation}
        selectedCancha={selectedCancha}
        reservationData={reservationData}
        selectedCoupon={selectedCoupon}
        selectedCouponData={selectedCouponData}
        cupones={cupones}
        isHorarioDisponible={isHorarioDisponible}
        calcularCostoTotal={calcularCostoTotal}
      />

      {/* Información para usuarios no autenticados */}
      {!profile && activeStep === 0 && (
        <Box sx={{ 
          mt: 4, 
          p: 2, 
          bgcolor: 'info.light', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main'
        }}>
          <Typography variant="body2" color="text.primary">
            <strong>Nota:</strong> Necesitarás iniciar sesión para completar la reserva
          </Typography>
        </Box>
      )}
    </Box>
  );
}