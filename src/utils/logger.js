// Logger simple pour le frontend
const logger = {
  info: (message, data = null) => {
    // Log info supprimé
  },
  
  warn: (message, data = null) => {
    // console.warn(`⚠️ ${message}`, data || '');
  },
  
  error: (message, data = null) => {
    // console.error(`❌ ${message}`, data || '');
  },
  
  debug: (message, data = null) => {
    // Log debug supprimé
  }
};

export default logger;
