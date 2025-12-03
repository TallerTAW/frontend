import { Card, CardContent, Typography, Box } from '@mui/material';
import { Stadium } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function EspacioCard({ espacio, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onClick}
        elevation={2}
      >
        <Box className="h-48 bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center">
          <Stadium sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
        </Box>
        <CardContent>
          <Typography variant="h6" className="font-bold">
            {espacio.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {espacio.ubicacion}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            Capacidad: {espacio.capacidad} personas
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}