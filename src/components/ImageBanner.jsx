// components/ImageBanner.jsx

import React from 'react';
import { Box, Typography, Grid, styled, Container } from "@mui/material";
import { motion } from "framer-motion";

// === CAMBIO CLAVE: Contenedor para la imagen, ya no usa background-image ===
const ImageWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down('md')]: {
        height: '200px',
        marginBottom: theme.spacing(3)
    }
}));

// Estilo para la imagen real
const StyledImage = styled('img')({
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain', // Asegura que el balón se vea completo
});
// =======================================================================

// CORRECCIÓN DE WARNING: shouldForwardProp para evitar la advertencia 'isImageRight'
const TextContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isImageRight',
})(({ theme, isImageRight }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
        textAlign: isImageRight ? 'left' : 'right', 
        paddingRight: isImageRight ? theme.spacing(8) : 0,
        paddingLeft: isImageRight ? 0 : theme.spacing(8),
    }
}));


// imagePosition: "left" (imagen a la izquierda) o "right" (imagen a la derecha)
export default function ImageBanner({ titulo, texto, imagenURL, imagePosition = 'right' }) {
    
    const isImageRight = imagePosition === 'right'; 
    const direction = isImageRight ? 'row' : 'row-reverse';

    // Animaciones
    const textVariants = {
        hidden: { opacity: 0, x: isImageRight ? -100 : 100 }, 
        visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
    };
    
    const imageVariants = {
        hidden: { opacity: 0, x: isImageRight ? 100 : -100 }, 
        visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
    };

    return (
        <Container maxWidth="xl">
            <Grid 
                container 
                spacing={{ xs: 3, md: 8 }} 
                alignItems="center"
                sx={{ flexDirection: { xs: 'column-reverse', md: direction } }}
            >
                {/* Columna de Texto */}
                <Grid item xs={12} md={6}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={textVariants}
                    >
                        <TextContent isImageRight={isImageRight}>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    color: 'white', 
                                    mb: 2,
                                    fontSize: { xs: '1.5rem', sm: '2rem' },
                                    fontFamily: 'Montserrat',
                                    borderBottom: '3px solid white', 
                                    display: 'inline-block',
                                    paddingBottom: '5px'
                                }}
                            >
                                {titulo}
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    lineHeight: 1.6,
                                    color: 'white', 
                                    opacity: 0.9,
                                    fontSize: { xs: '1rem', sm: '1.2rem' }, 
                                    whiteSpace: 'pre-line' 
                                }}
                            >
                                {texto.trim()}
                            </Typography>
                        </TextContent>
                    </motion.div>
                </Grid>

                {/* Columna de Imagen */}
                <Grid item xs={12} md={6}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={imageVariants}
                    >
                        {/* USAMOS EL TAG <img> CON EL SRC PROPORCIONADO POR Home.jsx */}
                        <ImageWrapper>
                            <StyledImage src={imagenURL} alt={`Imagen de ${titulo}`} />
                        </ImageWrapper>
                    </motion.div>
                </Grid>
            </Grid>
        </Container>
    );
}