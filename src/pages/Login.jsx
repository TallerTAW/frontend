import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Container,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    CircularProgress 
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// === COLORES DE LA PALETA DEFINIDA ===
const COLOR_PRIMARY = '#00BFFF';     // Azul Eléctrico
const COLOR_DARK = '#333333';        // Gris Oscuro 
const COLOR_LIGHT = '#FFFFFF';       // Blanco
const COLOR_ACCENT_RED = '#FD7E14';  // Naranja/Rojo
const COLOR_LIME = '#A2E831';        // Verde Lima

export default function Login() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // --- LÓGICA DE AUTENTICACIÓN Y RECAPTCHA ---
    const [recaptchaVerified, setRecaptchaVerified] = useState(false);
    const { signIn, clearError } = useAuth(); 
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);
    // --- ESTADOS DE NOTIFICACIÓN ---
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');
    // -------------------------------

    // Lógica para cerrar la notificación
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    // Lógica para el reCAPTCHA
    const handleRecaptchaChange = (token) => {
        // Establece el estado a verdadero si hay un token, falso si se resetea (null)
        setRecaptchaVerified(!!token);
    };

    // Lógica para mostrar/ocultar contraseña
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    // FUNCIÓN PRINCIPAL DE INICIO DE SESIÓN
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSnackbarMessage('');
        clearError(); 

        // 1. Validaciones de campos
        if (!email || !password) {
            setSnackbarMessage('Por favor, ingresa tu email y contraseña.');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }

        // 2. Validación de CAPTCHA
        if (!recaptchaVerified) {
            setSnackbarMessage('Por favor, verifica que no eres un robot marcando el CAPTCHA.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }

        setIsLoading(true);
        try {
            // Obtiene el token del CAPTCHA
            const token = recaptchaRef.current.getValue();
            if (!token) {
                 // Esto no debería pasar si recaptchaVerified es true, pero es un buen guardrail
                throw new Error('Token reCAPTCHA no disponible.');
            }

            // Llama a la función de autenticación
            const result = await signIn(email, password, token);
            // Resetea el CAPTCHA después de cada intento de login para forzar una nueva verificación
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setRecaptchaVerified(false);
            }

            if (result && result.error) { 
                // Manejo de errores del backend
                let errorSeverity = 'error';
                if (result.type === 'inactive') {
                    errorSeverity = 'warning';
                }
                
                setSnackbarMessage(result.error);
                setSnackbarSeverity(errorSeverity); 
                setOpenSnackbar(true);
                
            } else {
                // Login exitoso
                setSnackbarMessage('¡Inicio de sesión exitoso! Redirigiendo...');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                
                // Redirige después de un breve delay
                setTimeout(() => {
                    navigate('/dashboard'); 
                }, 1500);
            }

        } catch (err) {
            console.error('Error durante el proceso de login:', err);
            setSnackbarMessage(`Error inesperado: ${err.message}.`);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            
             // Asegura que se resetea el captcha en caso de error inesperado
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setRecaptchaVerified(false);
            }

        } finally {
            setIsLoading(false);
        }
    };
    
    // Función para volver a la página principal
    const handleGoHome = () => {
        navigate('/');
    };

    // Estilos compartidos para los campos de texto
    const inputStyles = {
        // Fondo ligeramente transparente para los campos de texto
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        borderRadius: 1,
        
        '& .MuiOutlinedInput-root': {
            color: COLOR_LIGHT, 
            '& fieldset': { 
                borderColor: COLOR_PRIMARY 
            },
            '&:hover fieldset': { borderColor: COLOR_LIME },
            '&.Mui-focused fieldset': { 
                borderColor: COLOR_LIME,
                borderWidth: '2px',
            },
        },
        '& .MuiInputLabel-root': {
            color: COLOR_LIGHT,
            '&.Mui-focused': {
                color: COLOR_LIME,
            },
        },
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Asegúrate de que esta URL de fondo es correcta
                backgroundImage: 'url(/static/uploads/cancha-login.jpg)', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // Ajuste de padding para móviles y escritorio
                padding: { xs: 2, sm: 4 }, 
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Capa de oscuridad
                }
            }}
        >
            {/* Ajuste: Usar maxWidth="sm" para que en móviles sea más amplio y en tablets/desktop se limite a 400px (el tamaño de xs) */}
            <Container 
                // En móviles, permitimos que el formulario ocupe más espacio
                maxWidth="sm" 
                sx={{ 
                    zIndex: 10,
                    // Limitamos el ancho máximo en pantallas más grandes al tamaño de 'xs' (aprox. 444px)
                    '@media (min-width: 600px)': {
                        maxWidth: '444px' // El ancho de maxWidth="xs" en MUI es 444px
                    }
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        // Reducimos el padding en móviles (xs) y lo mantenemos en desktop (sm/md/lg)
                        p: { xs: 3, sm: 4 }, 
                        borderRadius: 2,
                        backgroundColor: COLOR_DARK, 
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                        textAlign: 'center',
                        color: COLOR_LIGHT
                    }}
                >
                    {/* TÍTULO - Responsivo: h4 en móvil, h3 en desktop */}
                    <Typography 
                        variant="h3" 
                        // Ajuste: variant responsivo
                        sx={{ 
                            color: COLOR_LIME, 
                            fontFamily: 'Montserrat, sans-serif',
                            mb: 1,
                            fontSize: { xs: '2rem', sm: '3rem' } // 2rem en móviles, 3rem en desktop
                        }}
                        fontWeight="bold" 
                        gutterBottom
                    >
                        ¡BIENVENIDO!
                    </Typography>

                    {/* SUBTÍTULO */}
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            mb: 3, 
                            opacity: 0.8,
                            fontFamily: 'Roboto, sans-serif' 
                        }}
                    >
                        Accede y conecta con tu deporte favorito
                    </Typography>

                    {/* CAMPO EMAIL */}
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        required
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: <EmailIcon sx={{ color: COLOR_LIME, mr: 1 }} />,
                        }}
                        sx={inputStyles}
                    />

                    {/* CAMPO CONTRASEÑA */}
                    <TextField
                        label="Contraseña"
                        type={showPassword ? 'text' : 'password'} 
                        fullWidth
                        required
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: <LockIcon sx={{ color: COLOR_LIME, mr: 1 }} />,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <VisibilityOff sx={{ color: COLOR_LIME }} /> : <Visibility sx={{ color: COLOR_LIME }} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            ...inputStyles,
                            mb: 2
                        }}
                    />

                    {/* RECAPTCHA CLÁSICO */}
                    {/* El reCAPTCHA de Google es responsivo por defecto hasta cierto punto.
                       Mantenemos el centrado con flexbox. */}
                    <Box 
                        sx={{ 
                            my: 2, 
                            display: 'flex', 
                            justifyContent: 'center', 
                            py: 1 
                        }}
                    >
                        {/* El reCAPTCHA tiene un ancho mínimo, pero se centrará bien */}
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "TU_SITEKEY_DE_EJEMPLO"}
                            ref={recaptchaRef}
                            onChange={handleRecaptchaChange}
                            theme="dark" // Clave para la integración visual en tema oscuro
                        />
                    </Box>

                    {/* BOTÓN 1: INICIAR SESIÓN */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        // El botón se deshabilita si está cargando O si el CAPTCHA no está verificado
                        disabled={isLoading || !recaptchaVerified} 
                        sx={{
                            mt: 3,
                            mb: 1.5,
                            // Ajuste: Reducimos un poco el padding vertical en móviles
                            py: { xs: 1.5, sm: 1.8 },
                            backgroundColor: COLOR_ACCENT_RED,
                            color: COLOR_LIGHT,
                            fontWeight: 'bold',
                            // Ajuste: Reducimos el tamaño de fuente en móviles
                            fontSize: { xs: '1.1em', sm: '1.2em' },
                            fontFamily: 'Montserrat, sans-serif',
                            '&:hover': {
                                backgroundColor: COLOR_LIME,
                                color: COLOR_DARK,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 5px 15px rgba(162, 232, 49, 0.5)`,
                            },
                            transition: 'all 0.3s ease-in-out',
                            opacity: isLoading || !recaptchaVerified ? 0.7 : 1, // Feedback visual de deshabilitado
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={24} color="inherit" />
                                Iniciando Sesión...
                            </Box>
                        ) : (
                            'INICIAR SESIÓN'
                        )}
                    </Button>
                    
                    {/* BOTÓN 2: VOLVER A INICIO */}
                    <Button
                        onClick={handleGoHome}
                        fullWidth
                        variant="outlined" 
                        disabled={isLoading}
                        sx={{
                            // Ajuste: Reducimos un poco el padding vertical en móviles
                            py: { xs: 1, sm: 1.2 },
                            borderColor: COLOR_PRIMARY, 
                            color: COLOR_PRIMARY, 
                            fontWeight: 'bold',
                            fontFamily: 'Roboto, sans-serif',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 191, 255, 0.1)',
                                borderColor: COLOR_PRIMARY,
                            },
                        }}
                    >
                        VOLVER A INICIO
                    </Button>

                </Box>
            </Container>

            {/* --- SNACKBAR (NOTIFICACIÓN) --- */}
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                // Ajuste: Cambiamos la posición en móvil para mejor visibilidad y evitar solapamiento
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    variant="filled" 
                    sx={{ width: '100%', fontFamily: 'Roboto, sans-serif' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}