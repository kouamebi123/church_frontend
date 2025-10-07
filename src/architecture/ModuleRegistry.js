// Système de registre de modules pour une architecture modulaire avancée

class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.dependencies = new Map();
    this.hooks = new Map();
    this.middleware = [];
    this.plugins = new Map();
  }

  // Enregistrer un module
  registerModule(name, module) {
    if (this.modules.has(name)) {
      return;
    }

    this.modules.set(name, {
      ...module,
      name,
      registeredAt: new Date(),
      status: 'registered'
    });

    // Vérifier les dépendances
    if (module.dependencies) {
      this.dependencies.set(name, module.dependencies);
      this.validateDependencies(name);
    }

    // Initialiser le module si possible
    if (module.init) {
      try {
        module.init();
        this.modules.get(name).status = 'initialized';
      } catch (error) {
        this.modules.get(name).status = 'error';
      }
    }
  }

  // Obtenir un module
  getModule(name) {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module ${name} non trouvé`);
    }
    return module;
  }

  // Vérifier si un module existe
  hasModule(name) {
    return this.modules.has(name);
  }

  // Lister tous les modules
  listModules() {
    return Array.from(this.modules.keys());
  }

  // Obtenir le statut d'un module
  getModuleStatus(name) {
    const module = this.modules.get(name);
    return module ? module.status : 'not_found';
  }

  // Valider les dépendances d'un module
  validateDependencies(moduleName) {
    const dependencies = this.dependencies.get(moduleName);
    if (!dependencies) return true;

    const missingDeps = dependencies.filter(dep => !this.modules.has(dep));

    if (missingDeps.length > 0) {
      return false;
    }

    return true;
  }

  // Enregistrer un hook
  registerHook(name, callback, priority = 0) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    this.hooks.get(name).push({
      callback,
      priority,
      registeredAt: new Date()
    });

    // Trier par priorité (plus élevée en premier)
    this.hooks.get(name).sort((a, b) => b.priority - a.priority);
  }

  // Exécuter un hook
  async executeHook(name, data = null) {
    const hooks = this.hooks.get(name);
    if (!hooks || hooks.length === 0) {
      return data;
    }

    let result = data;
    for (const hook of hooks) {
      try {
        result = await hook.callback(result);
      } catch (error) {
        // Erreur silencieuse dans le hook
      }
    }

    return result;
  }

  // Ajouter un middleware
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  // Exécuter les middlewares
  async executeMiddleware(data, context = {}) {
    let result = data;

    for (const middleware of this.middleware) {
      try {
        result = await middleware(result, context);
      } catch (error) {
        // logger.error('Erreur dans le middleware:', error);
      }
    }

    return result;
  }

  // Enregistrer un plugin
  registerPlugin(name, plugin) {
    this.plugins.set(name, {
      ...plugin,
      name,
      registeredAt: new Date()
    });

    // Initialiser le plugin
    if (plugin.init) {
      plugin.init(this);
    }
  }

  // Obtenir un plugin
  getPlugin(name) {
    return this.plugins.get(name);
  }

  // Lister tous les plugins
  listPlugins() {
    return Array.from(this.plugins.keys());
  }

  // Système d'événements
  events = new Map();

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  off(event, callback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const callbacks = this.events.get(event);
    if (callbacks) {
              callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            // logger.error('Erreur dans le callback d\'événement:', error);
          }
        });
    }
  }

  // Système de cache
  cache = new Map();

  setCache(key, value, ttl = 300000) { // 5 minutes par défaut
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Système de configuration
  config = new Map();

  setConfig(key, value) {
    this.config.set(key, value);
  }

  getConfig(key, defaultValue = null) {
    return this.config.get(key) ?? defaultValue;
  }

  // Système de métriques
  metrics = {
    moduleLoads: 0,
    hookExecutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0
  };

  incrementMetric(name) {
    if (this.metrics.hasOwnProperty(name)) {
      this.metrics[name]++;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  // Nettoyage et destruction
  destroy() {
    // Exécuter les hooks de destruction
    this.executeHook('beforeDestroy');

    // Nettoyer les modules
    for (const [name, module] of this.modules) {
      if (module.destroy) {
        try {
          module.destroy();
        } catch (error) {
          // Erreur silencieuse lors de la destruction du module
        }
      }
    }

    // Nettoyer les plugins
    for (const [name, plugin] of this.plugins) {
      if (plugin.destroy) {
        try {
          plugin.destroy();
        } catch (error) {
          // Erreur silencieuse lors de la destruction du plugin
        }
      }
    }

    // Vider les collections
    this.modules.clear();
    this.dependencies.clear();
    this.hooks.clear();
    this.middleware = [];
    this.plugins.clear();
    this.events.clear();
    this.cache.clear();
    this.config.clear();
  }
}

// Instance singleton
const moduleRegistry = new ModuleRegistry();


// Hooks système par défaut
moduleRegistry.registerHook('moduleRegistered', (moduleName) => {
  moduleRegistry.incrementMetric('moduleLoads');
}, 100);

moduleRegistry.registerHook('beforeDestroy', () => {
  // Destruction du registre de modules
}, 1000);

export default moduleRegistry;