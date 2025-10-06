const fs = require('fs');
const path = require('path');

// Fonction pour récursivement lister tous les fichiers dans un dossier
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Générer le service worker avec les vrais fichiers
function generateServiceWorker() {
  const buildDir = path.join(__dirname, '../build');
  const publicDir = path.join(__dirname, '../public');
  
  if (!fs.existsSync(buildDir)) {
    console.log('Dossier build non trouvé, utilisation des fichiers par défaut');
    return;
  }

  // Lister tous les fichiers du build
  const allFiles = getAllFiles(buildDir);
  const staticFiles = allFiles
    .map(file => {
      // Convertir le chemin absolu en chemin relatif depuis la racine
      const relativePath = path.relative(buildDir, file);
      return '/' + relativePath.replace(/\\/g, '/');
    })
    .filter(file => {
      // Inclure seulement les fichiers statiques importants
      return file.includes('/static/') || 
             file.endsWith('.html') || 
             file.endsWith('.json') || 
             file.endsWith('.ico') || 
             file.endsWith('.png') || 
             file.endsWith('.jpg') || 
             file.endsWith('.jpeg') || 
             file.endsWith('.gif') || 
             file.endsWith('.svg') ||
             file === '/';
    })
    .sort();

  console.log('Fichiers détectés pour le cache:', staticFiles);

  // Lire le template du service worker
  const swTemplate = fs.readFileSync(path.join(publicDir, 'sw.js'), 'utf8');
  
  // Remplacer la liste des fichiers statiques
  const updatedSW = swTemplate.replace(
    /const STATIC_FILES = \[[\s\S]*?\];/,
    `const STATIC_FILES = ${JSON.stringify(staticFiles, null, 2)};`
  );

  // Écrire le service worker mis à jour
  fs.writeFileSync(path.join(buildDir, 'sw.js'), updatedSW);
  console.log('Service worker généré avec succès dans build/sw.js');
}

// Exécuter la génération
generateServiceWorker();




