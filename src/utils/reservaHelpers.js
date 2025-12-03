// Formatea una hora a formato completo (HH:00)
export const formatHourToFull = (timeString) => {
  if (!timeString) return '';
  const [hours] = timeString.split(':');
  return `${hours}:00`;
};

// Genera horas disponibles entre apertura y cierre
export const getAvailableHours = (horaApertura, horaCierre) => {
  const start = parseInt(horaApertura);
  const end = parseInt(horaCierre);
  const hours = [];
  
  for (let i = start; i < end; i++) {
    hours.push(i.toString().padStart(2, '0'));
  }
  
  return hours;
};

// Calcula la diferencia en horas entre dos horas
export const calculateTimeDifference = (horaInicio, horaFin) => {
  const start = parseInt(horaInicio.split(':')[0]);
  const end = parseInt(horaFin.split(':')[0]);
  return end - start;
};

// Obtiene bloques horarios ocupados basados en los horarios disponibles
export const getOcupiedTimeBlocks = (horariosDisponibles) => {
  if (!Array.isArray(horariosDisponibles) || horariosDisponibles.length === 0) {
    return [];
  }
  
  const occupiedBlocks = [];
  let currentBlock = null;
  
  horariosDisponibles.forEach((slot, index) => {
    if (!slot.disponible) {
      if (!currentBlock) {
        // Inicio de un nuevo bloque ocupado
        currentBlock = {
          start: slot.hora_inicio,
          end: slot.hora_inicio // temporal, se actualizará
        };
      }
      // Continuamos el bloque actual
      currentBlock.end = slot.hora_inicio;
    } else if (currentBlock) {
      // Fin de un bloque ocupado
      // Convertimos la hora de fin (ej: "09:00" -> "10:00")
      const endHour = parseInt(currentBlock.end.split(':')[0]) + 1;
      currentBlock.end = endHour.toString().padStart(2, '0') + ':00';
      occupiedBlocks.push(currentBlock);
      currentBlock = null;
    }
  });
  
  // Si termina con un bloque ocupado
  if (currentBlock) {
    const endHour = parseInt(currentBlock.end.split(':')[0]) + 1;
    currentBlock.end = endHour.toString().padStart(2, '0') + ':00';
    occupiedBlocks.push(currentBlock);
  }
  
  return occupiedBlocks;
};

// Verifica si una hora específica está disponible para inicio
export const isHoraInicioDisponible = (hora, horariosDisponibles, ocupiedBlocks) => {
  if (!hora) return true;
  
  const horaFormateada = formatHourToFull(hora);
  
  // Verificar en los horarios disponibles
  const slot = horariosDisponibles.find(s => s.hora_inicio === horaFormateada);
  if (!slot || !slot.disponible) return false;
  
  // Verificar que no sea el inicio de un bloque ocupado
  const esInicioOcupado = ocupiedBlocks.some(block => block.start === horaFormateada);
  
  return !esInicioOcupado;
};

// Verifica si una hora específica está disponible para fin
export const isHoraFinDisponible = (hora, horariosDisponibles, ocupiedBlocks) => {
  if (!hora) return true;
  
  const horaFormateada = formatHourToFull(hora);
  
  // Verificar que no sea el fin de un bloque ocupado
  const esFinOcupado = ocupiedBlocks.some(block => block.end === horaFormateada);
  
  // Para hora fin, también necesitamos verificar que la hora anterior esté disponible
  // si estamos justo después de un bloque ocupado
  if (esFinOcupado) {
    return false;
  }
  
  // Verificar que la hora exista en los horarios disponibles
  const slot = horariosDisponibles.find(s => s.hora_inicio === horaFormateada);
  return !!slot;
};

// Filtra horas disponibles para inicio
export const getHorasInicioDisponibles = (horariosDisponibles, ocupiedBlocks) => {
  if (!Array.isArray(horariosDisponibles)) return [];
  
  return horariosDisponibles
    .filter(slot => slot.disponible)
    .filter(slot => {
      const esInicioOcupado = ocupiedBlocks.some(block => block.start === slot.hora_inicio);
      return !esInicioOcupado;
    })
    .map(slot => slot.hora_inicio);
};

// Filtra horas disponibles para fin
export const getHorasFinDisponibles = (horariosDisponibles, ocupiedBlocks, horaInicioSeleccionada) => {
  if (!Array.isArray(horariosDisponibles) || !horaInicioSeleccionada) return [];
  
  const horaInicioNum = parseInt(horaInicioSeleccionada.split(':')[0]);
  
  return horariosDisponibles
    .filter(slot => {
      // Filtrar solo horas después de la hora de inicio
      const horaSlotNum = parseInt(slot.hora_inicio.split(':')[0]);
      return horaSlotNum > horaInicioNum;
    })
    .filter(slot => {
      // Verificar que no sea el fin de un bloque ocupado
      const esFinOcupado = ocupiedBlocks.some(block => block.end === slot.hora_inicio);
      return !esFinOcupado;
    })
    .map(slot => slot.hora_inicio);
};