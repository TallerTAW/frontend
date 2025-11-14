import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CalendarView = ({ reservas, onReservaClick, espacios }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEspacio, setSelectedEspacio] = useState('all');

  // Filtrar reservas por espacio seleccionado
  const filteredReservas = selectedEspacio === 'all' 
    ? reservas 
    : reservas.filter(reserva => reserva.cancha?.id_espacio_deportivo === parseInt(selectedEspacio));

  // Navegación del calendario
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    ));
  };

  // Información del mes actual
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Obtener reservas para una fecha específica
  const getReservasForDate = (date) => {
    return filteredReservas.filter(reserva => {
      const reservaDate = new Date(reserva.fecha_reserva);
      return reservaDate.toDateString() === date.toDateString();
    });
  };

  // Colores por estado
  const getStatusColor = (estado) => {
    const colors = {
      'pendiente': '#ff9800',
      'confirmada': '#4caf50',
      'en_curso': '#2196f3',
      'completada': '#9c27b0',
      'cancelada': '#f44336'
    };
    return colors[estado] || '#757575';
  };

  // Icono por estado
  const getStatusIcon = (estado) => {
    const icons = {
      'pendiente': '⏳',
      'confirmada': '✅',
      'en_curso': '⚽',
      'completada': '🏁',
      'cancelada': '❌'
    };
    return icons[estado] || '📅';
  };

  // Renderizar días del calendario
  const renderCalendarDays = () => {
    const days = [];

    // Días del mes anterior (vacíos)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`prev-${i}`} className="p-2"></div>);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayReservas = getReservasForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.02 }}
          className={`p-2 border rounded-lg min-h-32 bg-white ${
            isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          {/* Número del día */}
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              isToday ? 'text-blue-600' : 'text-gray-700'
            }`}>
              {day}
            </span>
            {isToday && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded text-[10px]">
                Hoy
              </span>
            )}
          </div>

          {/* Lista de reservas del día */}
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {dayReservas.slice(0, 4).map((reserva, index) => (
              <Tooltip 
                key={index}
                title={
                  <Box>
                    <Typography variant="body2">
                      <strong>{reserva.cancha?.nombre}</strong>
                    </Typography>
                    <Typography variant="caption">
                      {reserva.hora_inicio?.slice(0,5)} - {reserva.hora_fin?.slice(0,5)}
                    </Typography>
                    <br />
                    <Typography variant="caption">
                      {reserva.usuario?.nombre} {reserva.usuario?.apellido}
                    </Typography>
                  </Box>
                }
                arrow
              >
                <div
                  className="text-xs p-1 rounded text-white cursor-pointer truncate"
                  style={{ backgroundColor: getStatusColor(reserva.estado) }}
                  onClick={() => onReservaClick(reserva)}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">{getStatusIcon(reserva.estado)}</span>
                    <span className="truncate">
                      {reserva.hora_inicio?.slice(0,5)} {reserva.cancha?.nombre}
                    </span>
                  </div>
                </div>
              </Tooltip>
            ))}
            {dayReservas.length > 4 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayReservas.length - 4} más
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-4">
        {/* Header del calendario */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <Typography variant="h5" className="font-title text-primary">
              {currentDate.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
              }).toUpperCase()}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Vista de calendario por espacios deportivos
            </Typography>
          </div>

          {/* Controles de navegación */}
          <div className="flex items-center gap-2">
            <Button
              size="small"
              startIcon={<ChevronLeft />}
              onClick={() => navigateMonth(-1)}
              className="text-primary"
            >
              Anterior
            </Button>
            
            <Button
              size="small"
              startIcon={<Today />}
              onClick={() => setCurrentDate(new Date())}
              className="text-primary"
            >
              Hoy
            </Button>
            
            <Button
              size="small"
              endIcon={<ChevronRight />}
              onClick={() => navigateMonth(1)}
              className="text-primary"
            >
              Siguiente
            </Button>
          </div>
        </div>

        {/* Filtro por espacios */}
        <Box className="mb-4">
          <Typography variant="body2" className="font-medium mb-2 text-gray-700">
            Filtrar por espacio:
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="Todos los espacios"
              clickable
              color={selectedEspacio === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedEspacio('all')}
            />
            {espacios.map(espacio => (
              <Chip
                key={espacio.id_espacio_deportivo}
                label={espacio.nombre}
                clickable
                color={selectedEspacio === espacio.id_espacio_deportivo.toString() ? 'primary' : 'default'}
                onClick={() => setSelectedEspacio(espacio.id_espacio_deportivo.toString())}
              />
            ))}
          </div>
        </Box>

        {/* Leyenda de estados */}
        <Box className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Typography variant="body2" className="font-medium mb-2 text-gray-700">
            Leyenda de estados:
          </Typography>
          <div className="flex flex-wrap gap-2">
            {[
              { estado: 'pendiente', label: 'Pendiente' },
              { estado: 'confirmada', label: 'Confirmada' },
              { estado: 'en_curso', label: 'En curso' },
              { estado: 'completada', label: 'Completada' },
              { estado: 'cancelada', label: 'Cancelada' }
            ].map((item) => (
              <div key={item.estado} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: getStatusColor(item.estado) }}
                />
                <Typography variant="caption" className="text-gray-600">
                  {item.label}
                </Typography>
              </div>
            ))}
          </div>
        </Box>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2 bg-gray-100 rounded">
              {day}
            </div>
          ))}
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>

        {/* Resumen */}
        <Box className="mt-4 p-3 bg-primary/5 rounded-lg">
          <Typography variant="body2" className="text-center text-gray-600">
            Mostrando <strong>{filteredReservas.length}</strong> reservas para{' '}
            <strong>
              {selectedEspacio === 'all' 
                ? 'todos los espacios' 
                : espacios.find(e => e.id_espacio_deportivo.toString() === selectedEspacio)?.nombre
              }
            </strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
CalendarView.propTypes = {
  reservas: PropTypes.array.isRequired,
  onReservaClick: PropTypes.func.isRequired,
  espacios: PropTypes.array.isRequired
};

export default CalendarView;