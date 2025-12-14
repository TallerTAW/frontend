// src/components/reservar/ConfirmacionPagoModal.jsx

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    Button, 
    Typography, 
    Box, 
    CircularProgress,
    Alert
} from '@mui/material';
// 🎯 Usamos el objeto reservasApi de tu archivo reservas.js
import { reservasApi } from '../../api/reservas'; 
import { iniciarPagoLibelula } from '../../api/libelula'; 

export default function ConfirmacionPagoModal({
    open,
    onClose,
    reservaData,
    calcularCostoTotal,
    selectedCoupon,
    totalHours,
    asistentes
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reservaId, setReservaId] = useState(null);

    const total = calcularCostoTotal();

    // 🎯 Lógica Central de Creación y Pago
    const handleConfirmarYPagar = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let actualReservaId = reservaId;

            // 1. Crear la Reserva en el Backend si aún no se ha hecho
            if (!actualReservaId) {
                // Prepara los datos para el backend
                const dataToSend = {
                    ...reservaData,
                    asistentes: asistentes, 
                    cupon_id: selectedCoupon?.id || null, 
                    costo_total: total,
                    // Asegúrate de que los IDs necesarios (cancha_id, usuario_id) estén en reservationData
                };
                
                // Llama al método de tu API de reservas que maneja asistentes
                const nuevaReserva = await reservasApi.crearReservaConAsistentes(dataToSend);
                
                // Asumo que el objeto de respuesta tiene el ID de la reserva como 'id_reserva'
                actualReservaId = nuevaReserva.id_reserva; 
                setReservaId(actualReservaId); // Guarda el ID para posibles reintentos
            }
            
            // 2. Iniciar el Proceso de Pago con Libélula
            const urlRedireccion = await iniciarPagoLibelula(actualReservaId);
            
            // 3. Redirigir al usuario a la pasarela de Libélula (Sale del Frontend)
            window.location.href = urlRedireccion;
            
        } catch (err) {
            console.error("Fallo completo del proceso de reserva y pago:", err);
            // Capturamos el mensaje de error para mostrarlo al usuario
            setError(err.message || "Error desconocido al intentar procesar la reserva y pago.");
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError(null);
            setReservaId(null);
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="sm" 
            fullWidth
            sx={{ '& .MuiDialog-paper': { borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', p: 2 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', color: '#1a237e', pb: 1, fontSize: '1.5rem' }}>
                Confirmar Reserva
            </DialogTitle>
            
            <DialogContent dividers>
                <Typography variant="body1" mb={2}>
                    Revisa los detalles finales antes de proceder al pago:
                </Typography>

                <Box sx={{ bgcolor: '#f5f5f5', p: 3, borderRadius: 2, border: '1px solid #eee' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        Cancha: <span style={{ fontWeight: 'normal' }}>{reservaData.cancha_nombre || reservaData.cancha_id}</span>
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                        Fecha: <span style={{ fontWeight: 'normal' }}>{reservaData.fecha_reserva}</span>
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                        Horario: <span style={{ fontWeight: 'normal' }}>{reservaData.hora_inicio} - {reservaData.hora_fin} ({totalHours} hrs)</span>
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" mt={1}>
                        Asistentes: <span style={{ fontWeight: 'normal' }}>{reservaData.cantidad_asistentes}</span>
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" mt={2} color="#0f9fe1">
                        Total a Pagar: <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>${total.toFixed(2)}</span>
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mt: 3, borderRadius: 1 }}>
                        {error}
                    </Alert>
                )}
                
            </DialogContent>
            
            <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                <Button 
                    onClick={handleClose} 
                    disabled={loading} 
                    variant="outlined" 
                    sx={{ color: '#757575', borderColor: '#bdbdbd' }}
                >
                    CANCELAR
                </Button>
                <Button
                    onClick={handleConfirmarYPagar}
                    disabled={loading}
                    variant="contained"
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                        background: 'linear-gradient(135deg, #0f9fe1 0%, #9eca3f 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #0d8dc7 0%, #8ab637 100%)' },
                        py: 1.5,
                        px: 3,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                    }}
                >
                    {loading ? (reservaId ? 'Redirigiendo...' : 'Creando Reserva...') : 'CONFIRMAR Y PAGAR'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}