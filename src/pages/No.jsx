import { Container, Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Warning } from '@mui/icons-material';

export default function Unauthorized() {
  return (
    <Container maxWidth="sm">
      <Box className="min-h-screen flex items-center justify-center">
        <Box className="text-center">
          <Warning className="text-6xl text-yellow-500 mb-4" />
          <Typography variant="h4" className="font-title text-gray-800 mb-4">
            Acceso No Autorizado
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-8">
            No tienes permisos para acceder a esta página.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            className="bg-primary hover:bg-primary/90"
          >
            Volver al Inicio
          </Button>
        </Box>
      </Box>
    </Container>
  );
}