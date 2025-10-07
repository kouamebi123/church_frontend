// Service Worker pour le cache intelligent
const CACHE_NAME = 'church-management-v1';
const STATIC_CACHE = 'church-static-v1';
const API_CACHE = 'church-api-v1';

// Fichiers statiques à mettre en cache
const STATIC_FILES = [
  "/50x.html",
  "/IMG_7993.jpg",
  "/asset-manifest.json",
  "/favicon.ico",
  "/index.html",
  "/logo-sm-acer (1).png",
  "/logo-sm-acer.png",
  "/logo192.png",
  "/logo512.png",
  "/manifest.json",
  "/static/css/41.f3ed3ae4.chunk.css",
  "/static/css/41.f3ed3ae4.chunk.css.map",
  "/static/css/main.c8b210ae.css",
  "/static/css/main.c8b210ae.css.map",
  "/static/js/122.58fe7b21.chunk.js",
  "/static/js/122.58fe7b21.chunk.js.map",
  "/static/js/184.ce89b192.chunk.js",
  "/static/js/184.ce89b192.chunk.js.map",
  "/static/js/220.9f2d7a3f.chunk.js",
  "/static/js/220.9f2d7a3f.chunk.js.map",
  "/static/js/238.42215d7c.chunk.js",
  "/static/js/238.42215d7c.chunk.js.map",
  "/static/js/291.8fffffdc.chunk.js",
  "/static/js/291.8fffffdc.chunk.js.map",
  "/static/js/360.5e207d4e.chunk.js",
  "/static/js/360.5e207d4e.chunk.js.map",
  "/static/js/41.0f4f0ce6.chunk.js",
  "/static/js/41.0f4f0ce6.chunk.js.map",
  "/static/js/440.6e4bb3fe.chunk.js",
  "/static/js/440.6e4bb3fe.chunk.js.map",
  "/static/js/453.d9749a7d.chunk.js",
  "/static/js/453.d9749a7d.chunk.js.map",
  "/static/js/460.e8f4d708.chunk.js",
  "/static/js/460.e8f4d708.chunk.js.map",
  "/static/js/668.58ccd1cf.chunk.js",
  "/static/js/668.58ccd1cf.chunk.js.map",
  "/static/js/698.3ccdad88.chunk.js",
  "/static/js/698.3ccdad88.chunk.js.map",
  "/static/js/766.a7ab2b38.chunk.js",
  "/static/js/766.a7ab2b38.chunk.js.map",
  "/static/js/830.ddffd9c7.chunk.js",
  "/static/js/830.ddffd9c7.chunk.js.map",
  "/static/js/857.163e58fe.chunk.js",
  "/static/js/857.163e58fe.chunk.js.map",
  "/static/js/860.574a2b71.chunk.js",
  "/static/js/860.574a2b71.chunk.js.LICENSE.txt",
  "/static/js/860.574a2b71.chunk.js.map",
  "/static/js/9.5f961856.chunk.js",
  "/static/js/9.5f961856.chunk.js.map",
  "/static/js/956.26df072c.chunk.js",
  "/static/js/956.26df072c.chunk.js.map",
  "/static/js/main.c1a051f9.js",
  "/static/js/main.c1a051f9.js.LICENSE.txt",
  "/static/js/main.c1a051f9.js.map",
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
