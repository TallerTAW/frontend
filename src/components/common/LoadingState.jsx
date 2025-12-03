import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingState({ message = "Cargando..." }) {
  return (
    <Box className="flex flex-col items-center justify-center py-12">
      <CircularProgress size={60} />
      <Typography variant="body1" className="mt-4 text-gray-600">
        {message}
      </Typography>
    </Box>
  );
}