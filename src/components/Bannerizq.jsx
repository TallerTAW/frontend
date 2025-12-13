// src/components/Bannerizq.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Bannerizq = ({ titulo, texto, imagenURL, onImageClick }) => {
  return (
    <div
      style={{
        backgroundColor: '#00BFFF',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '40px 80px',
        minHeight: '400px',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        /* 🔥 RESPONSIVIDAD */
        flexWrap: 'wrap',
      }}
    >

      {/* === IMAGEN (AHORA ACTÚA COMO BOTÓN SI SE LE PASA UNA FUNCIÓN) === */}
      <div
        onClick={onImageClick} // Evento Click
        style={{
          flex: '1 1 100%',
          display: 'flex',
          justifyContent: 'center',
          order: 1,
          /* Si hay función de click, ponemos cursor de mano */
          cursor: onImageClick ? 'pointer' : 'default',
          
          /* Imagen ocupa el 100% en móvil */
          paddingBottom: '30px',

          /* En pantallas grandes, vuelve al lado derecho */
          '@media (min-width: 768px)': {
            flex: 1,
            paddingBottom: 0,
            order: 2,
          },
        }}
        className="bannerizq-image"
      >
        <img
          src={imagenURL}
          alt={titulo}
          style={{
            /* --- CAMBIOS AQUI PARA REDUCIR TAMAÑO EN ESCRITORIO --- */
            maxWidth: '100%',       // En móvil ocupa todo el ancho disponible
            maxHeight: '350px',     // 🔥 NUEVO: Limita la altura máxima (evita que sea gigante en PC)
            width: 'auto',          // 🔥 NUEVO: Ajusta el ancho automáticamente según la altura
            
            height: 'auto',
            borderRadius: '15px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            objectFit: 'cover',
            /* Efecto suave al pasar el mouse si es clickable */
            transition: 'transform 0.2s ease-in-out',
          }}
          // Efecto hover simple en línea (opcional, para dar feedback visual)
          onMouseEnter={(e) => {
             if(onImageClick) e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
             if(onImageClick) e.currentTarget.style.transform = 'scale(1.00)';
          }}
        />
      </div>

      {/* === TEXTO === */}
      <div
        style={{
          flex: '1 1 100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          order: 2,
          paddingRight: '0px',
          textAlign: 'center', 
          
          '@media (min-width: 768px)': {
            flex: 1,
            order: 1,
            paddingRight: '40px',
            textAlign: 'left', 
          },
        }}
        className="bannerizq-text"
      >
        <h2
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {titulo}
        </h2>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            lineHeight: '1.6',
            textAlign: 'justify',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          {texto}
        </p>
      </div>
    </div>
  );
};

Bannerizq.propTypes = {
  titulo: PropTypes.string.isRequired,
  texto: PropTypes.string.isRequired,
  imagenURL: PropTypes.string.isRequired,
  onImageClick: PropTypes.func, // Nueva prop opcional
};

export default Bannerizq;