# Configuration des variables d'environnement Vercel

## Variables à mettre à jour dans Vercel Dashboard

Allez dans Vercel Dashboard → Votre projet → Settings → Environment Variables

**Mettez à jour ces variables :**

```
VITE_API_URL=https://churchbackend-production.up.railway.app
VITE_BACKEND_URL=https://churchbackend-production.up.railway.app
VITE_HIDE_CONSOLE=true
VITE_PERFORMANCE_TRACKING=false
NODE_ENV=production
```

## Important

- L'ancienne URL `https://church-production-9a34.up.railway.app` retourne 503
- La nouvelle URL correcte est `https://churchbackend-production.up.railway.app`
- Après modification, redéployez le projet Vercel (ou il se redéploiera automatiquement)

## Vérification

1. Allez sur https://multitudeszno.vercel.app
2. Ouvrez la console navigateur
3. Essayez de vous connecter
4. Les requêtes doivent aller vers `https://churchbackend-production.up.railway.app/api/...`
5. Plus d'erreur CORS

