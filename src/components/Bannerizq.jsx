// src/components/Bannerizq.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Es buena práctica usar PropTypes

const Bannerizq = ({titulo, texto, imagenURL }) => {
  // Estilos en línea para replicar el diseño de la imagen original
  const bannerStyle = {
    backgroundColor: '#00BFFF', // Color azul verdoso similar al de la imagen
    display: 'flex',
    alignItems: 'center',
    padding: '40px 80px', // Espaciado interior
    minHeight: '400px', // Altura mínima para que se vea bien
    fontFamily: 'Arial, sans-serif', // Fuente genérica
    color: '#333', // Color de texto oscuro
  };

  const contentStyle = {
    flex: 1, // Ocupa el espacio restante de la izquierda
    maxWidth: '50%', // Limita el ancho del texto
    paddingRight: '60px', // Espacio entre el texto y la imagen
  };

  const titleStyle = {
    fontSize: '2.5rem', // Tamaño para "MISIÓN"
    fontWeight: 'normal',
    marginBottom: '20px',
    color: '#ffffffff', // Texto del título en negro
  };

  const textStyle = {
    fontSize: '1.2rem', // Tamaño de fuente para la descripción
    lineHeight: 1.6,
  };

  const imageContainerStyle = {
    flex: 1, // Ocupa el espacio de la derecha
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const imageStyle = {
    maxWidth: '100%',
    maxHeight: '300px', // Altura máxima de la imagen (ajustable)
    height: 'auto',
    borderRadius: '10px', // Puedes añadir un borde si la imagen lo requiere, o quitarlo
    objectFit: 'contain', // Asegura que la imagen se ajuste sin recortarse
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Sombra suave para destacar la imagen
  };


  return (
    <div style={bannerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>{titulo}</h1>
        <p style={textStyle}>{texto}</p>
      </div>
      <div style={imageContainerStyle}>
        {/* Aquí mostramos la imagen que viene de la prop imagenURL */}
        <img src={imagenURL} alt="Elemento visual de la misión" style={imageStyle} />
      </div>
    </div>
  );
};

// Definición de PropTypes para validar las props
Bannerizq.propTypes = {
  texto: PropTypes.string.isRequired,
  imagenURL: PropTypes.string.isRequired,
};

export default Bannerizq;