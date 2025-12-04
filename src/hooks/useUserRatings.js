import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../api/reservas';
import { comentariosApi } from '../api/comentarios';
import { toast } from 'react-toastify';

// Helper: Comprueba si la reserva ya terminó
const isReservationPastDue = (reserva) => {
    // 1. Crear un objeto Date con la fecha de la reserva (solo día/mes/año)
    const fechaReserva = new Date(reserva.fecha_reserva);
    
    // 2. Extraer la hora de fin de la reserva (formato "HH:MM:SS")
    const [hours, minutes] = reserva.hora_fin.split(':').map(Number);
    
    // 3. Crear el objeto Date completo de finalización de la reserva
    const fechaFinReserva = new Date(
        fechaReserva.getFullYear(), 
        fechaReserva.getMonth(), 
        fechaReserva.getDate(), 
        hours, 
        minutes
    );
    
    // 4. Comparar con la hora actual
    const ahora = new Date();
    
    // La reserva es 'Past Due' (Pasada) si la hora actual es posterior a la hora de fin.
    return ahora > fechaFinReserva;
};

export const useUserRatings = () => {
    const { profile } = useAuth();
    const [comentarios, setComentarios] = useState([]);
    const [reservasPendientes, setReservasPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReservas, setLoadingReservas] = useState(false);

    // Función para cargar reservas pendientes
    const fetchReservasPendientes = useCallback(async () => {
        if (!profile || profile.rol === 'admin') {
            setReservasPendientes([]);
            return;
        }

        setLoadingReservas(true);
        const userId = profile.id_usuario || profile.id;

        try {
            // Obtenemos todos los datos relevantes
            const reservasData = await reservasApi.getByUsuario(userId);
            const comentariosData = await comentariosApi.getByUsuario(userId);
            
            // Filtramos las reservas que cumplen TODAS las condiciones:
            const completadasYPendientes = reservasData.filter(reserva => {
                const isCompleted = reserva.estado === 'completada' || reserva.estado === 'confirmada';
                
                // 1. Verificar que la reserva ya terminó (CORRECCIÓN CLAVE)
                const isPastDue = isReservationPastDue(reserva); 
                
                // 2. Verificar que NO exista un comentario para esa CANCHA por el usuario
                const hasComment = comentariosData.some(c => 
                    c.id_cancha === reserva.id_cancha && 
                    c.id_usuario === userId
                );

                // Condición final: estado OK && hora ya pasó && NO tiene comentario
                return isCompleted && isPastDue && !hasComment; 
            });

            setReservasPendientes(completadasYPendientes);
        } catch (error) {
            console.error('Error al cargar reservas pendientes:', error);
            setReservasPendientes([]);
        } finally {
            setLoadingReservas(false);
        }
    }, [profile]);

    // Función principal para cargar el historial de comentarios y las pendientes
    const fetchInitialData = useCallback(async () => {
        if (!profile) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let comentariosData = [];
            const userId = profile.id_usuario || profile.id;
    
            if (profile.rol === 'admin') {
                comentariosData = await comentariosApi.getAll();
            } else {
                comentariosData = await comentariosApi.getByUsuario(userId);
            }
          
            setComentarios(comentariosData);

            // Cargar reservas pendientes (llamando a la función que usa los datos recién obtenidos)
            await fetchReservasPendientes();

        } catch (error) {
            console.error('Error al cargar datos de ratings:', error);
            toast.error('Ocurrió un error al cargar la información de calificaciones.');
        
            setComentarios([]);
            setReservasPendientes([]);
        } finally {
            setLoading(false);
        }
    }, [profile, fetchReservasPendientes]);

    // Función para guardar/actualizar calificación
    const handleSaveRating = useCallback(async (reserva, ratingValue, descripcion) => {
        if (!profile || ratingValue === 0) return;

        try {
            const userId = profile.id_usuario || profile.id;
            const commentData = {
                descripcion: descripcion,
                calificacion: ratingValue,
                id_usuario: userId,
                id_cancha: reserva.id_cancha,
            };

            const existingComment = comentarios.find(c => 
                c.id_cancha === reserva.id_cancha && 
                c.id_usuario === userId
            );
            
            let resultado;
            if (existingComment) {
                resultado = await comentariosApi.update(existingComment.id_comentario, commentData);
                toast.success('Calificación actualizada correctamente');
            } else {
                resultado = await comentariosApi.create(commentData);
                toast.success('Calificación enviada correctamente');
            }

            await fetchInitialData(); // Refresca las dos listas
            return true;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al guardar la calificación');
            console.error('Error:', error);
            return false;
        }
    }, [profile, comentarios, fetchInitialData]);

    // Función para eliminar comentario
    const handleDeleteComment = useCallback(async (comentarioId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            try {
                await comentariosApi.delete(comentarioId);
                toast.success('Comentario eliminado correctamente');
                await fetchInitialData(); // Refresca las dos listas
            
                return true;
            } catch (error) {
                toast.error('Error al eliminar comentario');
                return false;
            }
        }
        return false;
    }, [fetchInitialData]);

    // Función para verificar si ya existe un rating para una cancha
    const hasRating = useCallback((canchaId) => {
        if (!profile) return false;
        const userId = profile.id_usuario || profile.id;
        return comentarios.some(c => 
            c.id_cancha === canchaId && 
            c.id_usuario === userId
        );
    }, [comentarios, profile]);

    // Efecto principal
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return {
        comentarios,
        reservasPendientes,
        loading,
        loadingReservas,
        fetchReservasPendientes,
        handleSaveRating,
        handleDeleteComment,
        hasRating,
    };
};