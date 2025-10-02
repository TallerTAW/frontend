// src/components/Footer.jsx
import React from 'react';

function Footer() {
    return (
        <footer className="bg-dark-text text-light py-10 px-[10%] font-body">
            <div className="flex justify-between items-start pb-5 border-b border-solid border-rgba(255,255,255,0.1)">
                <div className="font-heading text-xl text-secondary-green">OlympiaHub</div>
                <div className="flex gap-5">
                    <a href="#quienes-somos" className="text-light text-decoration-none font-light transition-colors duration-200 hover:text-primary-blue">Acerca de</a>
                    <a href="#" className="text-light text-decoration-none font-light transition-colors duration-200 hover:text-primary-blue">Ayuda</a>
                    <a href="#" className="text-light text-decoration-none font-light transition-colors duration-200 hover:text-primary-blue">Términos y Condiciones</a>
                    <a href="#" className="text-light text-decoration-none font-light transition-colors duration-200 hover:text-primary-blue">Política de Privacidad</a>
                </div>
                <div className="text-sm">
                    <p>Síguenos en redes</p>
                </div>
            </div>
            <div className="text-center pt-5 text-xs text-rgba(255,255,255,0.6)">
                &copy; 2025 OlympiaHub. Todos los derechos reservados.
            </div>
        </footer>
    );
}

export default Footer;