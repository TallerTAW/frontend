import { Box, Typography, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import HeaderHome from '../components/HeaderHome'; 

// Importa las imágenes desde assets (según tu estructura: src/assets)
import TenisImage from '../assets/bannercancha.jpg'; 
import BalonImage from '../assets/balon2.jpg'; 
import AroImage from '../assets/baloncesto.jpg'; 

const sportyBlue = "#4dc0b5"; // Color de fondo turquesa/azul verdoso

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

      {/* Sección Quiénes somos: FONDO NEGRO y LETRA BLANCA (CORREGIDO) */}
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
          <Grid item xs={12} md={6}>
            {/* Placeholder for optional image */}
          </Grid>
        </Grid>
      </Container>
      
       {/* Sección Servicios, Misión y Visión (Fondo azul) */}
      <Box sx={{ backgroundColor: sportyBlue, color: 'white' }}>
        <Container maxWidth="xl" className="py-24">
          
          {/* Fila superior para Servicios */}
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

          {/* ------------------------------------------- */}
          {/* SECCIÓN MISIÓN: Texto Izquierda, Imagen Derecha */}
          {/* ------------------------------------------- */}
          <Grid container spacing={8} alignItems="center" sx={{ mb: 12 }}>
            
            {/* COLUMNA IZQUIERDA (md=6): TEXTO MISIÓN */}
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
                // Eliminado 'className="flex justify-end"' para que la imagen se ajuste mejor
              >
                {/* Imagen del aro: Usamos width:100% para que ocupe todo el espacio de la columna */}
                <Box
                  component="img"
                  src={AroImage} 
                  alt="Aro de Baloncesto"
                  // Ajuste clave: width: 100% del contenedor Grid, max-width solo si es necesario limitar el tamaño.
                  sx={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                />
              </motion.div>
            </Grid>
          </Grid>

          {/* ------------------------------------------- */}
          
          {/* ------------------------------------------- */}
          <Grid container spacing={8} alignItems="center">
            
            
            <Grid item xs={12} md={6}> 
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center md:justify-start" // Asegura que la imagen se alinee a la izquierda en desktop
              >
                {/* Imagen del balón: Usamos width:100% y un max-width para el círculo */}
                <Box
                    component="img"
                    src={BalonImage} 
                    alt="Balón de Fútbol Autografiado"
                    // Ajuste clave: width: 100% del contenedor Grid, max-width para limitar el tamaño y mantener la forma.
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
        </Container>
      </Box>
    </Box>
  );
}