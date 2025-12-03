import { Grid } from '@mui/material';
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Selecciona un Espacio Deportivo</h2>
      <Grid container spacing={3}>
        {espacios.map((espacio, index) => (
          <Grid item xs={12} sm={6} md={4} key={espacio.id_espacio_deportivo}>
            <EspacioCard
              espacio={espacio}
              onClick={() => onEspacioSelect(espacio)}
              index={index}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}