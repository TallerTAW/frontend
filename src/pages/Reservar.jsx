import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReserva } from '../hooks/useReserva';
import Step1Espacios from '../components/reservar/Step1Espacios';
import Step2Disciplinas from '../components/reservar/Step2Disciplinas';
import Step3Canchas from '../components/reservar/Step3Canchas';
import Step4Confirmacion from '../components/reservar/Step4Confirmacion';
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
    reservationData,
    confirmOpen,
    horariosDisponibles,
    isLoading,
    
    // Métodos
    fetchEspacios,
    fetchCuponesUsuario,
    fetchDisciplinas,
    fetchCanchas,
    fetchHorariosDisponibles,
    setActiveStep,
    handleEspacioSelect,
    handleDisciplinaSelect,
    handleCanchaSelect,
    setSelectedCoupon,
    setReservationData,
    setConfirmOpen,
    handleConfirmReservation,
    resetForm,
    isHorarioDisponible,
    calcularCostoTotal,
    getOccupiedHours,

    getOcupiedBlocks,
    isHoraInicioValida,
    isHoraFinValida,
    getHorasInicioDisponiblesList,
    getHorasFinDisponiblesList,
  } = useReserva();

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await fetchEspacios();
        if (profile) {
          await fetchCuponesUsuario();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [profile]);

  // Actualizar horarios cuando cambia la fecha o cancha
  useEffect(() => {
    if (selectedCancha && reservationData.fecha_reserva) {
      fetchHorariosDisponibles();
    }
  }, [selectedCancha, reservationData.fecha_reserva]);

  // Cargar disciplinas cuando se selecciona un espacio
  useEffect(() => {
    if (selectedEspacio) {
      fetchDisciplinas(selectedEspacio.id_espacio_deportivo);
    }
  }, [selectedEspacio]);

  // Cargar canchas cuando se selecciona disciplina
  useEffect(() => {
    if (selectedEspacio && selectedDisciplina) {
      fetchCanchas();
    }
  }, [selectedEspacio, selectedDisciplina]);

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
          <Step1Espacios
            espacios={espacios}
            onEspacioSelect={handleEspacioSelect}
            loading={loading}
          />
        );
      case 1:
        return (
          <Step2Disciplinas
            selectedEspacio={selectedEspacio}
            disciplinas={disciplinas}
            onDisciplinaSelect={handleDisciplinaSelect}
            onBack={() => setActiveStep(0)}
            loading={loading}
          />
        );
      case 2:
        return (
          <Step3Canchas
            selectedEspacio={selectedEspacio}
            selectedDisciplina={selectedDisciplina}
            canchas={canchas}
            onCanchaSelect={handleCanchaSelect}
            onBack={() => setActiveStep(1)}
            loading={loading}
          />
        );
      case 3:
        return (
          <Step4Confirmacion
            selectedEspacio={selectedEspacio}
            selectedDisciplina={selectedDisciplina}
            selectedCancha={selectedCancha}
            cupones={cupones}
            reservationData={reservationData}
            horariosDisponibles={horariosDisponibles}
            selectedCoupon={selectedCoupon}
            onBack={() => setActiveStep(2)}
            onCouponChange={setSelectedCoupon}
            onReservationChange={setReservationData}
            onConfirm={() => setConfirmOpen(true)}
            isHorarioDisponible={isHorarioDisponible}
            calcularCostoTotal={calcularCostoTotal}
            getOccupiedHours={getOccupiedHours}
            profile={profile}
            isHoraInicioValida={isHoraInicioValida}
            isHoraFinValida={isHoraFinValida}
            getHorasInicioDisponiblesList={getHorasInicioDisponiblesList}
            getHorasFinDisponiblesList={getHorasFinDisponiblesList}
            horarioDisponible={isHorarioDisponible()}
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

      {/* Stepper - Ocultar en pantallas pequeñas si hay mucho contenido */}
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