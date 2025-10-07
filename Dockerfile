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

# Exposer le port (Railway injecte $PORT)
EXPOSE 3000

# Utiliser vite preview avec le port dynamique de Railway
CMD sh -c "npx vite preview --host 0.0.0.0 --port ${PORT:-3000}"