import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Avatar, 
    Box 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Si usas AuthContext para el perfil del usuario
import { useContent } from '../hooks/useContent';

// === PALETA DE COLORES Y TIPOGRAFÍA ===
const COLOR_AZUL_ELECTRICO = '#00BFFF'; // Primary
const COLOR_VERDE_LIMA = '#A2E831';    // Secondary / Highlight
const COLOR_NARANJA_VIBRANTE = '#FD7E14'; // Accent / Highlight
const COLOR_GRIS_OSCURO = '#333333';   // Background/Text Dark
const COLOR_BLANCO = '#FFFFFF';        // Text Light

export default function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const { profile } = useAuth(); // Obtener el perfil del usuario
    const { content, loading, error } = useContent();
    const logoUrl = content.header_logo || '/static/uploads/team.jpg';

    // Función para obtener la inicial del nombre de usuario
    const getInitials = (name) => {
        if (!name) return 'A'; // 'A' por defecto si no hay nombre
        return name.charAt(0).toUpperCase();
    };

    const handleAvatarClick = () => {
        // Redirige al perfil del usuario o a una página de configuración
        navigate('/profile'); 
    };

    return (
        <AppBar 
            position="fixed" // Permite que el header se quede arriba
            sx={{
                // El degradado que ya tienes, ajustado para mayor impacto
                background: `linear-gradient(90deg, ${COLOR_AZUL_ELECTRICO} 0%, ${COLOR_VERDE_LIMA} 50%, ${COLOR_NARANJA_VIBRANTE} 100%)`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', // Sombra más pronunciada
                zIndex: (theme) => theme.zIndex.drawer + 1, // Asegura que esté por encima del sidebar
                transition: 'background 0.3s ease-in-out', // Transición suave si el fondo cambia
            }}
        >
            <Toolbar sx={{ 
                justifyContent: 'space-between', 
                minHeight: { xs: '56px', sm: '64px' } // Altura estándar de Toolbar
            }}>
                {/* Botón de Menú (para sidebars colapsables o móviles) */}
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    sx={{ mr: 2, display: { md: 'none' } }} // Ocultar en pantallas grandes si el sidebar siempre está visible
                    onClick={onMenuClick} // Prop para manejar el clic y abrir el sidebar
                >
                    <MenuIcon />
                </IconButton>

                {/* Título y Logo de la Aplicación */}
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <Typography
                        variant="h4"
                        component="div"
                        sx={{
                            mr: 1,
                            color: COLOR_BLANCO,
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.4)', // Sombra de texto para el logo
                        }}
                    >
                        <img src={logoUrl} alt="Logo" style={{ width: '80px', height: 'auto', padding: '2px', borderRadius: '15px' }} />
                    </Typography>
                </Box>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 'bold',
                        color: COLOR_BLANCO,
                        textShadow: '1px 1px 3px rgba(0,0,0,0.3)', // Sombra de texto sutil
                        cursor: 'pointer', // Para hacer el logo clicable si lleva a /dashboard o /home
                        ml: { xs: 0, sm: 2 } // Espacio a la izquierda
                    }}
                    onClick={() => navigate('/dashboard')} // O a '/'
                >
                    OlympiaHub
                </Typography>
                {profile && profile.nombre && (
                    <Typography variant="body2" sx={{ color: COLOR_BLANCO, mr: 2, fontSize: '2rem ' }}>
                        {profile.nombre} {profile.apellido}
                    </Typography>
                )}

                {/* Avatar del Usuario */}
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                    <Avatar 
                        sx={{ 
                            bgcolor: COLOR_BLANCO, 
                            color: COLOR_GRIS_OSCURO, 
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', // Sombra para el avatar
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.1)',
                            }
                        }}
                    >
                        {getInitials(profile?.nombre || 'Administrador')} {/* Usa el nombre del perfil o 'A' por defecto */}
                    </Avatar>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}