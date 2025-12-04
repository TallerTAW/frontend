// src/components/Bannerizq.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Bannerizq = ({ titulo, texto, imagenURL }) => {
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

      {/* === IMAGEN (PRIMERO EN MOVIL) === */}
      <div
        style={{
          flex: '1 1 100%',
          display: 'flex',
          justifyContent: 'center',
          order: 1,

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
            maxWidth: '90%',
            maxHeight: '280px',
            objectFit: 'contain',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      {/* === TEXTO (SEGUNDO EN MOVIL) === */}
      <div
        style={{
          flex: '1 1 100%',
          maxWidth: '100%',
          textAlign: 'center',
          order: 2,

          /* En pantallas grandes regresa al lado izquierdo */
          '@media (min-width: 768px)': {
            flex: 1,
            maxWidth: '50%',
            paddingRight: '60px',
            textAlign: 'left',
            order: 1,
          },
        }}
        className="bannerizq-content"
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'normal',
            marginBottom: '20px',
            color: '#fff',
          }}
        >
          {titulo}
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            lineHeight: 1.6,
          }}
        >
          {texto}
        </p>
      </div>
    </div>
  );
};

Bannerizq.propTypes = {
  texto: PropTypes.string.isRequired,
  imagenURL: PropTypes.string.isRequired,
};

export default Bannerizq;
