// src/components/HeroSection.jsx
import React from 'react';

function HeroSection() {
    return (
        <section className="min-h-[90vh] flex justify-center items-center text-center 
                            bg-gradient-to-r from-primary-blue to-secondary-green text-light">
            <div className="max-w-xl p-5">
                <h1 className="font-heading text-6xl font-bold leading-tight mb-5 text-shadow-md">
                    Tu Cancha. Tu Hora. <br /> Reservada al Instante.
                </h1>
                <p className="font-body text-lg mb-10 font-normal">
                    La plataforma que conecta a deportistas con los mejores espacios cerca de ti, con tecnología de vanguardia.
                </p>
                <button className="bg-accent-orange text-light text-xl py-4 px-10 border-b-4 border-[#cc5800] 
                                    rounded-md font-bold font-body transition-all duration-300 ease hover:bg-[#ff8c33] 
                                    hover:transform hover:translate-y-[-2px] hover:shadow-md">
                    ¡Reserva Ahora!
                </button>
            </div>
        </section>
    );
}

export default HeroSection;