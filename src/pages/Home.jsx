import { Box, Typography, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import HeaderHome from '../components/HeaderHome'; 
// 🚨 1. Importar el hook para acceder al contenido dinámico
import { useContent } from '../context/ContentContext'; 

// Importa las imágenes locales (las mantenemos como fallback, aunque usaremos la URL de la BD)
import TenisImage from '../assets/bannercancha.jpg'; 
// Asegúrate de que esta importación exista o cámbiala por la correcta
import BalonImage from '../assets/balon2.jpg'; 
// Creamos una variable de fallback para el gráfico de la pelota si no tienes una:
const DefaultBallImage = BalonImage; 

const sportyBlue = "#4dc0b5"; 

export default function Home() {
    // 🚨 2. Usar el hook para obtener el contenido
    const { content, isLoading } = useContent(); 

    // 3. Manejar el estado de carga (opcional: muestra un skeleton o null)
    if (isLoading) {
        // Puedes retornar un skeleton o un loading más elegante si quieres
        return <Box className="h-screen flex items-center justify-center">Cargando la experiencia deportiva...</Box>;
    }

    // 4. Extraer los valores dinámicos
    // Usar valores de la BD o un fallback si la clave no existe o falla

    // --- Contenido del Hero y Quiénes Somos ---
    const heroTitle = content.hero_title || "ESPACIO DEPORTIVO A TU DISPOSICIÓN";

    // Usamos 'about_us_paragraph' que es la clave que insertamos en la BD.
    const aboutUsText = content.about_us_paragraph || "Somos una plataforma que conecta personas con espacios deportivos de forma rápida, segura y accesible...";

    // Usar la URL de la BD, o si falla, usar la imagen local por defecto
    const heroImageUrl = content.hero_image_url || TenisImage; 


    // --- Contenido de las Secciones Misión, Visión, Objetivos y Servicios ---
    const servicesTitle = content.services_title || "OFRECEMOS PRODUCTOS Y SERVICIOS DE CALIDAD";
    
    const missionText = content.mission_text || "Brindar una solución tecnológica que simplifique la gestión y reserva de espacios deportivos.";
    const visionText = content.vision_text || "Transformar la manera en que las personas acceden al deporte, consolidándonos como una plataforma de referencia.";
    
    // Usamos \n para la lista. El método .split('\n').map() se usará abajo en el JSX
    const objectivesList = content.objectives_list || 
        "• Promover la vida activa y el bienestar en la comunidad.\n• Facilitar el acceso a instalaciones deportivas.\n• Fomentar el trabajo en equipo y la creación de comunidades deportivas.";

    // URL para el Gráfico de la Pelota
    const ballGraphicUrl = content.ball_graphic_url || DefaultBallImage;

    return (
        <Box>
            <HeaderHome /> 
            
            {/* Hero con imagen de fondo */}
            <Box
                className="h-[70vh] flex items-center justify-center text-center text-white"
                sx={{
                    // 🚨 REEMPLAZO 1: Usar la URL dinámica para la imagen de fondo
                    backgroundImage: `url(${heroImageUrl})`, 
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    style={{ zIndex: 1 }}
                >
                    <Typography variant="h2" fontWeight="bold">
                        {heroTitle} {/* 🚨 Título dinámico */}
                    </Typography>
                </motion.div>
            </Box>

            {/* Quiénes somos */}
            <Container 
                maxWidth="xl" 
                className="py-16" 
                sx={{ backgroundColor: 'black', color: 'white' }}
            >
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typography variant="h3" gutterBottom fontWeight="light">
                                Quiénes somos
                            </Typography>
                            <Typography variant="body1" sx={{ maxWidth: '400px', lineHeight: 1.8 }}>
                                {aboutUsText} {/* 🚨 Texto de Quiénes Somos dinámico */}
                            </Typography>
                        </motion.div>
                    </Grid>

                    {/* Imagen al lado del texto */}
                    {/* ... (Tu Grid item de imagen) ... */}
                </Grid>
            </Container>
            
            {/* Misión, Visión y Objetivos (Sección Dinámica) */}
            <Box sx={{ backgroundColor: sportyBlue, color: 'white' }}>
                <Container maxWidth="xl" className="py-24">
                    
                    {/* Servicios */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, opacity: 0.8 }}>
                            SERVICIOS
                        </Typography>
                        {/* 🚨 REEMPLAZO 4: Título de Servicios dinámico */}
                        <Typography variant="h4" fontWeight="regular" sx={{ mb: 8 }}>
                            {servicesTitle}
                        </Typography>
                    </motion.div>

                    {/* Misión e Imagen de la Pelota */}
                    <Grid container spacing={8} alignItems="center" sx={{ mb: 12 }}>
                        <Grid item xs={12} md={6}> 
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                                    MISIÓN
                                </Typography>
                                {/* 🚨 REEMPLAZO 5: Texto de Misión dinámico */}
                                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                    {missionText} 
                                </Typography>
                            </motion.div>
                        </Grid>
                        
                        <Grid item xs={12} md={6}> 
                             <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.8 }}
                                className="flex justify-center md:justify-start"
                            >
                                <Box
                                    component="img"
                                    // 🚨 REEMPLAZO 6: URL de Imagen Gráfico dinámico
                                    src={ballGraphicUrl} 
                                    alt="Gráfico de Balón"
                                    sx={{ 
                                        width: '100%', 
                                        maxWidth: '300px', 
                                        height: 'auto', 
                                        borderRadius: '50%',
                                        // Asegúrate de que si usas una URL externa, CORS lo permita
                                    }}
                                />
                            </motion.div>
                        </Grid>
                    </Grid>

                    {/* Visión */}
                    <Grid container spacing={8} alignItems="center" sx={{ mb: 12 }}>
                        {/* Nota: He invertido el orden de las columnas Visión vs Imagen para que el gráfico quede al lado de Misión y el texto de Visión abajo, basándome en el layout de tu imagen. */}
                        <Grid item xs={12} md={6}> 
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                                    VISIÓN
                                </Typography>
                                {/* 🚨 REEMPLAZO 7: Texto de Visión dinámico */}
                                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                    {visionText}
                                </Typography>
                            </motion.div>
                        </Grid>
                        
                        <Grid item xs={12} md={6}> 
                            {/* Aquí puedes poner algún otro elemento visual si tienes uno para Visión, o dejarlo vacío por ahora */}
                        </Grid>
                    </Grid>

                    {/* Objetivos */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                            OBJETIVOS
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8, maxWidth: '800px', margin: '0 auto' }}>
                            {/* 🚨 REEMPLAZO 8: Lista de Objetivos dinámico, usa split para los saltos de línea */}
                            {objectivesList.split('\n').map((line, index) => (
                                <Box key={index} component="span" sx={{ display: 'block' }}>
                                    {line}
                                </Box>
                            ))}
                        </Typography>
                    </motion.div>
                </Container>
            </Box>
        </Box>
    );
}