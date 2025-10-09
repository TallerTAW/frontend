import { Box, Typography, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import HeaderHome from '../components/HeaderHome'; 
import { useContent } from '../hooks/useContent';

const sportyBlue = "#4dc0b5"; 

export default function Home() {
  const { content, loading, error } = useContent();

  // Valores por defecto
  const aboutImageTenis = content.about_image_tenis || '/static/uploads/bannercancha.jpg';
  const aboutImageBalon = content.about_image_balon || '/static/uploads/balon2.jpg';
  const aboutImageAro = content.about_image_aro || '/static/uploads/baloncesto.jpg';
  const aboutUsText = content.about_us || 'Somos una plataforma que conecta personas con espacios deportivos de forma rápida, segura y accesible. Promovemos el deporte, la vida activa, el bienestar y la creación de comunidades saludables y mejor conectadas.';
  const servicesText = content.services || 'Ofrecemos productos y servicios de calidad en todo el mundo.';
  const missionText = content.mission || 'Brindar una solución tecnológica confiable y sencilla que conecte a los usuarios con los centros deportivos, facilitando el acceso a espacios recreativos y optimizando el tiempo y los recursos de quienes disfrutan de la actividad física.';
  const visionText = content.vision || 'Transformar la manera en que las personas acceden al deporte, consolidándonos como una plataforma de referencia que fomente comunidades activas, saludables y mejor conectadas.';
  const objectivesText = content.objectives || '• Promover la vida activa y el bienestar en la comunidad.\n• Facilitar el acceso a instalaciones deportivas de forma práctica y segura.\n• Fomentar el trabajo en equipo y la creación de comunidades deportivas.\n• Impulsar la innovación tecnológica aplicada al deporte.\n• Convertirnos en un referente regional en la gestión de espacios deportivos.';

  if (loading) {
    return (
      <Box>
        <HeaderHome />
        <Box className="h-screen flex items-center justify-center">
          <Typography variant="h6">Cargando contenido...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <HeaderHome /> 
      
      {/* Hero con imagen de fondo */}
      <Box
        className="h-[70vh] flex items-center justify-center text-center text-white"
        sx={{
          backgroundImage: `url(${aboutImageTenis})`, 
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
            ESPACIO DEPORTIVO A TU DISPOSICIÓN
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
                {aboutUsText}
              </Typography>
            </motion.div>
          </Grid>

          
        </Grid>
      </Container>
      
      {/* Misión, Visión y Objetivos */}
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
            <Typography variant="h4" fontWeight="regular" sx={{ mb: 8 }}>
              {servicesText}
            </Typography>
          </motion.div>

          {/* Misión */}
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
              >
                <Box
                  component="img"
                  src={aboutImageAro}
                  alt="Aro de Baloncesto"
                  sx={{ 
                    width: '100%', 
                    height: 'auto', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    e.target.src = '/static/uploads/baloncesto.jpg';
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>

          {/* Visión */}
          <Grid container spacing={8} alignItems="center" sx={{ mb: 12 }}>
            <Grid item xs={12} md={6}> 
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center md:justify-start"
              >
                <Box
                  component="img"
                  src={aboutImageBalon}
                  alt="Balón de Fútbol"
                  sx={{ 
                    width: '100%', 
                    maxWidth: '300px', 
                    height: 'auto', 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = '/static/uploads/balon2.jpg';
                  }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}> 
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                  VISIÓN
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {visionText}
                </Typography>
              </motion.div>
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
            <Typography 
              variant="body1" 
              sx={{ 
                lineHeight: 1.8, 
                maxWidth: '800px', 
                margin: '0 auto',
                whiteSpace: 'pre-line' // Esto respeta los saltos de línea
              }}
            >
              {objectivesText}
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}