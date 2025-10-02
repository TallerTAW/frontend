// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png'; // Asegúrate de tener tu logo en src/assets/logo.png

function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <header id="main-header" className={`flex justify-between items-center py-9 px-15 
                                            bg-dark-text border-b-0 fixed top-0 left-0 right-0 w-full z-1000 
                                            transition-all duration-300 ease ${scrolled ? 'scrolled' : ''}`}>
            <div className="flex items-center">
                <img src={logo} alt="OlympiaHub Logo" className="w-14 h-14 mr-5" />
                <span className="font-heading text-2xl font-bold text-light">OlympiaHub</span>
            </div>
            
            <div className="flex items-center gap-14"> 
                 <nav>
                    {/* El dropdown usa las clases CSS directas que mantuvimos en src/index.css */}
                    <div className="dropdown">
                        <a href="#" className="nav-link dropdown-toggle">Sobre Nosotros <span className="dropdown-arrow"></span></a>
                        <div className="dropdown-menu">
                            <a href="#quienes-somos">Quiénes Somos</a>
                            <a href="#mision-vision">Misión & Visión</a>
                            <a href="#valores">Valores</a>
                        </div>
                    </div>
                </nav>

                <div className="flex items-center gap-6">
                    <button className="py-4 px-9 border-none rounded-3xl cursor-pointer font-bold font-body transition-all duration-300 text-base 
                                        bg-secondary-green text-light hover:bg-[#1e7e34] hover:transform hover:translate-y-[-1px]">
                        Explora Canchas
                    </button>
                    <a href="#" className="text-light font-medium text-base transition-colors duration-200 hover:text-primary-blue">Iniciar Sesión</a>
                    <a href="#" className="text-primary-blue font-medium text-base transition-colors duration-200 hover:text-accent-orange">Registrarse →</a>
                </div>
            </div>
        </header>
    );
}

export default Navbar;