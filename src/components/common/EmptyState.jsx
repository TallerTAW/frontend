import { Box, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';

export default function EmptyState({ message, icon: Icon = Info }) {
  return (
    <Box className="flex flex-col items-center justify-center py-12 text-center">
      <Icon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" className="text-gray-600 mb-2">
        No hay datos disponibles
      </Typography>
      <Typography variant="body1" className="text-gray-500">
        {message}
      </Typography>
    </Box>
  );
}