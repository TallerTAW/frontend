import { Grid, Typography, Box } from '@mui/material';
import EspacioCard from './EspacioCard';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';

export default function Step1Espacios({ espacios, onEspacioSelect, loading }) {
  if (loading) {
    return <LoadingState message="Cargando espacios..." />;
  }

  if (espacios.length === 0) {
    return <EmptyState message="No hay espacios deportivos disponibles" />;
  }

  return (
    // Se cambia el div por Box y se usa Typography para consistencia
    <Box> 
      <Typography variant="h5" className="font-bold mb-6">
        Selecciona un Espacio Deportivo
      </Typography>
      
      <Grid container spacing={3}>
        {espacios.map((espacio, index) => (
          <Grid 
            item 
            xs={12}      // 1 columna en móvil
            sm={6}      // 2 columnas en tableta
            md={4}      // 3 columnas en escritorio (optimización de espacio)
            key={espacio.id_espacio_deportivo}
          >
            <EspacioCard
              espacio={espacio}
              onClick={() => onEspacioSelect(espacio)}
              index={index}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}