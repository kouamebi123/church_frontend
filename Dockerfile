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

# Installer serve localement (pas globalement)
RUN npm install serve

# Copier les fichiers buildés
COPY --from=build /app/build ./build

# Exposer le port (Railway utilise $PORT)
EXPOSE 3000

# Démarrer l'application avec npx et logs détaillés
CMD npx serve -s build -l $PORT --no-clipboard