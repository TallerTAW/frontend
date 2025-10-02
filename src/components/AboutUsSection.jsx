// src/components/AboutUsSection.jsx
import React, { useState, useEffect } from 'react';

function AboutUsSection() {
    const [content, setContent] = useState({
        quienesSomos: "Cargando Quiénes Somos...",
        mision: "Cargando Misión...",
        vision: "Cargando Visión...",
        valores: ["Cargando Valores..."]
    });

    useEffect(() => {
        // --- SIMULACIÓN DE CARGA DE DATOS DESDE UNA API / BASE DE DATOS ---
        // En un proyecto real, usarías 'fetch' aquí:
        // fetch('/api/about-us')
        //    .then(response => response.json())
        //    .then(data => setContent(data))
        //    .catch(error => console.error("Error al cargar contenido:", error));

        // Por ahora, simulamos los datos directamente:
        const simulatedData = {
            quienesSomos: "Somos un equipo de apasionados por el deporte y la tecnología, dedicados a eliminar las barreras entre los deportistas y sus canchas. <strong>OlympiaHub</strong> nació de la frustración de no encontrar un lugar disponible, y hoy somos el puente digital que facilita el juego.",
            mision: "Facilitar la reserva de espacios deportivos de forma rápida, segura y eficiente, impulsando la práctica deportiva y el bienestar en la comunidad.",
            vision: "Ser la plataforma líder mundial en gestión y reserva de espacios deportivos, reconocida por su innovación tecnológica y su impacto positivo en la vida de los atletas.",
            valores: [
                "<strong>Innovación:</strong> Buscamos constantemente la mejor tecnología.",
                "<strong>Integridad:</strong> Transparencia en cada reserva.",
                "<strong>Comunidad:</strong> Conectar a los amantes del deporte.",
                "<strong>Pasión:</strong> Vivimos y respiramos deporte."
            ]
        };

        // Simular un retardo de red para ver el "Cargando..."
        setTimeout(() => {
            setContent(simulatedData);
        }, 500); // Carga los datos después de 0.5 segundos
        
    }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

    return (
        <>
            <section id="quienes-somos" className="info-section">
                <h2 className="section-title">Quiénes Somos</h2>
                {/* Usamos dangerouslySetInnerHTML para renderizar HTML desde el string */}
                <p dangerouslySetInnerHTML={{ __html: content.quienesSomos }}></p>
            </section>

            <section id="mision-vision" className="info-section alternate-bg">
                <h2 className="section-title">Misión & Visión</h2>
                <div className="mission-vision-grid">
                    <div>
                        <h3 className="subsection-title">Nuestra Misión</h3>
                        <p dangerouslySetInnerHTML={{ __html: content.mision }}></p>
                    </div>
                    <div>
                        <h3 className="subsection-title">Nuestra Visión</h3>
                        <p dangerouslySetInnerHTML={{ __html: content.vision }}></p>
                    </div>
                </div>
            </section>

            <section id="valores" className="info-section">
                <h2 className="section-title">Nuestros Valores</h2>
                <ul className="values-list">
                    {content.valores.map((valor, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: valor }}></li>
                    ))}
                </ul>
            </section>
        </>
    );
}

export default AboutUsSection;