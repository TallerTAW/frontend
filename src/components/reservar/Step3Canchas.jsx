import { Button, Grid, Typography, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import CanchaCard from './CanchaCard';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';

export default function Step3Canchas({
  selectedEspacio,
  selectedDisciplina,
  canchas,
  onCanchaSelect,
  onBack,
  loading
}) {
  if (loading) {
    return <LoadingState message="Cargando canchas..." />;
  }

  const canchasDisponibles = canchas.filter(c => c.estado === 'disponible');

  if (canchasDisponibles.length === 0) {
    return (
      <Box>
        <Box className="flex items-center gap-4 mb-6">
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
          >
            Atrás
          </Button>
          <Typography variant="h6" className="font-bold">
            Selecciona una Cancha de {selectedDisciplina?.nombre}
          </Typography>
        </Box>
        <EmptyState 
          message={`No se encontraron canchas de ${selectedDisciplina?.nombre} disponibles en ${selectedEspacio?.nombre}`}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box className="flex items-center gap-4 mb-6">
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ color: 'text.secondary', fontWeight: 'bold' }}
        >
          Atrás
        </Button>
        <Typography variant="h6" className="font-bold">
          Selecciona una Cancha de {selectedDisciplina?.nombre}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {canchasDisponibles.map((cancha, index) => (
          <Grid item xs={12} sm={6} md={4} key={cancha.id_cancha}>
            <CanchaCard
              cancha={cancha}
              onClick={() => onCanchaSelect(cancha)}
              index={index}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}