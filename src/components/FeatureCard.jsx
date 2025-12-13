// components/FeatureCard.jsx

import { Box, Typography, Card, CardContent, styled } from "@mui/material";
import { motion } from "framer-motion"; // Importado para corregir el error

// Estilo para el ícono destacado
const IconWrapper = styled(Box)(({ theme, colorPrimary }) => ({
  color: colorPrimary,
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: `2px solid ${colorPrimary}`,
  transition: 'transform 0.3s, background-color 0.3s',
}));

// Estilo para la tarjeta completa
const CustomCard = styled(Card)(({ theme, colorPrimary, colorDark }) => ({
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(3),
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s, transform 0.3s',
  borderRadius: theme.shape.borderRadius * 2,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.15)',
    [`& ${IconWrapper}`]: {
        transform: 'scale(1.1)',
        backgroundColor: `${colorPrimary}20`, 
    }
  },
}));


export default function FeatureCard({ icon: Icon, title, text, colorPrimary, colorDark }) {
  return (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        // whileInView activa la animación cuando el componente está visible en la pantalla
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8 }}
    >
        <CustomCard colorPrimary={colorPrimary} colorDark={colorDark}>
            <CardContent>
                <IconWrapper colorPrimary={colorPrimary}>
                    <Icon sx={{ fontSize: 'inherit' }} />
                </IconWrapper>
                
                <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ color: colorPrimary, mb: 1.5, fontFamily: 'Montserrat' }}
                >
                    {title}
                </Typography>
                
                <Typography 
                    variant="body1" 
                    sx={{ color: colorDark, opacity: 0.8, lineHeight: 1.6, whiteSpace: 'pre-line' }}
                >
                    {/* whiteSpace: 'pre-line' respeta los saltos de línea del texto */}
                    {text.trim()}
                </Typography>
            </CardContent>
        </CustomCard>
    </motion.div>
  );
}