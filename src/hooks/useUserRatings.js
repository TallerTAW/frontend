// 📍 ARCHIVO: src/hooks/useUserRatings.js (CORREGIDO)

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservasApi } from '../api/reservas';
import { comentariosApi } from '../api/comentarios';
import { toast } from 'react-toastify';

export const useUserRatings = () => {
    const { profile } = useAuth();
    const [comentarios, setComentarios] = useState([]);
    const [reservasPendientes, setReservasPendientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReservas, setLoadingReservas] = useState(false);

    // Función para cargar reservas pendientes (EXPORTADA)
    const fetchReservasPendientes = useCallback(async () => {
        if (!profile || profile.rol === 'admin') {
            setReservasPendientes([]);
            return;
        }

        setLoadingReservas(true);
        try {
            const reservasData = await reservasApi.getByUsuario(profile.id_usuario || profile.id);
            const comentariosData = await comentariosApi.getByUsuario(profile.id_usuario || profile.id);
            
            const completadasYPendientes = reservasData.filter(reserva => {
                const isCompleted = reserva.estado === 'completada' || reserva.estado === 'confirmada';
                const hasComment = comentariosData.some(c => 
                    c.id_cancha === reserva.id_cancha && 
                    c.id_usuario === (profile.id_usuario || profile.id)
                );
                return isCompleted && !hasComment;
            });

            setReservasPendientes(completadasYPendientes);
        } catch (error) {
            console.error('Error al cargar reservas pendientes:', error);
            setReservasPendientes([]);
        } finally {
            setLoadingReservas(false);
        }
    }, [profile]);

    // Función principal para cargar datos iniciales
    const fetchInitialData = useCallback(async () => {
        if (!profile) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let comentariosData = [];
            
            if (profile.rol === 'admin') {
                comentariosData = await comentariosApi.getAll();
            } else {
                comentariosData = await comentariosApi.getByUsuario(profile.id_usuario || profile.id);
            }
            
            setComentarios(comentariosData);

            // Cargar reservas pendientes también
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

    // Resto de funciones (handleSaveRating, handleDeleteComment, etc.)...
    const handleSaveRating = useCallback(async (reserva, ratingValue, descripcion) => {
        if (!profile || ratingValue === 0) return;

        try {
            const commentData = {
                descripcion: descripcion,
                calificacion: ratingValue,
                id_usuario: profile.id_usuario || profile.id,
                id_cancha: reserva.id_cancha,
            };

            const existingComment = comentarios.find(c => 
                c.id_cancha === reserva.id_cancha && 
                c.id_usuario === (profile.id_usuario || profile.id)
            );
            
            let resultado;
            if (existingComment) {
                resultado = await comentariosApi.update(existingComment.id_comentario, commentData);
                toast.success('Calificación actualizada correctamente');
            } else {
                resultado = await comentariosApi.create(commentData);
                toast.success('Calificación enviada correctamente');
            }

            await fetchInitialData();
            return true;

        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al guardar la calificación');
            console.error('Error:', error);
            return false;
        }
    }, [profile, comentarios, fetchInitialData]);

    const handleDeleteComment = useCallback(async (comentarioId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            try {
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

    const hasRating = useCallback((canchaId) => {
        if (!profile) return false;
        return comentarios.some(c => 
            c.id_cancha === canchaId && 
            c.id_usuario === (profile.id_usuario || profile.id)
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
        fetchReservasPendientes, // ✅ AHORA ESTÁ EXPORTADA
        handleSaveRating,
        handleDeleteComment,
        hasRating,
    };
};