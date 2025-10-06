# Dockerfile pour le frontend React
FROM node:18-alpine AS build

# Installer les dépendances système
RUN apk add --no-cache \
    git \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/build /usr/share/nginx/html

# Corriger les permissions des fichiers statiques
RUN chmod -R 644 /usr/share/nginx/html/* && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Créer les répertoires pour les logs
RUN mkdir -p /var/log/nginx

# Exposer le port
EXPOSE 3000

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
