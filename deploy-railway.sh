#!/bin/bash

echo "🚀 Déploiement Railway Frontend"
echo "================================"

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Vous devez être dans le dossier frontend/"
    exit 1
fi

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "Installez-le avec: npm install -g @railway/cli"
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

echo "🏗️ Build de l'application..."
npm run build

echo "🚀 Déploiement sur Railway..."
railway up

echo "✅ Déploiement terminé!"
echo "🌐 Votre frontend est disponible sur Railway"
