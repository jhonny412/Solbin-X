// Service Worker para Solbin-X - PWA
const CACHE_NAME = 'solbin-v2';
const CAROUSEL_CACHE_NAME = 'solbin-carousel-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/carrito.html',
    '/login.html',
    '/gracias.html',
    '/reclamos.html',
    '/admin.html',
    '/cart.js',
    '/loader.js',
    '/script.js',
    '/carrito-script.js',
    '/supabase-config.js',
    '/security-utils.js',
    '/chatbot-solbin.js',
    '/newsletter.js',
    '/Imagenes/Version_Web.svg',
    '/Imagenes/FavIcon.svg'
];

// Función para verificar si una URL es una imagen del carrusel
function isCarouselImage(url) {
    return url.includes('supabase.co') && 
           (url.includes('/carousel/') || url.includes('carousel-images'));
}

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Error caching static assets:', err);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== CAROUSEL_CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Manejar imágenes del carrusel de Supabase - Cache First para máxima velocidad
    if (isCarouselImage(url.href)) {
        event.respondWith(handleCarouselImage(request));
        return;
    }

    // Skip cross-origin requests (excepto las del carrusel que ya manejamos arriba)
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API requests to Supabase (que no sean imágenes)
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version
                    console.log('[SW] Serving from cache:', request.url);
                    return cachedResponse;
                }

                // Fetch from network
                return fetch(request)
                    .then(networkResponse => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Cache the new resource
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Manejar imágenes del carrusel con estrategia Cache First + Background Update
async function handleCarouselImage(request) {
    const carouselCache = await caches.open(CAROUSEL_CACHE_NAME);
    
    // Intentar obtener del caché primero
    const cachedResponse = await carouselCache.match(request);
    
    if (cachedResponse) {
        console.log('[SW] Carousel image from cache:', request.url);
        
        // Actualizar en segundo plano (stale-while-revalidate)
        fetch(request)
            .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    carouselCache.put(request, networkResponse.clone());
                    console.log('[SW] Carousel image updated in background');
                }
            })
            .catch(() => {
                // Ignorar errores de red, usamos el caché
            });
        
        return cachedResponse;
    }
    
    // Si no está en caché, buscar en la red
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            // Guardar en caché para futuras visitas
            carouselCache.put(request, networkResponse.clone());
            console.log('[SW] Carousel image cached:', request.url);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Failed to fetch carousel image:', error);
        // Retornar una respuesta de error o placeholder
        return new Response('Carousel image not available', { status: 503 });
    }
}

// Función para precachear imágenes del carrusel (llamada desde loader.js)
async function precacheCarouselImages(imageUrls) {
    const carouselCache = await caches.open(CAROUSEL_CACHE_NAME);
    let cachedCount = 0;
    
    for (const url of imageUrls) {
        try {
            // Verificar si ya está en caché
            const cached = await carouselCache.match(url);
            if (cached) {
                console.log('[SW] Already cached:', url);
                cachedCount++;
                continue;
            }
            
            // Descargar y cachear
            const response = await fetch(url);
            if (response.status === 200) {
                await carouselCache.put(url, response);
                console.log('[SW] Precached carousel image:', url);
                cachedCount++;
            }
        } catch (error) {
            console.error('[SW] Failed to precache:', url, error);
        }
    }
    
    // Enviar confirmación al cliente
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'CAROUSEL_CACHED',
            count: cachedCount,
            total: imageUrls.length
        });
    });
}

// Escuchar mensajes desde la aplicación
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'PRECACHE_CAROUSEL') {
        console.log('[SW] Received precache request for carousel images');
        event.waitUntil(
            precacheCarouselImages(event.data.urls)
        );
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Handle push notifications (for future use)
self.addEventListener('push', event => {
    console.log('[SW] Push received');
    const data = event.data?.json() || {};
    const title = data.title || 'Solbin-X';
    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: '/Imagenes/FavIcon.svg',
        badge: '/Imagenes/FavIcon.svg',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Background sync (for future use - save cart offline)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    }
});

async function syncCart() {
    // Implementation for syncing cart when back online
    try {
        const cache = await caches.open('cart-v1');
        const requests = await cache.keys();
        for (const request of requests) {
            if (request.url.includes('/api/cart')) {
                const response = await cache.match(request);
                const data = await response.json();
                // Send to server
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                // Delete from cache
                await cache.delete(request);
            }
        }
    } catch (err) {
        console.error('[SW] Error syncing cart:', err);
    }
}

console.log('[SW] Service Worker loaded');
