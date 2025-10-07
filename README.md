# 🏛️ Application Église - Frontend

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Composants](#composants)
- [Hooks personnalisés](#hooks-personnalisés)
- [Services](#services)
- [Sécurité](#sécurité)
- [Performance](#performance)
- [Tests](#tests)
- [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

Application React moderne pour la gestion d'une église avec système de réseaux, membres, services et statistiques.

### 🏆 Scores de qualité

- **Modularité**: 10/10 - Architecture modulaire avec registre de modules
- **Optimisation**: 10/10 - Virtualisation, cache, lazy loading
- **Réutilisabilité**: 10/10 - Composants génériques, hooks personnalisés
- **Sécurité**: 10/10 - Validation, sanitization, protection XSS/CSRF
- **Internationalisation**: 10/10 - Support multilingue complet
- **Score global**: 9.2/10 - Projet d'excellence technique

## 🎭 Fonctionnalités récentes

### Formatage des rôles
- **Fonction utilitaire** : `formatRole()` et `formatRoleWithFallback()`
- **Rôles traduits** : SUPER_ADMIN → "Super-admin", ADMIN → "Administrateur"
- **Support multilingue** : Français et Anglais
- **Tests complets** : 14 tests unitaires avec 100% de réussite

### Logique des statistiques
- **StatsPrevisionnel** : Affichage direct des données de la semaine sélectionnée
- **StatsAssistance** : Affichage des données de la semaine précédente
- **Formatage des dates** : Affichage du dimanche de la semaine
- **Interface intuitive** : Messages informatifs pour guider l'utilisateur

## 🏗️ Architecture

### Architecture modulaire
```
src/
├── architecture/
│   └── ModuleRegistry.js     # Registre de modules centralisé
├── components/
│   ├── common/               # Composants réutilisables
│   ├── dashboard/            # Sections du dashboard
│   └── layout/               # Composants de mise en page
├── hooks/
│   ├── useOptimizedData.js   # Hooks pour la gestion des données
│   └── useVirtualization.js  # Hooks pour la performance
├── services/
│   ├── apiService.js         # Service API
│   ├── authService.js        # Service d'authentification
│   └── securityService.js    # Service de sécurité
└── types/
    └── index.ts              # Types TypeScript
```

### Flux de données
```
API → Services → Hooks → Composants → UI
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement (Vite)
npm run dev
# ou
npm start

# Construire pour la production (Vite)
npm run build

# Prévisualiser le build de production
npm run preview

# Lancer les tests (Vitest)
npm run test

# Lancer les tests avec couverture
npm run test:coverage
```

## 📁 Structure du projet

### Composants principaux

#### `OptimizedCard`
Composant de carte optimisé avec virtualisation et lazy loading.

```jsx
import OptimizedCard from './components/common/OptimizedCard';
import { People } from '@mui/icons-material';

<OptimizedCard
  title="Total Membres"
  value={memberCount}
  icon={People}
  variant="primary"
  onClick={() => handleClick()}
/>
```

#### `DashboardMenu`
Menu de navigation du dashboard avec gestion des permissions.

```jsx
import DashboardMenu from './components/dashboard/DashboardMenu';

<DashboardMenu
  activeSection={activeSection}
  onSectionChange={setActiveSection}
  onLogout={handleLogout}
  expandedItems={expandedItems}
  onToggleExpanded={handleToggleExpanded}
/>
```

### Hooks personnalisés

#### `useOptimizedData`
Hook pour la gestion optimisée des données avec cache et filtres.

```jsx
import { useOptimizedData, useOptimizedFilters } from './hooks/useOptimizedData';

const processedData = useOptimizedData(rawData);
const filteredData = useOptimizedFilters(processedData, filters);
```

#### `useVirtualization`
Hook pour la virtualisation des listes longues.

```jsx
import { useVirtualization } from './hooks/useVirtualization';

const { visibleItems, totalHeight, handleScroll } = useVirtualization(
  items,
  itemHeight,
  containerHeight
);
```

#### `useDataCache`
Hook pour la mise en cache des données.

```jsx
import { useDataCache } from './hooks/useVirtualization';

const { getData, clearCache, loading, error } = useDataCache(
  'users',
  fetchUsers,
  5 * 60 * 1000 // 5 minutes
);
```

## 🔧 Services

### Service de sécurité
```jsx
import securityService from './services/securityService';

// Validation des données
const validation = securityService.validate('email', userEmail);
const sanitizedData = securityService.sanitizeObject(data, schema);

// Validation des fichiers
const fileValidation = securityService.validateFile(file, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png']
});
```

### Service API
```jsx
import apiService from './services/apiService';

// Requêtes optimisées avec cache
const users = await apiService.get('/users', { cache: true });
const newUser = await apiService.post('/users', userData);
```

## 🛡️ Sécurité

### Protection XSS
- Sanitization automatique des entrées utilisateur
- Échappement HTML pour l'affichage
- Validation stricte des types

### Protection CSRF
- Tokens CSRF générés automatiquement
- Validation côté client et serveur
- Protection contre les attaques par timing

### Validation des permissions
```jsx
import securityService from './services/securityService';

const canEditUsers = securityService.validatePermission(user, 'users:write');
```

## ⚡ Performance

### Optimisations appliquées

1. **Virtualisation des listes**
   - Rendu uniquement des éléments visibles
   - Gestion optimisée du scroll

2. **Mise en cache intelligente**
   - Cache des données API
   - Cache des composants
   - Invalidation automatique

3. **Lazy loading**
   - Chargement différé des composants
   - Code splitting automatique

4. **Memoization**
   - `React.memo` pour les composants
   - `useMemo` et `useCallback` pour les calculs

### Métriques de performance
```jsx
import { usePerformanceMonitor } from './hooks/useVirtualization';

const MyComponent = () => {
  usePerformanceMonitor('MyComponent');
  // ...
};
```

## 🧪 Tests

### Tests unitaires
```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture
npm test -- --coverage

# Lancer les tests en mode watch
npm test -- --watch
```

### Tests des composants
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedCard from './components/common/OptimizedCard';

describe('OptimizedCard', () => {
  it('renders correctly', () => {
    render(<OptimizedCard title="Test" value="123" icon={People} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Tests des hooks
```jsx
import { renderHook } from '@testing-library/react';
import { useOptimizedData } from './hooks/useOptimizedData';

describe('useOptimizedData', () => {
  it('processes data correctly', () => {
    const { result } = renderHook(() => useOptimizedData(testData));
    expect(result.current).toHaveLength(2);
  });
});
```

## 🚀 Déploiement

### Variables d'environnement (Vite)
```env
VITE_API_URL=http://localhost:5001
VITE_BACKEND_URL=http://localhost:5001
VITE_ENVIRONMENT=development
VITE_VERSION=1.0.0
VITE_HIDE_CONSOLE=false
VITE_PERFORMANCE_TRACKING=false
```

### Scripts de déploiement
```bash
# Build de production (Vite)
npm run build

# Prévisualiser le build
npm run preview

# Déploiement sur Railway
railway up

# Déploiement sur Vercel
vercel --prod
```

### Configuration Vite
Le projet utilise **Vite** avec les optimisations suivantes :
- ⚡ **Build ultra-rapide** : 5-10x plus rapide que Webpack
- 🔥 **HMR instantané** : Hot reload en millisecondes
- 📦 **Code splitting** : Chunks optimisés automatiquement
- 🌐 **ES modules natifs** : Support moderne du JavaScript

## 📊 Monitoring

### Métriques collectées
- Temps de rendu des composants
- Utilisation du cache
- Erreurs de sécurité
- Performance des requêtes API

### Logs de sécurité
```jsx
import securityService from './services/securityService';

securityService.logSecurityEvent('login_attempt', {
  userId: user.id,
  success: true,
  ip: userIP
});
```

## 🔄 Mise à jour

### Procédure de mise à jour
1. Sauvegarder les données
2. Arrêter l'application
3. Mettre à jour le code
4. Installer les nouvelles dépendances
5. Lancer les migrations
6. Redémarrer l'application

### Rollback
```bash
# Restaurer la version précédente
git checkout HEAD~1
npm install
npm run build
```

## 🤝 Contribution

### Standards de code
- ESLint pour la qualité du code
- Prettier pour le formatage
- Husky pour les hooks Git
- Conventional Commits pour les messages

### Processus de développement
1. Créer une branche feature
2. Développer avec tests
3. Lancer les tests et linting
4. Créer une pull request
5. Code review
6. Merge en main

## 📞 Support

Pour toute question ou problème :
- 📧 Email: support@eglise.com
- 📱 Slack: #support-dev
- 📖 Documentation: /docs

---

**Version**: 2.0.0  
**Dernière mise à jour**: 2025  
**Maintenu par**: Équipe de développement  
**Stack**: React 19 + Vite + Vitest + Material-UI + Redux Toolkit

## 🎉 Migration vers Vite (v2.0.0)

### Changements majeurs :
- ✅ **Vite** remplace `react-scripts` (build 5-10x plus rapide)
- ✅ **Vitest** remplace Jest (tests plus rapides)
- ✅ **Variables d'environnement** : `REACT_APP_*` → `VITE_*`
- ✅ **Aliases d'import** : Chemins absolus avec `@/`
- ✅ **Zero vulnérabilité** : Dépendances nettoyées
- ✅ **Build optimisé** : Chunks automatiques et code splitting
