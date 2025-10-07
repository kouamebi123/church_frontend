# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --silent

# Copier le code source
COPY . .

# Build l'application
RUN npm run build

# Production stage - Utiliser directement Vite preview
FROM node:20-alpine

WORKDIR /app

# Copier package.json et installer SEULEMENT les dépendances de production + vite
COPY --from=build /app/package*.json ./
RUN npm ci --only=production && npm install vite

# Copier les fichiers buildés
COPY --from=build /app/build ./build
COPY --from=build /app/vite.config.js ./

# Copier le script de démarrage
COPY start.sh ./
RUN chmod +x start.sh

# Exposer le port (Railway injecte $PORT)
EXPOSE 3000

# Utiliser le script de démarrage avec logs de debug
CMD ["./start.sh"]