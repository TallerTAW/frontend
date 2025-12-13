import { Box, Typography, Container } from "@mui/material";
import { motion } from "framer-motion";
import HeaderHome from '../components/HeaderHome'; 
import { useContent } from '../hooks/useContent';
import Bannerizq from '../components/Bannerizq';
import { useNavigate } from 'react-router-dom'; 

// ICONOS
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

// IMÁGENES
const IMAGEN_BALON = 'https://cdn.pixabay.com/photo/2013/07/13/10/51/football-157930_1280.png';
const IMAGEN_BALON1 = 'https://cdn.pixabay.com/photo/2013/07/13/09/46/basketball-155997_1280.png';
const IMAGEN_BALON2 = 'https://cdn.pixabay.com/photo/2013/07/12/13/21/baseball-146883_1280.png';

// TEXTOS DEFAULT
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
  const navigate = useNavigate(); 

  const aboutImageTenis = content.about_image_tenis || '/static/uploads/bannercancha.jpg';
  const aboutUsText = content.about_us || 'Somos una plataforma que conecta personas...';
  const servicesText = content.services || 'Ofrecemos productos y servicios...';

  // --- FUNCIONES DE NAVEGACIÓN ACTUALIZADAS ---
  // Ahora apuntan a '/canchas-visitante'

  // 1. Click en MISIÓN -> Fútbol
  const handleMisionClick = () => {
    navigate('/canchas-visitante', { state: { filterCategory: 'Fútbol' } });
  };

  // 2. Click en VISIÓN -> Baloncesto
  const handleVisionClick = () => {
    navigate('/canchas-visitante', { state: { filterCategory: 'Baloncesto' } });
  };

  // 3. Click en OBJETIVOS -> Voleibol
  const handleObjetivosClick = () => {
    navigate('/canchas-visitante', { state: { filterCategory: 'Voleibol' } });
  };

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

      {/* === HERO === */}
      <Box
        sx={{
          pt: '64px',
          height: { xs: '55vh', sm: '65vh', md: '75vh' },
          backgroundImage: `url(${aboutImageTenis})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))'
          }
        }}
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
                maxWidth: { xs: '95%', sm: '80%' }
              }}
            >
              ESPACIO DEPORTIVO A TU DISPOSICIÓN
            </Typography>
          </motion.div>
        </Container>
      </Box>

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

      {/* === SECCIONES DE MISION / VISION / OBJETIVOS === */}
      <Box sx={{ py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="xl">
          
          {/* MISIÓN -> FÚTBOL */}
          <Box sx={{ mb: { xs: 6, md: 10 } }}>
            <Bannerizq 
              titulo="MISIÓN" 
              texto={MISION_TEXTO} 
              imagenURL={IMAGEN_BALON} 
              onImageClick={handleMisionClick} 
            />
          </Box>

          {/* VISIÓN -> BALONCESTO */}
          <Box sx={{ mb: { xs: 6, md: 10 } }}>
            <Bannerizq 
              titulo="VISIÓN" 
              texto={VISION_TEXTO1} 
              imagenURL={IMAGEN_BALON1} 
              onImageClick={handleVisionClick} 
            />
          </Box>

          {/* OBJETIVOS -> VOLEIBOL */}
          <Box sx={{ mb: { xs: 6, md: 10 } }}>
            <Bannerizq 
              titulo="OBJETIVOS" 
              texto={OBJETIVO_TEXTO1} 
              imagenURL={IMAGEN_BALON2} 
              onImageClick={handleObjetivosClick} 
            />
          </Box>

        </Container>
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
          <a href="#"><FacebookIcon fontSize="large" /></a>
          <a href="#"><InstagramIcon fontSize="large" /></a>
          <a href="#"><XIcon fontSize="large" /></a>
          <a href="#"><LinkedInIcon fontSize="large" /></a>
          <a href="#"><LanguageIcon fontSize="large" /></a>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © 2025 OLYMPIAHUB. Todos los derechos reservados.
        </Typography>
      </Box>

    </Box>
  );
}