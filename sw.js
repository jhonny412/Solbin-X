// Service Worker para Solbin-X - PWA
const CACHE_NAME = 'solbin-v1';
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
                        .filter(name => name !== CACHE_NAME)
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

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip API requests to Supabase
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
