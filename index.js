// AGREGAR EFECTO DE SOMBRA AL HEADER AL HACER SCROLL
document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // Distancia de scroll para activar el efecto

    window.addEventListener('scroll', () => {
        // Si el usuario se ha desplazado más allá del umbral
        if (window.scrollY > scrollThreshold) {
            // Añade una clase CSS para cambiar el estilo del header
            header.classList.add('scrolled');
        } else {
            // Quita la clase si vuelve al principio
            header.classList.remove('scrolled');
        }
    });
});

// Nota: El estilo CSS para la clase 'scrolled' está en styles.css