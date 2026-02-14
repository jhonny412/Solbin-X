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
            // Iniciar inmediatamente, el loader.js manejará el orden correcto
            initCarousel();
        });
    } else {
        // Iniciar inmediatamente
        initCarousel();
    }
    
    function initCarousel() {
        
        
        // Limpiar intervalo anterior si existe
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        
        const track = document.getElementById('carousel-track');
        if (!track) {
            
            return;
        }
        
        // Obtener slides y dots actualizados (excluyendo el skeleton loader)
        slides = Array.from(track.querySelectorAll('.carousel-slide:not(.carousel-skeleton)'));
        dots = Array.from(document.querySelectorAll('.carousel-dot'));
        
        
        
        if (slides.length === 0) {
            
            // Reintentar en 100ms si no hay slides
            if (!isInitialized) {
                setTimeout(initCarousel, 100);
            }
            return;
        }
        
        // Verificar que las imágenes existen y están cargadas
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                .pop()}`);
                // Asegurar que la imagen tenga opacidad correcta
                if (slide.classList.contains('active')) {
                    img.style.opacity = '1';
                }
            }
        });
        
        // Función para mostrar una slide específica
        function showSlide(index) {
            if (index < 0 || index >= slides.length) return;
            
            // Remover active de todas y resetear opacidad de imágenes
            slides.forEach((slide) => {
                slide.classList.remove('active');
                const img = slide.querySelector('img');
                if (img) {
                    img.style.opacity = '0';
                }
            });
            dots.forEach((dot) => {
                dot.classList.remove('active');
            });
            
            // Agregar active a la slide actual
            const currentSlide = slides[index];
            currentSlide.classList.add('active');
            
            // Mostrar la imagen actual con transición suave
            const currentImg = currentSlide.querySelector('img');
            if (currentImg) {
                // Usar requestAnimationFrame para animación suave
                requestAnimationFrame(() => {
                    currentImg.style.opacity = '1';
                });
            }
            
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
        
        
    }
    
    // Función global para reiniciar el carrusel (llamada desde loader.js después de cargar imágenes)
    window.restartCarousel = function() {
        
        initCarousel();
    };
})();
