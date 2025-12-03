import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const getDisciplinaIcon = (nombre) => {
  if (nombre.includes('Fútbol')) return '⚽';
  if (nombre.includes('Básquetbol') || nombre.includes('Basket')) return '🏀';
  if (nombre.includes('Tenis')) return '🎾';
  if (nombre.includes('Vóleibol') || nombre.includes('Voley')) return '🏐';
  if (nombre.includes('Natación')) return '🏊';
  if (nombre.includes('Atletismo')) return '🏃';
  return '🏆';
};

export default function DisciplinaCard({ disciplina, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-blue-50 to-green-50"
        onClick={onClick}
        elevation={2}
      >
        <CardContent className="text-center py-8">
          <Box className="text-6xl mb-4">
            {getDisciplinaIcon(disciplina.nombre)}
          </Box>
          <Typography variant="h6" className="font-bold text-gray-800">
            {disciplina.nombre}
          </Typography>
          {disciplina.descripcion && (
            <Typography variant="body2" className="text-gray-600 mt-2">
              {disciplina.descripcion.substring(0, 60)}...
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}