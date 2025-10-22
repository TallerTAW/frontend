import { Box, Typography, Container, Grid, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { motion } from "framer-motion";
import HeaderHome from '../components/HeaderHome'; 
import { useContent } from '../hooks/useContent';

// Importar iconos de redes sociales
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X'; // Para Twitter
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';

// === COLORES DE LA PALETA DEFINIDA ===
const COLOR_PRIMARY = '#00BFFF';     // Azul Eléctrico
const COLOR_DARK = '#333333';        // Gris Oscuro
const COLOR_LIGHT = '#FFFFFF';       // Blanco
const COLOR_ACCENT_LIME = '#A2E831'; // Verde Lima
const COLOR_ACCENT_RED = '#FD7E14';  // Naranja/Rojo 


// Helper para renderizar los objetivos como una lista de MUI
const renderObjectives = (text) => {
    // Asumimos que los objetivos vienen separados por saltos de línea (\n) o viñetas (•)
    const items = text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
    
    const icons = [
        <span style={{ color: COLOR_ACCENT_LIME, fontSize: '1.2em' }}>•</span>,
        <span style={{ color: COLOR_ACCENT_LIME, fontSize: '1.2em' }}>•</span>,
        <span style={{ color: COLOR_ACCENT_LIME, fontSize: '1.2em' }}>•</span>,
        <span style={{ color: COLOR_ACCENT_LIME, fontSize: '1.2em' }}>•</span>,
        <span style={{ color: COLOR_ACCENT_LIME, fontSize: '1.2em' }}>•</span>,
    ];

    return (
        <List sx={{ color: COLOR_DARK, px: 0 }}>
            {items.map((item, index) => (
                <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                        {icons[index % icons.length]} 
                    </ListItemIcon>
                    <ListItemText primary={item.replace(/^[•\s]*/, '')} sx={{ 
                        '& .MuiListItemText-primary': { 
                            fontFamily: 'Roboto, sans-serif'
                        }
                    }} />
                </ListItem>
            ))}
        </List>
    );
};

export default function Home() {
  const { content, loading, error } = useContent();

  // Valores por defecto 
  const aboutImageTenis = content.about_image_tenis || '/static/uploads/bannercancha.jpg';
  const aboutUsText = content.about_us || 'Somos una plataforma que conecta personas con espacios deportivos de forma rápida, segura y accesible. Promovemos el deporte, la vida activa, el bienestar y la creación de comunidades saludables y mejor conectadas.';
  const servicesText = content.services || 'Ofrecemos productos y servicios de calidad en todo el mundo.';
  const missionText = content.mission || 'Brindar una solución tecnológica confiable y sencilla que conecte a los usuarios con los centros deportivos, facilitando el acceso a espacios recreativos y optimizando el tiempo y los recursos de quienes disfrutan de la actividad física.';
  const visionText = content.vision || 'Transformar la manera en que las personas acceden al deporte, consolidándonos como una plataforma de referencia que fomente comunidades activas, saludables y mejor conectadas.';
  const objectivesText = content.objectives || '• Promover la vida activa y el bienestar en la comunidad.\n• Facilitar el acceso a instalaciones deportivas de forma práctica y segura.\n• Fomentar el trabajo en equipo y la creación de comunidades deportivas.\n• Impulsar la innovación tecnológica aplicada al deporte.\n• Convertirnos en un referente regional en la gestión de espacios deportivos.';

  if (loading) {
    return (
      <Box>
        <HeaderHome />
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">Cargando contenido...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <HeaderHome /> 
      
      {/* 1. SECCIÓN HERO */}
      <Box
        sx={{
            pt: '64px', 
            height: "75vh", 
            backgroundImage: `url(${aboutImageTenis})`, 
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            textAlign: 'left',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%)', 
            }
        }}
      >
        <Container maxWidth="xl" sx={{ zIndex: 2, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography 
                variant="h2" 
                fontWeight="bold" 
                sx={{ 
                    color: COLOR_LIGHT, 
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontFamily: 'Montserrat, sans-serif'
                }}
            >
              ESPACIO DEPORTIVO A TU DISPOSICIÓN
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* 2. SECCIÓN QUIÉNES SOMOS (Fondo Oscuro) */}
      <Box sx={{ backgroundColor: COLOR_DARK, color: COLOR_LIGHT }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: COLOR_PRIMARY, fontFamily: 'Montserrat, sans-serif' }}>
              Quiénes somos
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: '800px', lineHeight: 1.8, fontFamily: 'Roboto, sans-serif', opacity: 0.8 }}>
              {aboutUsText}
            </Typography>
          </motion.div>
        </Container>
      </Box>
      
      {/* 3. SECCIÓN SERVICIOS Y MISIÓN (Fondo Azul Eléctrico) */}
      <Box sx={{ backgroundColor: COLOR_PRIMARY, color: COLOR_LIGHT }}>
        <Container maxWidth="xl" sx={{ py: 8 }}>
          
          {/* Servicios */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>
              SERVICIOS
            </Typography>
            <Typography 
                variant="h4" 
                fontWeight="bold" 
                sx={{ mb: 4, fontFamily: 'Montserrat, sans-serif' }}
            >
              {servicesText}
            </Typography>
          </motion.div>

          {/* Misión */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif' }}>
              MISIÓN
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, maxWidth: '900px', fontFamily: 'Roboto, sans-serif' }}>
              {missionText}
            </Typography>
          </motion.div>
        </Container>
      </Box>
        
      {/* 4. SECCIÓN VISIÓN Y OBJETIVOS (Fondo Blanco, Dividida) */}
      <Box sx={{ backgroundColor: COLOR_LIGHT, color: COLOR_DARK }}>
        <Container maxWidth="xl" sx={{ py: 10 }}>
            <Grid container spacing={8}>
                
                {/* Visión */}
                <Grid item xs={12} md={6}> 
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: COLOR_PRIMARY, fontFamily: 'Montserrat, sans-serif' }}>
                      VISIÓN
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontFamily: 'Roboto, sans-serif' }}>
                      {visionText}
                    </Typography>
                  </motion.div>
                </Grid>

                {/* Objetivos */}
                <Grid item xs={12} md={6}> 
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: COLOR_PRIMARY, fontFamily: 'Montserrat, sans-serif' }}>
                      OBJETIVOS
                    </Typography>
                    {renderObjectives(objectivesText)}
                  </motion.div>
                </Grid>
            </Grid>
        </Container>
      </Box>

      {/* 5. FOOTER */}
      <Box sx={{ backgroundColor: COLOR_DARK, color: COLOR_LIGHT, py: 3, textAlign: 'center' }}>
        
        {/* Íconos de Redes Sociales */}
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3, 
            mb: 2, 
            '& a': { color: COLOR_LIGHT, transition: 'color 0.3s' },
            '& a:hover': { color: COLOR_ACCENT_RED } 
        }}>
            <a href="URL_A_FACEBOOK" target="_blank" rel="noopener noreferrer">
                <FacebookIcon fontSize="large" />
            </a>
            <a href="URL_A_INSTAGRAM" target="_blank" rel="noopener noreferrer">
                <InstagramIcon fontSize="large" />
            </a>
            <a href="URL_A_TWITTER" target="_blank" rel="noopener noreferrer">
                <XIcon fontSize="large" />
            </a>
            <a href="URL_A_LINKEDIN" target="_blank" rel="noopener noreferrer">
                <LinkedInIcon fontSize="large" />
            </a>
            <a href="URL_A_OTRAS_REDES" target="_blank" rel="noopener noreferrer">
                <LanguageIcon fontSize="large" />
            </a>
        </Box>
        
        <Typography variant="body2" sx={{ opacity: 0.7, fontFamily: 'Roboto, sans-serif' }}>
            © 2025 OLYMPIAHUB. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}