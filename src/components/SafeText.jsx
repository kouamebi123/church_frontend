import React from 'react';

// Fonction pour échapper le HTML et prévenir les attaques XSS
const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Composant pour afficher du texte de manière sécurisée
const SafeText = ({
  children,
  as: Component = 'span',
  dangerouslySetInnerHTML = false,
  ...props
}) => {
  if (dangerouslySetInnerHTML) {
    // Attention : à utiliser avec précaution et seulement pour du contenu de confiance
    return <Component {...props} dangerouslySetInnerHTML={{ __html: children }} />;
  }

  return <Component {...props}>{escapeHtml(children)}</Component>;
};

export default SafeText;