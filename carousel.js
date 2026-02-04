/**
 * Carousel Module - Solución Robusta con Soporte para Recargas
 */

(function() {
    'use strict';
    
    // Variables globales del módulo
    let currentIndex = 0;
    let intervalId = null;
    let slides = [];
    let dots = [];
    let isInitialized = false;
    const delay = 5000; // 5 segundos
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Esperar un poco para que loader.js cargue las imágenes primero
            setTimeout(initCarousel, 500);
        });
    } else {
        // Esperar un poco para que loader.js cargue las imágenes primero
        setTimeout(initCarousel, 500);
    }
    
    function initCarousel() {
        console.log('[Carousel] Iniciando...');
        
        // Limpiar intervalo anterior si existe
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        
        const track = document.getElementById('carousel-track');
        if (!track) {
            console.error('[Carousel] No se encontró el track');
            return;
        }
        
        // Obtener slides y dots actualizados
        slides = Array.from(track.querySelectorAll('.carousel-slide'));
        dots = Array.from(document.querySelectorAll('.carousel-dot'));
        
        console.log('[Carousel] Total slides:', slides.length);
        
        if (slides.length === 0) {
            console.warn('[Carousel] No hay slides aún, esperando carga...');
            return;
        }
        
        // Verificar que las imágenes existen
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                console.log(`[Carousel] Slide ${index}: ${img.src.split('/').pop()}`);
            }
        });
        
        // Función para mostrar una slide específica
        function showSlide(index) {
            if (index < 0 || index >= slides.length) return;
            
            // Remover active de todas
            slides.forEach((slide) => {
                slide.classList.remove('active');
            });
            dots.forEach((dot) => {
                dot.classList.remove('active');
            });
            
            // Agregar active a la slide actual
            slides[index].classList.add('active');
            if (dots[index]) {
                dots[index].classList.add('active');
            }
            
            currentIndex = index;
        }
        
        // Siguiente slide
        function nextSlide() {
            const next = (currentIndex + 1) % slides.length;
            showSlide(next);
        }
        
        // Anterior slide
        function prevSlide() {
            const prev = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(prev);
        }
        
        // Configurar dots (limpiar listeners anteriores clonando)
        const dotsContainer = document.getElementById('carousel-dots-container');
        if (dotsContainer) {
            const newDotsContainer = dotsContainer.cloneNode(true);
            dotsContainer.parentNode.replaceChild(newDotsContainer, dotsContainer);
            
            // Actualizar referencia a los nuevos dots
            dots = Array.from(newDotsContainer.querySelectorAll('.carousel-dot'));
            
            // Agregar listeners
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    resetTimer();
                });
            });
        }
        
        // Timer
        function startTimer() {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(nextSlide, delay);
        }
        
        function stopTimer() {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
        
        function resetTimer() {
            stopTimer();
            startTimer();
        }
        
        // Exponer funciones globales
        window.carouselNext = function() {
            nextSlide();
            resetTimer();
        };
        
        window.carouselPrev = function() {
            prevSlide();
            resetTimer();
        };
        
        // Inicializar
        showSlide(0);
        startTimer();
        
        // Configurar hover solo una vez
        if (!isInitialized) {
            const container = document.getElementById('carousel-main-container');
            if (container) {
                container.addEventListener('mouseenter', stopTimer);
                container.addEventListener('mouseleave', startTimer);
            }
            isInitialized = true;
        }
        
        console.log('[Carousel] Listo con', slides.length, 'slides!');
    }
    
    // Función global para reiniciar el carrusel (llamada desde loader.js después de cargar imágenes)
    window.restartCarousel = function() {
        console.log('[Carousel] Reiniciando con nuevas imágenes...');
        initCarousel();
    };
})();
