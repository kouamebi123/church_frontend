// Configuration de l'API backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://church-production-9a34.up.railway.app" || 'http://localhost:5001';
export const API_URL = `${API_BASE_URL}/api`;

// Configuration pour les images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Ajouter un / si le chemin ne commence pas par /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  // Ajouter un paramètre de cache-busting pour forcer le rechargement
  const url = `${API_BASE_URL}${path}`;
  const finalUrl = url.includes('?') ? `${url}&cb=${Date.now()}` : `${url}?cb=${Date.now()}`;

  
  return finalUrl;
};
