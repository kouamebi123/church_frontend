# Configuration des variables d'environnement Railway

## Variables à ajouter dans Railway Dashboard

Allez dans votre projet Railway → Service Frontend → Variables → Raw Editor

Ajoutez ces variables :

```
VITE_API_URL=https://church-production-9a34.up.railway.app
VITE_BACKEND_URL=https://church-production-9a34.up.railway.app
VITE_HIDE_CONSOLE=true
VITE_PERFORMANCE_TRACKING=false
NODE_ENV=production
```

## Important

- Remplacez `https://church-production-9a34.up.railway.app` par l'URL réelle de votre backend Railway
- Ces variables sont utilisées pendant le BUILD (pas le runtime)
- Après modification, redéployez le frontend

## Vérification

Après redéploiement, dans la console du frontend, vous devriez voir :
- Les requêtes vers `https://church-production-9a34.up.railway.app/api/...`
- Pas d'erreur CORS
- Pas d'erreur localhost

