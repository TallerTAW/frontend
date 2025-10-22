import React, { useState, useRef } from 'react';
// Asegúrate de que estos módulos estén instalados:
import ReCAPTCHA from 'react-google-recaptcha'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    // Eliminamos 'Checkbox' y 'FormControlLabel'
    Container,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    CircularProgress 
} from '@mui/material';

// Importamos los iconos necesarios
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
    // Eliminamos isRobotChecked
    const { signIn, error: authError, clearError } = useAuth();
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

    // Lógica para el reCAPTCHA (VISIBLE)
    const handleRecaptchaChange = (token) => {
        // Se activa cuando el usuario marca el checkbox de Google
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

        if (!email || !password) {
            setSnackbarMessage('Por favor, ingresa tu email y contraseña.');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }

        if (!recaptchaVerified) {
            setSnackbarMessage('Por favor, verifica que no eres un robot marcando el CAPTCHA.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }

        setIsLoading(true);

        try {
            const token = recaptchaRef.current.getValue();
            if (!token) {
                // Esto debería ser imposible si recaptchaVerified es true, pero es una buena práctica
                throw new Error('No se pudo obtener el token reCAPTCHA.');
            }

            const { error: contextError } = await signIn(email, password, token);
            
            if (contextError) {
                setSnackbarMessage(`Error de Autenticación: ${contextError}`);
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            } else {
                setSnackbarMessage('¡Inicio de sesión exitoso! Redirigiendo...');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                
                // Redirige a la página correspondiente (dashboard)
                navigate('/dashboard'); 
            }

        } catch (err) {
            console.error('Error durante el proceso de login:', err);
            setSnackbarMessage(`Error inesperado: ${err.message}`);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            
            // Siempre reseteamos el captcha después de un fallo
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
        navigate('/'); // Redirige a la ruta raíz
    };
    // --------------------------------------------------------------------------

    // Estilos compartidos para los campos de texto
    const inputStyles = {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 1,
        
        '& .MuiOutlinedInput-root': {
            color: COLOR_LIGHT, 
            '& fieldset': { borderColor: COLOR_PRIMARY },
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
                backgroundImage: 'url(/static/uploads/cancha-login.jpg)', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: 4,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }
            }}
        >
            <Container maxWidth="xs" sx={{ zIndex: 10 }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        backgroundColor: COLOR_DARK, 
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                        textAlign: 'center',
                        color: COLOR_LIGHT
                    }}
                >
                    {/* TÍTULO */}
                    <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{ 
                            color: COLOR_LIME, 
                            fontFamily: 'Montserrat, sans-serif',
                            mb: 1,
                        }}
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

                    {/* RECAPTCHA VISIBLE (WIDGET DE GOOGLE) */}
                    <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                         <Box sx={{ mt: 1 }}>
                             <ReCAPTCHA
                                 sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "TU_SITEKEY_DE_EJEMPLO"}
                                 ref={recaptchaRef}
                                 onChange={handleRecaptchaChange}
                             />
                         </Box>
                    </Box>

                    {/* BOTÓN 1: INICIAR SESIÓN */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading || !recaptchaVerified} // Deshabilitado si no está cargando O si no está verificado
                        sx={{
                            mt: 3,
                            mb: 1.5,
                            py: 1.8,
                            backgroundColor: COLOR_ACCENT_RED,
                            color: COLOR_LIGHT,
                            fontWeight: 'bold',
                            fontSize: '1.2em',
                            fontFamily: 'Montserrat, sans-serif',
                            '&:hover': {
                                backgroundColor: COLOR_LIME,
                                color: COLOR_DARK,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 5px 15px rgba(162, 232, 49, 0.5)`,
                            },
                            transition: 'all 0.3s ease-in-out',
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
                            py: 1.2,
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