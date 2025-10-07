#!/usr/bin/env node

/**
 * Script pour nettoyer tous les console.log et les remplacer par le logger centralisé
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDED_FILES = [
  'logger.js',
  '__tests__',
  'node_modules'
];

// Patterns de remplacement
const REPLACEMENTS = [
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'logger.info('
  },
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.debug('
  }
];

/**
 * Vérifie si un fichier doit être exclu
 */
function shouldExcludeFile(filePath) {
  return EXCLUDED_FILES.some(excluded => filePath.includes(excluded));
}

/**
 * Ajoute l'import du logger si nécessaire
 */
function addLoggerImport(content) {
  // Vérifier si logger est déjà importé
  if (content.includes("import logger from") || content.includes("import { logger }")) {
    return content;
  }

  // Vérifier si le fichier utilise des console.log
  if (!content.includes('console.') && !content.includes('logger.')) {
    return content;
  }

  // Trouver la position pour ajouter l'import
  const lines = content.split('\n');
  let importIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('const ') || lines[i].startsWith('let ') || lines[i].startsWith('var ')) {
      importIndex = i;
    } else if (lines[i].trim() === '' && importIndex !== -1) {
      break;
    }
  }

  // Ajouter l'import du logger
  const loggerImport = "import logger from '../utils/logger';\n";
  
  if (importIndex === -1) {
    // Aucun import trouvé, ajouter au début
    return loggerImport + content;
  } else {
    // Ajouter après le dernier import
    lines.splice(importIndex + 1, 0, loggerImport);
    return lines.join('\n');
  }
}

/**
 * Traite un fichier
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Appliquer les remplacements
    REPLACEMENTS.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    // Ajouter l'import du logger si nécessaire
    if (modified) {
      content = addLoggerImport(content);
    }

    // Écrire le fichier modifié
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Traité: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Parcourt récursivement un répertoire
 */
function processDirectory(dirPath) {
  let processedCount = 0;
  let errorCount = 0;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!shouldExcludeFile(itemPath)) {
          const result = processDirectory(itemPath);
          processedCount += result.processed;
          errorCount += result.errors;
        }
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        if (!shouldExcludeFile(itemPath)) {
          if (processFile(itemPath)) {
            processedCount++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors du parcours de ${dirPath}:`, error.message);
    errorCount++;
  }

  return { processed: processedCount, errors: errorCount };
}

/**
 * Fonction principale
 */
function main() {
  console.log('🧹 Nettoyage des console.log...\n');

  const result = processDirectory(SRC_DIR);

  console.log(`\n📊 Résumé:`);
  console.log(`   Fichiers traités: ${result.processed}`);
  console.log(`   Erreurs: ${result.errors}`);

  if (result.errors === 0) {
    console.log('\n✅ Nettoyage terminé avec succès!');
  } else {
    console.log('\n⚠️  Nettoyage terminé avec des erreurs.');
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
