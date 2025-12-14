// src/pages/PaymentStatus.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import { Box, Typography, Alert, Button, CircularProgress, Card } from '@mui/material';
import { verificarEstadoPago } from '../api/libelula'; 

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verificando'); 
    const [message, setMessage] = useState('Verificando el estado de tu pago...');
    const pagoId = searchParams.get('pago_id'); // ID de nuestro registro de PagoLibelula
    const navigate = useNavigate();

    useEffect(() => {
        if (!pagoId) {
            setStatus('error');
            setMessage('Fallo en el pago: ID de transacción de retorno no encontrado.');
            return;
        }

        const checkStatus = async () => {
            try {
                // Llama al endpoint de verificación de estado en nuestro backend
                const result = await verificarEstadoPago(pagoId); 
                
                if (result.estado === 'COMPLETADO') {
                    setStatus('success');
                    setMessage('¡Reserva Confirmada! Tu pago ha sido exitoso. Te hemos enviado un correo de confirmación.');
                } else {
                    setStatus('failure');
                    setMessage(`El pago no se pudo completar. Estado: ${result.estado}. Por favor, inténtalo de nuevo.`);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Error del servidor al verificar el pago. Por favor, contacta a soporte.');
            }
        };

        // Dar un pequeño delay (ej. 2 segundos) para asegurar que el Webhook 
        // del Backend ya actualizó el estado del pago antes de verificar
        setTimeout(checkStatus, 2000); 

    }, [pagoId]);

    const getStatusColor = () => {
        if (status === 'success') return 'success';
        if (status === 'failure') return 'warning';
        return 'error';
    };

    return (
        <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" mb={4} color="primary">
                Estado de la Transacción
            </Typography>
            
            <Card sx={{ maxWidth: 500, margin: '0 auto', p: 4, boxShadow: 5, borderRadius: 2 }}>
                {status === 'verificando' ? (
                    <Box>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography>{message}</Typography>
                    </Box>
                ) : (
                    <Alert 
                        severity={getStatusColor()} 
                        variant="filled" 
                        sx={{ mb: 3, fontSize: '1.1rem', fontWeight: 'medium' }}
                    >
                        {status === 'success' ? 'Éxito' : (status === 'failure' ? 'Fallo' : 'Error')}
                    </Alert>
                )}

                <Typography variant="body1" mb={3}>{message}</Typography>
                
                <Button 
                    onClick={() => navigate(status === 'success' ? '/dashboard' : '/reservar')}
                    variant="contained"
                    fullWidth
                    sx={{ py: 1.5, fontWeight: 'bold' }}
                >
                    {status === 'success' ? 'Ver mis Reservas' : 'Volver a Reservar'}
                </Button>
            </Card>
        </Box>
    );
};

export default PaymentStatus;