// components/HeroCarousel.jsx

import React, { useState, useEffect } from 'react';
import { Box, IconButton, styled } from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const CarouselContainer = styled(Box)(({ theme, imageurl }) => ({
  pt: '64px',
  height: '75vh', 
  [theme.breakpoints.down('md')]: {
    height: '65vh',
  },
  [theme.breakpoints.down('sm')]: {
    height: '55vh',
  },
  // Soporta rutas de importación local o URLs externas
  backgroundImage: `url(${imageurl})`, 
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-end',
  transition: 'background-image 1s ease-in-out', 
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))',
  }
}));

// CORRECCIÓN DE WARNING: shouldForwardProp para eliminar 'colorLight' del DOM
const NavButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'colorLight',
})(({ colorLight }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  color: colorLight,
  zIndex: 3, 
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  }
}));

const SLIDE_DURATION = 5000; 

export default function HeroCarousel({ images, colorLight, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  useEffect(() => {
    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [images.length]);


  return (
    <CarouselContainer imageurl={images[currentIndex]}>
      
      {/* Botón Anterior */}
      <NavButton 
        onClick={prevSlide} 
        colorLight={colorLight} 
        sx={{ left: { xs: 1, sm: 3 } }}
      >
        <ArrowBackIosIcon />
      </NavButton>

      {/* Botón Siguiente */}
      <NavButton 
        onClick={nextSlide} 
        colorLight={colorLight} 
        sx={{ right: { xs: 1, sm: 3 } }}
      >
        <ArrowForwardIosIcon />
      </NavButton>

      {/* Puntos de navegación */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 1, sm: 2 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 3,
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: colorLight,
              opacity: index === currentIndex ? 1 : 0.5,
              cursor: 'pointer',
              transition: 'opacity 0.3s',
            }}
          />
        ))}
      </Box>

      {/* Contenido (título) */}
      {children}
      
    </CarouselContainer>
  );
}