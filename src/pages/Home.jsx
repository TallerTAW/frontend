import { Box, Typography, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import HeaderHome from '../components/HeaderHome'; 

// Importa las imágenes desde assets
import TenisImage from '../assets/bannercancha.jpg'; 
import BalonImage from '../assets/balon2.jpg'; 
import AroImage from '../assets/baloncesto.jpg';  

const sportyBlue = "#4dc0b5"; 

export default function Home() {
  return (
    <Box>
      <HeaderHome /> 
      
      {/* Hero con imagen de fondo */}
      <Box
        className="h-[70vh] flex items-center justify-center text-center text-white"
        sx={{
          backgroundImage: `url(${TenisImage})`, 
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
                Somos una plataforma que conecta personas con espacios deportivos de forma rápida,
                segura y accesible. Promovemos el deporte, la vida activa, el bienestar y la
                creación de comunidades saludables y mejor conectadas.
              </Typography>
            </motion.div>
          </Grid>

          {/* Imagen al lado del texto */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              
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
              Ofrecemos productos y servicios de calidad en todo el mundo
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
                  Brindar una solución tecnológica confiable y sencilla que conecte a los
                  usuarios con los centros deportivos, facilitando el acceso a espacios
                  recreativos y optimizando el tiempo y los recursos de quienes disfrutan
                  de la actividad física.
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
                  src={AroImage} 
                  alt="Aro de Baloncesto"
                  sx={{ width: '100%', height: 'auto', objectFit: 'cover' }}
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
                  src={BalonImage} 
                  alt="Balón de Fútbol"
                  sx={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '50%' }}
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
                  Transformar la manera en que las personas acceden al deporte, consolidándonos
                  como una plataforma de referencia que fomente comunidades activas,
                  saludables y mejor conectadas.
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
            <Typography variant="body1" sx={{ lineHeight: 1.8, maxWidth: '800px', margin: '0 auto' }}>
              • Promover la vida activa y el bienestar en la comunidad. <br/>
              • Facilitar el acceso a instalaciones deportivas de forma práctica y segura. <br/>
              • Fomentar el trabajo en equipo y la creación de comunidades deportivas. <br/>
              • Impulsar la innovación tecnológica aplicada al deporte. <br/>
              • Convertirnos en un referente regional en la gestión de espacios deportivos.
            </Typography>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
