import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';
import {
    TextField,
    Button,
    Container,
    Box,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

// === COLORES DE LA PALETA UNIFICADA ===
const COLOR_PRIMARY = '#00BFFF';     // Azul Eléctrico [cite: 6]
const COLOR_DARK = '#333333';        // Gris Oscuro (Fondo del formulario) [cite: 6, 7]
const COLOR_LIGHT = '#FFFFFF';       // Blanco (Texto) [cite: 7]
const COLOR_ACCENT_RED = '#FD7E14';  // Naranja/Rojo (Botón principal) [cite: 7, 8]
const COLOR_LIME = '#A2E831';        // Verde Lima (Acentos, foco, hover) [cite: 8]

export default function Register() {
    // --- Estado y Lógica (Sin cambios) ---
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        contrasenia: '',
        confirmarContrasenia: '',
        telefono: '',
        rol: 'cliente'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recaptchaVerified, setRecaptchaVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    
    const handleRecaptchaChange = (token) => {
        setRecaptchaVerified(!!token);
        if (error && !!token) setError('');
    };
    
    const handleRecaptchaExpire = () => {
        setRecaptchaVerified(false);
        setError('El reCAPTCHA ha expirado. Por favor, verifica nuevamente.');
    };

    const handleRecaptchaError = () => {
        setRecaptchaVerified(false);
        setError('Error en la verificación reCAPTCHA. Intenta nuevamente.');
    };

    const validateForm = () => {
        if (!formData.nombre || !formData.apellido || !formData.email || !formData.contrasenia || !formData.confirmarContrasenia) {
            setError('Todos los campos marcados con ** son obligatorios');
            return false;
        }
        if (formData.contrasenia.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (formData.contrasenia !== formData.confirmarContrasenia) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('El formato del email no es válido');
            return false;
        }
        if (!recaptchaVerified) {
            setError('Por favor, verifica que no eres un robot');
            return false;
        }
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        
        try {
            const token = recaptchaRef.current.getValue();
            if (!token) {
                throw new Error('No se pudo obtener el token reCAPTCHA');
            }

            const { confirmarContrasenia, ...registerData } = formData;
            await authApi.register({
                ...registerData,
                captcha_token: token
            });
            toast.success('¡Registro exitoso! Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por email cuando sea activada.');
            
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setRecaptchaVerified(false);
            }

            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            let errorMessage = 'Error al registrar usuario';
            
            if (error.response && error.response.data) {
                 const serverError = error.response.data;
                 errorMessage = serverError.detail || serverError.message || JSON.stringify(serverError);
                 
                 if (errorMessage.includes('Captcha') || errorMessage.includes('captcha')) {
                    errorMessage = 'Error de verificación reCAPTCHA. Por favor, verifica nuevamente.';
                 } else if (errorMessage.includes('user already exists')) {
                    errorMessage = 'El email ya está registrado.';
                 }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            toast.error(errorMessage);
            
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setRecaptchaVerified(false);
            }

        } finally {
            setLoading(false);
        }
    };
    
    // --- ESTILOS UNIFICADOS (Sin cambios) ---
    
    const darkInputStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 1,
        
        // Estilos para el campo de texto interno OutlinedInput
        '& .MuiOutlinedInput-root': {
            color: COLOR_LIGHT,
          
            // AJUSTE CLAVE DE ALTURA: Aumentar padding interno
            '& .MuiOutlinedInput-input': {
                paddingTop: '16.5px', 
                paddingBottom: '16.5px',
            },
            
      
            '& fieldset': { borderColor: COLOR_PRIMARY, transition: 'all 0.3s' },
            '&:hover fieldset': { borderColor: COLOR_LIME },
            '&.Mui-focused fieldset': { 
                borderColor: COLOR_LIME,
                borderWidth: '2px',
            },
        
        },
        // Mover la etiqueta (label) flotante para compensar el padding aumentado
        '& .MuiInputLabel-root': {
            color: COLOR_LIGHT,
            '&.Mui-focused': {
                color: COLOR_LIME,
            },
            '&.MuiInputLabel-shrink': {
    
                transform: 'translate(14px, -9px) scale(0.75)',
            },
        },
        '& .MuiFormHelperText-root': {
            color: COLOR_LIGHT,
            opacity: 0.7,
        },
    };
    
    const darkSelectStyle = {
        ...darkInputStyle,
        
        // El Select tiene su propio ajuste de padding que debemos igualar
        '& .MuiOutlinedInput-root': {
            ...darkInputStyle['& .MuiOutlinedInput-root'], 
            '& .MuiSelect-select': {
                paddingTop: '16.5px', 
      
                paddingBottom: '16.5px',
            },
        },
        
        '& .MuiSvgIcon-root': { 
            color: COLOR_LIME,
        },
    };
    // ------------------------------------

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
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
           
                 }
            }}
        >
            {/* Contenedor principal: Cambiado a "md" para más espacio en escritorio, pero sigue siendo responsivo */}
            <Container maxWidth="md" sx={{ zIndex: 10 }}> 
                <motion.div
                    initial={{ opacity: 
                        0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box
             
                        component="div"
                        sx={{
                            p: 4,
                            borderRadius: 3,
       
                            backgroundColor: COLOR_DARK,
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)', 
                            textAlign: 'center',
     
                            color: COLOR_LIGHT,
                            border: `1px solid rgba(255, 255, 255, 0.1)` 
                        }}
                 
                    >
           
                        {/* CABECERA (sin cambios) */}
                        <Box className="text-center mb-6" sx={{ mb: 4 }}>
                            
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{
    
                                    color: COLOR_LIME,
                                    fontFamily: 'Montserrat, sans-serif',
                             
                                    letterSpacing: '5px',
                                    mb: 0.5,
                                }}
                       
                            >
                                REGISTRO
                            </Typography>
                            <Typography
       
                                variant="subtitle1"
                                sx={{
                                    mb: 3,
      
                                    opacity: 0.8,
                                    fontFamily: 'Roboto, sans-serif'
                               
                                }}
                            >
                                Únete a nuestra comunidad deportiva
                            </Typography>
       
                        </Box>

                        {error && (
                            <Alert severity="error" className="mb-4" sx={{ mb: 2 }}>
                       
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
              
                            {/* Grid container con spacing={3} para la separación vertical */}
                            <Grid container spacing={3}>
                            
                   
                                {/* Nombre (xs=12, ocupa el 100% del ancho) */}
                                <Grid item xs={12}> 
                                    <TextField
        
                                        fullWidth 
                                        label="Nombre **" 
                         
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
     
                                        required
                                        disabled={loading}
                         
                                        sx={darkInputStyle}
                                        InputProps={{
                                            startAdornment: 
                                                <PersonIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />,
                                        }}
                                    />
                 
                                </Grid>
                                
                                {/* Apellido (xs=12, ocupa el 100% del ancho) */}
             
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth 
  
                                        label="Apellido **"
                                        name="apellido"
                     
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
 
                                        disabled={loading}
                                        sx={darkInputStyle}
                     
                                        InputProps={{
                                            startAdornment: <PersonIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />,
                             
                                        }}
                                    />
                                </Grid>

                     
                                {/* Email (xs=12, ocupa el 100% del ancho) */}
                                <Grid item xs={12}>
                                    <TextField
           
                                        fullWidth 
                                        label="Email **"
                             
                                        name="email"
                                        type="email"
                                        value={formData.email}
         
                                        onChange={handleChange}
                                        required
                             
                                        disabled={loading}
                                        sx={darkInputStyle}
                                        InputProps={{
         
                                            startAdornment: <EmailIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />,
                                        }}
                 
                                    />
                                </Grid>
                                
                 
                                {/* === Fila Teléfono y Tipo de Cuenta (Responsivo) === */}
                                
                                <Grid item xs={12}> {/* Este GridItem asegura el spacing vertical */}
                                    {/* Grid anidado: spacing={3} para espaciado horizontal y vertical */}
                                    <Grid container spacing={3}> 
                                        
           
                                        {/* Teléfono: xs=12 (100% en móvil), md=6 (50% en escritorio) */}
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth 
               
                                                label="Teléfono"
                                                name="telefono"
                   
                                                value={formData.telefono}
                                                onChange={handleChange}
                       
                                                disabled={loading}
                                                sx={darkInputStyle}
                           
                                                InputProps={{
                                                    startAdornment: <PhoneIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />,
                   
                                                }}
                                            />
                           
                                        </Grid>

                                        {/* Tipo de Cuenta (Select): xs=12 (100% en móvil), md=6 (50% en escritorio) */}
                             
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth disabled={loading} sx={darkSelectStyle}> 
                                   
                                                <InputLabel>Tipo de Cuenta</InputLabel> 
                                                <Select
                                    
                                                    name="rol"
                                                    value={formData.rol}
                                
                                                    onChange={handleChange}
                                                    label="Tipo de Cuenta"
                          
                                                    startAdornment={
                                                        <InputAdornment position="start">
                 
                                                            <AssignmentIndIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />
                                                  
                                                        </InputAdornment>
                                                    }
                                          
                                                >
                                                    <MenuItem value="cliente">Cliente</MenuItem>
                                         
                                                    <MenuItem value="gestor">Gestor de Espacios</MenuItem>
                                                    <MenuItem value="control_acceso">Control de Acceso</MenuItem>
                               
                                                </Select>
                                            </FormControl>
                                       
                                        </Grid>
                                    </Grid>
                                </Grid>
                               
                                 
                                {/* Contraseña (xs=12, ocupa el 100% del ancho) */}
                                <Grid item xs={12}>
                         
                                    <TextField
                                        fullWidth 
                                        label="Contraseña **"
       
                                        name="contrasenia"
                                        type={showPassword ?
                                            'text' : 'password'}
                                        value={formData.contrasenia}
                                        onChange={handleChange}
                  
                                        required
                                        disabled={loading}
                                      
                                        helperText="Mínimo 6 caracteres"
                                        sx={darkInputStyle}
                                        InputProps={{
                
                                            startAdornment: <LockIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />,
                                            endAdornment: (
                   
                                                <InputAdornment position="end">
                                                    <IconButton
                  
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
      
                                                        edge="end"
                                                  
                                                        disabled={loading}
                                                    >
                                          
                                                        {showPassword ?
                                                            <VisibilityOff sx={{ color: COLOR_LIME }} /> : <Visibility sx={{ color: COLOR_LIME }} />}
                                                    </IconButton>
                                    
                                                </InputAdornment>
                                            ),
                                        }}
    
                                    />
                                </Grid>

                                {/* Confirmar Contraseña (xs=12, ocupa el 100% del ancho) */}
                                <Grid item xs={12}>
                                    <TextField
                         
                                        fullWidth 
                                        label="Confirmar Contraseña **"
                                        name="confirmarContrasenia"
  
                                        type={showConfirmPassword ?
                                            'text' : 'password'}
                                        value={formData.confirmarContrasenia}
                                        onChange={handleChange}
                  
                                        required
                                        disabled={loading}
                                      
                                        sx={darkInputStyle}
                                        InputProps={{
                                            startAdornment: <LockIcon sx={{ color: COLOR_PRIMARY, mr: 1 }} />,
      
                                            endAdornment: (
                                                <InputAdornment position="end">
            
                                                    <IconButton
                                                        onClick={handleClickShowConfirmPassword}
    
                                                        onMouseDown={handleMouseDownPassword}
                                                
                                                        edge="end"
                                                        disabled={loading}
                                    
                                                    >
                                                        {showConfirmPassword ?
                                                            <VisibilityOff sx={{ color: COLOR_LIME }} /> : <Visibility sx={{ color: COLOR_LIME }} />}
                                                    </IconButton>
                                    
                                                </InputAdornment>
                                            ),
                                        }}
    
                                    />
                                </Grid>
                                
    
                                {/* ReCAPTCHA (xs=12, ocupa el 100% del ancho) */}
                                <Grid item xs={12}>
                              
                                    <Box 
                                        sx={{ 
                                            my: 2, 
      
                                            display: 'flex',
                                            justifyContent: 'center',
                
                                            py: 1
                                        }}
                               
                                    >
                                        <ReCAPTCHA
                                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
                                                "TU_SITEKEY_DE_EJEMPLO"}
                                            ref={recaptchaRef}
                                            onChange={handleRecaptchaChange}
            
                                            onExpired={handleRecaptchaExpire}
                                            onErrored={handleRecaptchaError}
                        
                                            theme="dark"
                                        />
                                    </Box>
    
                                </Grid>
                            </Grid>

                            {/* Botón: Crear Cuenta */}
            
                            <Button
                                type="submit"
                                fullWidth
                    
                                variant="contained"
                                disabled={loading ||
                                    !recaptchaVerified}
                                sx={{
                                    mt: 4,
                               
                                    mb: 1.5,
                                    py: 1.8,
                                    backgroundColor: COLOR_ACCENT_RED,
                    
                                    color: COLOR_LIGHT,
                                    fontWeight: 'bold',
                                    fontSize: '1.2em',
         
                                    fontFamily: 'Montserrat, sans-serif',
                                    borderRadius: 1,
                                  
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: COLOR_LIME,
                 
                                        color: COLOR_DARK,
                                        transform: 'translateY(-3px)',
                                   
                                        boxShadow: `0 8px 20px rgba(162, 232, 49, 0.6)`,
                                    },
                                    opacity: loading ||
                                        !recaptchaVerified ? 0.8 : 1,
                                }}
                            >
                                {loading ?
                                    (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={24} color="inherit" />
             
                                        Creando cuenta...
                                    </Box>
                                ) : (
  
                                    'CREAR CUENTA'
                                )}
                            </Button>
     
                        </form>

                        {/* SECCIÓN DE PIE DE PÁGINA */}
                        <Box className="mt-4 text-center" sx={{ mt: 3 }}>
                     
                            <Typography variant="body2" sx={{ color: COLOR_LIGHT, opacity: 0.8 }}>
                                ¿Ya tienes una cuenta?{' '}
                                <Link
                  
                                    to="/login"
                                    style={{
                                        textDecoration: 'none',
     
                                        color: COLOR_PRIMARY,
                                        fontWeight: 'bold',
                       
                                        transition: 'color 0.3s',
                                    }}
                                >
             
                                    Inicia sesión aquí
                                </Link>
                            </Typography>
               
                            <Typography 
                                variant="caption" 
                                sx={{ color: COLOR_LIME, fontWeight: 'bold', display: 'block', mt: 1 }}
            
                            >
                                ** Campos obligatorios
                            </Typography>
                      
                            <Typography 
                                variant="caption" 
                                sx={{ color: COLOR_LIGHT, opacity: 0.5, display: 'block', mt: 0.5 }}
                   
                            >
                                Al registrarte, aceptas nuestros términos y condiciones
                            </Typography>
                        </Box>

 
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
}