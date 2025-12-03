import { Button, Grid, Typography, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import DisciplinaCard from './DisciplinaCard';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';

export default function Step2Disciplinas({
  selectedEspacio,
  disciplinas,
  onDisciplinaSelect,
  onBack,
  loading
}) {
  if (loading) {
    return <LoadingState message="Cargando disciplinas..." />;
  }

  if (disciplinas.length === 0) {
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
            Selecciona una Disciplina en {selectedEspacio?.nombre}
          </Typography>
        </Box>
        <EmptyState message={`No se encontraron disciplinas con canchas disponibles en ${selectedEspacio?.nombre}`} />
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
          Selecciona una Disciplina en {selectedEspacio?.nombre}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {disciplinas.map((disciplina, index) => (
          <Grid item xs={12} sm={6} md={3} key={disciplina.id_disciplina}>
            <DisciplinaCard
              disciplina={disciplina}
              onClick={() => onDisciplinaSelect(disciplina)}
              index={index}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}