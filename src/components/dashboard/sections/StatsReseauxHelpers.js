// Helpers pour StatsReseaux.js

// Transforme les données pour le Stacked Bar Chart (composition membres par catégorie)
export function transformStackedBarData(rawData) {
  // rawData attendu : [{ name, qualification: { Leader: 10, "Régulier": 20, ... } }, ...]
  // On veut : [{ name, Leader: 10, Régulier: 20, ... }, ...]
  
  // Vérification de sécurité : s'assurer que rawData est un tableau
  if (!Array.isArray(rawData)) {
    return [];
  }
  
  return rawData.map(n => ({ name: n.name, ...n.qualification }));
}

// Calcule le taux de croissance (%) pour chaque réseau
export function computeGrowthData(evolutionData) {
  // evolutionData attendu : [{ month, Reseau1: 10, Reseau2: 20, ... }, ...]
  // On calcule la croissance entre le dernier et l'avant-dernier mois
  if (!evolutionData || evolutionData.length < 2) return [];
  const prev = evolutionData[evolutionData.length - 2];
  const curr = evolutionData[evolutionData.length - 1];
  const result = [];
  Object.keys(curr).forEach(key => {
    if (key === 'month') return;
    const prevVal = prev[key] || 0;
    const currVal = curr[key] || 0;
    let growth;
    if (prevVal === 0) {
      growth = currVal > 0 ? 'Nouveau' : null;
    } else {
      growth = Math.round(((currVal - prevVal) / prevVal) * 1000) / 10;
    }
    result.push({
      name: key,
      croissance: growth,
      actuel: currVal,
      precedent: prevVal
    });
  });
  return result;
}
