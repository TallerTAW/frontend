import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { SportsSoccer } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function CanchaCard({ cancha, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
        onClick={onClick}
        elevation={2}
      >
        <Box
          className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center rounded-t-xl relative"
        >
          <SportsSoccer sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
          <Chip
            label={cancha.estado}
            size="small"
            className="absolute top-2 right-2 bg-green-600 text-white font-bold"
            sx={{
              backgroundColor: cancha.estado === 'disponible' ? '#16a34a' : '#dc2626',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
        <CardContent>
          <Typography variant="h6" className="font-bold mb-2">
            {cancha.nombre}
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-2">
            Tipo: {cancha.tipo}
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-2">
            Horario: {cancha.hora_apertura.slice(0,5)} - {cancha.hora_cierre.slice(0,5)}
          </Typography>
          <Typography variant="h6" className="font-bold text-blue-600 mt-3">
            ${cancha.precio_por_hora}/hora
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}