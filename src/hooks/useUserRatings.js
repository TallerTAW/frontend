// 📍 ARCHIVO: src/hooks/useUserRatings.js (CORREGIDO: Eliminando loop infinito)


import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
// Nota: Asumo que estos imports son correctos para tu proyecto
import { reservasApi } from '../api/reservas';
import { comentariosApi } from '../api/comentarios';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gestionar los comentarios del usuario y las reservas pendientes de calificar.
 * Centraliza la lógica de carga, creación, actualización y eliminación de forma estable.
 */
export const useUserRatings = () => {
    const { profile } = useAuth();
    const [comentarios, setComentarios] = useState([]);
    const [reservasPendientes, setReservasPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    // Este loading está separado para usarlo en Reservations.jsx si es necesario, pero es parte de la misma carga inicial
    const [loadingReservas, setLoadingReservas] = useState(false); 

    // --- Funciones de Utilidad y Lógica ---
    
    // Función de utilidad para verificar si una cancha (por ID) ya tiene un rating en una lista de comentarios.
    // Es estable y no depende del estado 'comentarios' del hook, solo de los argumentos.
    const checkHasRating = useCallback((canchaId, commentsList, currentUserId) => {
        return commentsList.some(c => c.id_cancha === canchaId && c.id_usuario === currentUserId);
    }, []); 

    // 1. Función principal para cargar todos los datos de golpe (ROMPE EL LOOP)
    const fetchInitialData = useCallback(async () => {
        if (!profile) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadingReservas(true);
        
        try {
            // --- 1.1 Cargar Comentarios ---
            let comentariosData = [];
            
            if (profile.rol === 'admin') {
                // Si es admin, carga todos los comentarios (asumiendo que existe getAll)
                // O usar el endpoint genérico si getAll falla
                comentariosData = await comentariosApi.getAll(); 
            } else {
                // Cliente: obtener solo sus comentarios.
                comentariosData = await comentariosApi.getByUsuario(profile.id_usuario); 
            }
            
            setComentarios(comentariosData); // Actualiza el estado de comentarios

            // --- 1.2 Cargar y filtrar Reservas (solo si es cliente) ---
            if (profile.rol !== 'admin') {
                const reservasData = await reservasApi.getByUsuario(profile.id_usuario);
                
                // Aplicar el filtro usando los 'comentariosData' recién cargados (NO el estado obsoleto).
                const completadasYPendientes = reservasData.filter(reserva => {
                    const isCompleted = reserva.estado === 'completada' || reserva.estado === 'confirmada';
                    
                    // Usamos la función de utilidad con los datos frescos (comentariosData)
                    const hasComment = checkHasRating(reserva.id_cancha, comentariosData, profile.id_usuario); 
                    
                    return isCompleted && !hasComment;
                });

                setReservasPendientes(completadasYPendientes);
            } else {
                setReservasPendientes([]); // Admin no tiene reservas pendientes
            }

        } catch (error) {
            console.error('Error al cargar datos de ratings:', error);
            // Mensaje de error más genérico para no exponer detalles de la API
            toast.error('Ocurrió un error al cargar la información de calificaciones.'); 
            setComentarios([]);
            setReservasPendientes([]);
        } finally {
            setLoading(false);
            setLoadingReservas(false);
        }
    }, [profile, checkHasRating]); // fetchInitialData solo depende de 'profile' y una función estable ('checkHasRating')

    
    // 2. Función para manejar la creación/actualización (llama a fetchInitialData para recargar)
    const handleSaveRating = useCallback(async (reserva, ratingValue, descripcion) => {
        if (!profile || ratingValue === 0) return;

        try {
            const commentData = {
                descripcion: descripcion,
                calificacion: ratingValue,
                id_usuario: profile.id_usuario, // Usamos id_usuario consistente
                id_cancha: reserva.id_cancha,
            };

            const existingComment = comentarios.find(c => 
                c.id_cancha === reserva.id_cancha && c.id_usuario === profile.id_usuario
            );
            
            let resultado;
            if (existingComment) {
                // Asumo que existe el método update
                resultado = await comentariosApi.update(existingComment.id_comentario, commentData);
                toast.success('Calificación actualizada correctamente');
            } else {
                // Asumo que existe el método create
                resultado = await comentariosApi.create(commentData);
                toast.success('Calificación enviada correctamente');
            }

            // Recarga todos los datos para asegurar la consistencia y eliminar de la lista de pendientes.
            await fetchInitialData(); 
            
            return true;

        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al guardar la calificación');
            console.error('Error:', error);
            return false;
        }
    }, [profile, comentarios, fetchInitialData]); // Depende de comentarios, pero no afecta al loop principal.
    
    
    // 3. Función para eliminar comentario (llama a fetchInitialData para recargar)
    const handleDeleteComment = useCallback(async (comentarioId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            try {
                // Asumo que existe el método delete
                await comentariosApi.delete(comentarioId); 
                toast.success('Comentario eliminado correctamente');
                await fetchInitialData(); 
                return true;
            } catch (error) {
                toast.error('Error al eliminar comentario');
                return false;
            }
        }
        return false;
    }, [fetchInitialData]);

    // Función para ser usada en el frontend (para revisar si un rating existe en el estado actual)
    const hasRating = useCallback((canchaId) => {
        if (!profile) return false;
        // Esta función usa el estado 'comentarios'
        return comentarios.some(c => c.id_cancha === canchaId && c.id_usuario === profile.id_usuario);
    }, [comentarios, profile]); 


    // --- Efecto Principal (Simple) ---
    // Solo depende de 'profile' y la función de carga principal (que es estable por useCallback).
    useEffect(() => {
        fetchInitialData();
    }, [profile, fetchInitialData]);

    return {
        comentarios,
        reservasPendientes,
        loading,
        loadingReservas,
        fetchInitialData,
        handleSaveRating,
        handleDeleteComment,
        hasRating,
    };
};