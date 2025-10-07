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

# Production stage
FROM node:20-alpine

WORKDIR /app

# Installer serve pour servir les fichiers statiques
RUN npm install -g serve

# Copier les fichiers buildés
COPY --from=build /app/build ./build

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port (Railway utilise $PORT)
EXPOSE 3000

# Démarrer l'application avec variable d'environnement PORT
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]