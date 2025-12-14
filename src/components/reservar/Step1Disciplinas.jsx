import { Grid, Typography, Box } from '@mui/material';
import DisciplinaCard from './DisciplinaCard';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';

export default function Step1Disciplinas({ disciplinas, onDisciplinaSelect, loading }) {
  if (loading) {
    return <LoadingState message="Cargando disciplinas..." />;
  }

  if (disciplinas.length === 0) {
    return <EmptyState message="No hay disciplinas disponibles" />;
  }

  return (
    <Box>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          color: 'primary.main'
        }}
      >
        Selecciona una Disciplina
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 4, 
          color: 'text.secondary'
        }}
      >
        Elige tu deporte favorito. Luego podrás filtrar las canchas por espacio deportivo.
      </Typography>
      
      <Grid container spacing={3}>
        {disciplinas.map((disciplina, index) => (
          <Grid 
            item 
            xs={12}
            sm={6}
            md={3}
            key={disciplina.id_disciplina}
          >
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