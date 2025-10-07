// Service Worker pour le cache intelligent
const CACHE_NAME = 'church-management-v1';
const STATIC_CACHE = 'church-static-v1';
const API_CACHE = 'church-api-v1';

// Fichiers statiques à mettre en cache
const STATIC_FILES = [
  "/IMG_7993.jpg",
  "/favicon.ico",
  "/index.html",
  "/logo-sm-acer (1).png",
  "/logo-sm-acer.png",
  "/logo192.png",
  "/logo512.png",
  "/manifest.json",
  "/zones.json"
];

// Patterns d'API à mettre en cache
const API_PATTERNS = [
  /\/api\/stats/,
  /\/api\/users/,
  /\/api\/networks/
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        // Ajouter les fichiers un par un pour éviter les erreurs
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Impossible de mettre en cache ${url}:`, err);
              return null;
            })
          )
        );
      }),
      caches.open(API_CACHE).then(cache => {
        return Promise.resolve();
      })
    ]).then(() => {
      return self.skipWaiting();
    }).catch(err => {
      console.error('Erreur lors de l\'installation du service worker:', err);
      return self.skipWaiting();
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non supportées par le cache
  if (!canCache(request)) {
    return; // Laisser le navigateur gérer ces requêtes normalement
  }

  // Stratégie pour les fichiers statiques
  if (request.method === 'GET' && isStaticFile(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Stratégie pour les APIs
  if (request.method === 'GET' && isAPIRequest(request.url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Stratégie par défaut : réseau d'abord
  event.respondWith(networkFirst(request));
});

// Vérifier si une requête peut être mise en cache
function canCache(request) {
  const url = new URL(request.url);
  // Exclure les schémas non supportés
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:' ||
      url.protocol === 'data:' ||
      url.protocol === 'blob:') {
    return false;
  }
  return true;
}

// Stratégie Cache First (pour les fichiers statiques)
async function cacheFirst(request, cacheName) {
  try {
    // Vérifier si la requête peut être mise en cache
    if (!canCache(request)) {
      return fetch(request);
    }

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Offline content not available', { status: 503 });
  }
}

// Stratégie Network First (pour les APIs)
async function networkFirst(request, cacheName = null) {
  try {
    // Vérifier si la requête peut être mise en cache
    if (!canCache(request)) {
      return fetch(request);
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (cacheName) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Retourner une réponse d'erreur appropriée
    return new Response(JSON.stringify({
      success: false,
      message: 'Réseau indisponible',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Vérifier si c'est un fichier statique
function isStaticFile(url) {
  return url.includes('/static/') || 
         url.includes('.js') || 
         url.includes('.css') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.ico');
}

// Vérifier si c'est une requête API
function isAPIRequest(url) {
  return url.includes('/api/') && API_PATTERNS.some(pattern => pattern.test(url));
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

// Nettoyer tous les caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Nettoyage périodique des caches
setInterval(async () => {
  const cacheNames = await caches.keys();
  const now = Date.now();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        const age = now - responseDate;
        
        // Supprimer les entrées de plus de 24h
        if (age > 24 * 60 * 60 * 1000) {
          await cache.delete(request);
        }
      }
    }
  }
}, 60 * 60 * 1000); // Vérifier toutes les heures
