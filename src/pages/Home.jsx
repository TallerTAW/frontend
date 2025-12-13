// pages/Home.jsx
import { Box, Typography, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";

import HeaderHome from '../components/HeaderHome';
import HeroCarousel from '../components/HeroCarousel'; 
import ImageBanner from '../components/ImageBanner'; 

import { useContent } from '../hooks/useContent';

// === IMPORTACIÓN DE IMÁGENES LOCALES (VERIFICAR QUE EXISTAN ESTOS ARCHIVOS) ===
// Asegúrate de que estos archivos estén en src/assets/images/
import BalonFutbol from '../assets/images/balon-futbol.png';
import Baloncesto from '../assets/images/balon-baloncesto.png';
import Beisbol from '../assets/images/balon-beisbol.png';

import ImgCarrusel1 from '../assets/images/carrusel-1.jpg';
import ImgCarrusel2 from '../assets/images/carrusel-2.jpg';
import ImgCarrusel3 from '../assets/images/carrusel-3.jpg';
// ===============================================

// ICONOS DE REDES SOCIALES
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';

// COLORES
const COLOR_PRIMARY = '#00BFFF';
const COLOR_DARK = '#333333';
const COLOR_LIGHT = '#FFFFFF';
const COLOR_ACCENT_RED = '#FD7E14';

// ASIGNACIÓN DE IMÁGENES LOCALES
const IMAGEN_BALON = BalonFutbol;
const IMAGEN_BALON1 = Baloncesto;
const IMAGEN_BALON2 = Beisbol;

const CAROUSEL_IMAGES = [
  ImgCarrusel1,
  ImgCarrusel2,
  ImgCarrusel3,
];

// TEXTOS DE MISIÓN/VISIÓN/OBJETIVOS
const MISION_TEXTO = `
  Brindar una solución tecnológica confiable y sencilla que conecte a los
  usuarios con los centros deportivos, facilitando el acceso a espacios de
  recreación y optimizando el tiempo y los recursos de quienes disfrutan de la
  actividad física.
`;

const VISION_TEXTO1 = `
  Transformar la manera en que las personas acceden al deporte, consolidándonos
  como una plataforma de referencia que fomente comunidades activas, saludables
  y mejor conectadas.
`;

const OBJETIVO_TEXTO1 = `
  Promover la vida activa y el bienestar en la comunidad. Facilitar el acceso
  a instalaciones deportivas de forma práctica y segura. Fomentar el trabajo en
  equipo y la creación de comunidades deportivas. Impulsar la innovación tecnológica
  aplicada al deporte. Convertirnos en un referente regional en la gestión de espacios deportivos.
`;


export default function Home() {
  const { content, loading } = useContent();

  const aboutUsText = content.about_us || 'Somos una plataforma que conecta personas...';
  const servicesText = content.services || 'Ofrecemos productos y servicios...';
  
  // Usamos el contenido dinámico si está disponible, sino, las imágenes locales por defecto
  const heroImages = content.about_image_tenis ? [content.about_image_tenis, ...CAROUSEL_IMAGES.slice(1)] : CAROUSEL_IMAGES;
  
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

      {/* === HERO/CARRUSEL === */}
      <HeroCarousel 
        images={heroImages} 
        colorPrimary={COLOR_PRIMARY}
        colorLight={COLOR_LIGHT}
      >
        <Container maxWidth="xl" sx={{ zIndex: 2, mb: { xs: 3, sm: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography
              fontWeight="bold"
              sx={{
                color: COLOR_LIGHT,
                fontFamily: 'Montserrat',
                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '4rem' },
                maxWidth: { xs: '95%', sm: '80%' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              ESPACIO DEPORTIVO A TU DISPOSICIÓN
            </Typography>
          </motion.div>
        </Container>
      </HeroCarousel>


      {/* === QUIÉNES SOMOS === */}
      <Box sx={{ backgroundColor: COLOR_DARK, color: COLOR_LIGHT }}>
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: COLOR_PRIMARY,
              mb: 2,
              fontSize: { xs: '1.7rem', sm: '2.2rem' },
              fontFamily: 'Montserrat'
            }}
          >
            Quiénes somos
          </Typography>

          <Typography
            variant="body1"
            sx={{
              maxWidth: '800px',
              lineHeight: 1.8,
              opacity: 0.8,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            {aboutUsText}
          </Typography>
        </Container>
      </Box>

      {/* === SERVICIOS === */}
      <Box sx={{ backgroundColor: COLOR_PRIMARY, color: COLOR_LIGHT }}>
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
          <Typography
            variant="subtitle1"
            sx={{ textTransform: 'uppercase', opacity: 0.8 }}
          >
            Servicios
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontFamily: 'Montserrat',
              mb: 3,
              fontSize: { xs: '1.8rem', sm: '2.2rem' }
            }}
          >
            {servicesText}
          </Typography>
        </Container>
      </Box>

      {/* === SECCIONES DE MISION / VISION / OBJETIVOS (Banners de ancho completo) === */}
      <Box sx={{ py: { xs: 4, sm: 6 }, backgroundColor: COLOR_PRIMARY }}>
            
            {/* MISIÓN - Imagen a la derecha, texto a la izquierda */}
            <Box sx={{ mb: { xs: 6, md: 10 } }}>
                <ImageBanner 
                    titulo="MISIÓN" 
                    texto={MISION_TEXTO} 
                    imagenURL={IMAGEN_BALON} 
                    imagePosition="right" 
                />
            </Box>

            {/* VISIÓN - Imagen a la izquierda, texto a la derecha */}
            <Box sx={{ mb: { xs: 6, md: 10 } }}>
                <ImageBanner 
                    titulo="VISIÓN" 
                    texto={VISION_TEXTO1} 
                    imagenURL={IMAGEN_BALON1} 
                    imagePosition="left" 
                />
            </Box>

            {/* OBJETIVOS - Imagen a la derecha, texto a la izquierda */}
            <Box sx={{ mb: { xs: 6, md: 10 } }}>
                <ImageBanner 
                    titulo="OBJETIVOS" 
                    texto={OBJETIVO_TEXTO1} 
                    imagenURL={IMAGEN_BALON2} 
                    imagePosition="right" 
                />
            </Box>
      </Box>


      {/* FOOTER */}
      <Box sx={{ backgroundColor: COLOR_DARK, color: COLOR_LIGHT, py: 3, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
            mb: 2,
            '& a': { color: COLOR_LIGHT, transition: '0.3s' },
            '& a:hover': { color: COLOR_ACCENT_RED }
          }}
        >
          <a href="https://www.facebook.com/people/Code-Cats-Studio/61579204709906/" target="_blank">
            <FacebookIcon fontSize="large" />
          </a>

          <a href="https://www.instagram.com/code_cats.studio" target="_blank">
            <InstagramIcon fontSize="large" />
          </a>

          <a href="https://code-cats-studio.vercel.app/" target="_blank">
            <LanguageIcon fontSize="large" />
          </a>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © 2025 OLYMPIAHUB. Todos los derechos reservados.
        </Typography>
      </Box>

    </Box>
  );
}