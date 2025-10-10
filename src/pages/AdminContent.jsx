// frontend/src/pages/AdminContent.jsx

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Grid } from '@mui/material';
// 🚨 Importar el hook de contenido y el hook de autenticación (para el rol)
import { useContent } from '../context/ContentContext'; 
// Asumo que tienes una forma de mostrar notificaciones (toast)
import { toast } from 'react-toastify'; 

// Lista de claves que quieres permitir editar y su descripción
const EDITABLE_KEYS = [
    { key: 'hero_title', label: 'Título Principal (Hero)', type: 'text' },
    { key: 'about_us_text', label: 'Párrafo de Quiénes Somos', type: 'textarea' },
    { key: 'hero_image_url', label: 'URL Imagen Principal', type: 'url' },
    // Agrega aquí todas las claves que desees editar
    { key: 'mision_text', label: 'Texto de Misión', type: 'textarea' },
    { key: 'services_text', label: 'Título de la Sección Servicios', type: 'text' },
    { key: 'vision_text', label: 'Texto de Visión', type: 'textarea' },
    { key: 'objectives_list', label: 'Lista de Objetivos (Separar por nueva línea)', type: 'textarea' },
    { key: 'ball_graphic_url', label: 'URL Imagen Gráfico (Pelota)', type: 'url' },

];

export default function AdminContent() {
    const { content, updateContentAndState, isLoading } = useContent();
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Usamos el estado local para los campos del formulario
    const [formContent, setFormContent] = useState({});

    // Cargar los valores iniciales en el formulario una vez que el contenido se carga
    React.useEffect(() => {
        if (!isLoading && Object.keys(content).length > 0) {
            // Inicializar el formulario con los valores actuales del contexto
            setFormContent(content); 
        }
    }, [isLoading, content]);

    const handleChange = (key, value) => {
        setFormContent(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (key) => {
        const newValue = formContent[key];
        
        if (!newValue || newValue === content[key]) {
            toast.warn('El valor no ha cambiado.', { autoClose: 1500 });
            return;
        }

        setIsSubmitting(true);
        
        // Llama a la función del contexto que actualiza la BD y el estado
        const result = await updateContentAndState(key, newValue); 

        if (result.success) {
            toast.success('¡Contenido actualizado con éxito!', { autoClose: 2000 });
        } else {
            toast.error(`Error: ${result.message}`, { autoClose: 5000 });
        }

        setIsSubmitting(false);
    };

    if (isLoading) {
        return <Container><Typography>Cargando datos de administración...</Typography></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Gestor de Contenido del Sitio Web
            </Typography>
            <Alert severity="info" sx={{ mb: 4 }}>
                Los cambios realizados aquí se reflejan inmediatamente en la página principal.
            </Alert>

            <Grid container spacing={3}>
                {EDITABLE_KEYS.map((field) => (
                    <Grid item xs={12} md={6} key={field.key}>
                        <Box component="form" sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1, color: '#4dc0b5' }}>
                                {field.label} ({field.key})
                            </Typography>
                            <TextField
                                fullWidth
                                multiline={field.type === 'textarea'}
                                rows={field.type === 'textarea' ? 4 : 1}
                                label={field.label}
                                value={formContent[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                margin="normal"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSubmit(field.key)}
                                disabled={isSubmitting || formContent[field.key] === content[field.key]}
                                sx={{ mt: 2 }}
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambio'}
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}