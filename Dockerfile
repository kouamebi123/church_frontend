# Dockerfile optimisé pour le frontend React avec Vite
FROM node:20-alpine AS dependencies

# Installer les dépendances système nécessaires uniquement
RUN apk add --no-cache git && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier SEULEMENT les fichiers de dépendances (pour optimiser le cache)
COPY package*.json ./

# Installer TOUTES les dépendances (dev + prod pour Vite)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --silent && \
    npm cache clean --force

# Stage de build séparé
FROM node:20-alpine AS build

WORKDIR /app

# Copier les node_modules depuis le stage précédent
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copier le code source (seulement ce qui est nécessaire)
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.js ./
COPY vitest.config.js ./
COPY scripts/ ./scripts/

# Construire l'application avec Vite (cache des modules)
RUN --mount=type=cache,target=/app/node_modules/.vite \
    npm run build

# Stage de production optimisé
FROM nginx:alpine AS production

# Installer seulement ce qui est nécessaire
RUN apk add --no-cache tzdata && \
    rm -rf /var/cache/apk/*

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/build /usr/share/nginx/html

# Optimiser les permissions en une seule commande
RUN chmod -R 644 /usr/share/nginx/html/* && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    mkdir -p /var/log/nginx /var/cache/nginx /var/run /tmp/nginx && \
    chown -R root:root /var/log/nginx /var/cache/nginx /var/run /tmp/nginx

# Variables d'environnement pour Nginx
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

# Exposer le port
EXPOSE 3000

# Démarrer Nginx en tant que root pour éviter les problèmes de permissions
CMD ["nginx", "-g", "daemon off;"]