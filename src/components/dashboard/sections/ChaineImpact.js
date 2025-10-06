import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterFocusIcon
} from '@mui/icons-material';
import chaineImpactService from '../../../services/chaineImpactService';
import i18nService from '../../../services/i18nService';
import { API_BASE_URL } from '../../../config/apiConfig';

// Composant récursif pour rendre un nœud et ses enfants
const TreeNode = ({ node, expandedNodes, onToggle, level = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  
  // Obtenir le nom du niveau
  const getLevelName = (niveau) => {
    switch (niveau) {
      case 0:
        return 'Responsable d\'église';
      case 1:
        return 'Responsable de réseau';
      case 2:
        return '12';
      case 3:
        return '144';
      case 4:
        return '1728';
      case 5:
        return '20738';
      case 6:
        return '248832';
      default:
        return `Niveau ${niveau}`;
    }
  };

  // Obtenir la couleur du niveau
  const getLevelColor = (niveau) => {
    switch (niveau) {
      case 0:
        return 'primary';
      case 1:
        return 'secondary';
      case 2:
        return 'success';
      case 3:
        return 'info';
      case 4:
        return 'warning';
      case 5:
        return 'error';
      case 6:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Le nœud principal */}
      <Box
        onClick={() => hasChildren && onToggle(node.id)}
        sx={{
          cursor: hasChildren ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          border: '2px solid',
          borderColor: `${getLevelColor(node.niveau)}.main`,
          borderRadius: 2,
          bgcolor: `${getLevelColor(node.niveau)}.50`,
          minWidth: node.niveau === 0 ? 200 : node.niveau === 1 ? 160 : 130,
          transition: 'all 0.3s ease',
          mb: hasChildren && isExpanded ? 2 : 0,
          '&:hover': hasChildren ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderColor: `${getLevelColor(node.niveau)}.dark`
          } : {}
        }}
      >
        {/* Indicateur d'expansion */}
        {hasChildren && (
          <Box sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            bgcolor: 'white',
            border: '2px solid',
            borderColor: `${getLevelColor(node.niveau)}.main`,
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: `${getLevelColor(node.niveau)}.main`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 10
          }}>
            {isExpanded ? '−' : '+'}
          </Box>
        )}

        {/* Indicateur de connexion (flèche vers le bas) */}
        {hasChildren && (
          <Box sx={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `8px solid ${getLevelColor(node.niveau)}.main`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }} />
        )}

        {/* Avatar */}
        <Avatar
          src={node.user.image ? `${API_BASE_URL}/${node.user.image}` : undefined}
          sx={{
            width: node.niveau === 0 ? 80 : node.niveau === 1 ? 60 : 50,
            height: node.niveau === 0 ? 80 : node.niveau === 1 ? 60 : 50,
            mb: 1,
            border: '2px solid',
            borderColor: `${getLevelColor(node.niveau)}.main`
          }}
          onError={(e) => {
            // Erreur de chargement de l'image dans la chaîne d'impact
          }}
        >
          {node.user.username?.charAt(0)?.toUpperCase()}
        </Avatar>

        {/* Nom */}
        <Typography
          variant={node.niveau === 0 ? 'subtitle1' : 'body2'}
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 0.5,
            color: 'text.primary'
          }}
        >
          {node.user.username}
        </Typography>

        {/* Rôle */}
        <Typography
          variant="caption"
          sx={{
            color: `${getLevelColor(node.niveau)}.main`,
            fontWeight: '600',
            textAlign: 'center'
          }}
        >
          {getLevelName(node.niveau)}
        </Typography>

        <Chip
          label={`${node.children.length} leader${node.children.length > 1 ? 's' : ''}`}
          color={getLevelColor(node.niveau)}
          variant="filled"
          size="small"
          sx={{ mt: 1, fontSize: '0.7rem' }}
        />

      </Box>

      {/* Lignes de liaison et enfants */}
      {hasChildren && isExpanded && (
        <Box sx={{ mt: 3, position: 'relative' }}>
          {/* Ligne de liaison principale depuis le parent */}
          <Box sx={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 30,
            bgcolor: `${getLevelColor(node.niveau)}.main`,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }} />
          
          {/* Ligne horizontale de connexion entre tous les enfants */}
          {node.children.length > 1 && (
            <Box sx={{
              position: 'absolute',
              top: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 120px)', // Largeur adaptative pour centrage
              height: 4,
              bgcolor: `${getLevelColor(node.niveau)}.main`,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 5
            }} />
          )}

          {/* Lignes de connexion individuelles pour chaque enfant */}
          {node.children.map((child, index) => (
            <Box
              key={`line-${child.id}`}
              sx={{
                position: 'absolute',
                top: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 15,
                bgcolor: `${getLevelColor(node.niveau)}.main`,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 5
              }}
            />
          ))}
          
          {/* Conteneur des enfants centrés par rapport au parent */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center', // Centrer les enfants par rapport au parent
            gap: 4,
            flexWrap: 'nowrap', // Empêcher le wrap pour permettre le scroll horizontal
            position: 'relative',
            pt: 1,
            minWidth: 'max-content', // Assure que le contenu ne soit pas coupé
            width: '100%', // Prendre toute la largeur disponible
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#a8a8a8'
              }
            }
          }}>
            {node.children.map((child, index) => (
              <Box key={child.id} sx={{ position: 'relative', flexShrink: 0 }}> {/* flexShrink: 0 empêche la compression */}
                {/* Point de connexion (cercle) */}
                <Box sx={{
                  position: 'absolute',
                  top: -15,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 10,
                  height: 10,
                  bgcolor: `${getLevelColor(node.niveau)}.main`,
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  zIndex: 10
                }} />
                
                {/* Récursion pour l'enfant */}
                <TreeNode
                  node={child}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                  level={level + 1}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const ChaineImpact = ({ selectedChurch }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // États pour la navigation de carte
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Charger l'arbre de la chaîne d'impact
  const loadChaineImpact = async () => {
    if (!selectedChurch?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await chaineImpactService.getChaineImpact(selectedChurch.id);
      
      if (response.success && response.tree) {
        setTreeData(response);
        // Initialiser avec le nœud racine développé (niveau 0)
        if (response.tree.length > 0) {
          const rootNode = response.tree.find(node => node.niveau === 0) || response.tree[0];
          setExpandedNodes(new Set([rootNode.id]));
        }
      } else {
        setTreeData(null);
      }
    } catch (err) {
      setError('Erreur lors du chargement de la chaîne d\'impact');
      // Erreur chargement chaîne d'impact
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour/rebâtir la chaîne d'impact
  const handleUpdateChaineImpact = async () => {
    if (!selectedChurch?.id) return;

    setError(null);
    try {
      await chaineImpactService.updateChaineImpact(selectedChurch.id);
      await loadChaineImpact(); // Recharger après mise à jour
    } catch (err) {
      setError('Erreur lors de la mise à jour de la chaîne d\'impact');
      // Erreur mise à jour chaîne d'impact
    }
  };

  // Basculer l'expansion d'un nœud
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Fonctions de navigation de carte
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.button === 0) { // Clic gauche seulement
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setLastPan(pan);
    }
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPan({
        x: lastPan.x + deltaX,
        y: lastPan.y + deltaY
      });
    }
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.1, prev / 1.2));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };


  // Charger au montage et quand l'église change
  useEffect(() => {
    loadChaineImpact();
  }, [selectedChurch?.id]);

  if (!selectedChurch?.id) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Veuillez sélectionner une église pour voir sa chaîne d'impact
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chaîne d'Impact - {selectedChurch.nom}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Contrôles de zoom */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary' }}>
              Navigation carte
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleZoomOut}
              aria-label="Zoom arrière"
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="caption" sx={{ mx: 1, minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleZoomIn}
              aria-label="Zoom avant"
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleResetView}
              aria-label="Vue d'ensemble"
              sx={{ ml: 1 }}
            >
              <CenterFocusIcon />
            </IconButton>
          </Box>
          
          <IconButton onClick={handleUpdateChaineImpact} disabled={loading} aria-label={i18nService.t('common.actions.refresh')} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats */}
      {treeData && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Total de {treeData.total_nodes} nœud{treeData.total_nodes > 1 ? 's' : ''} dans la hiérarchie
          </Typography>
        </Box>
      )}

      {/* Gestion des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Contenu principal */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !treeData || !treeData.tree || treeData.tree.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune chaîne d'impact trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {i18nService.t('chaineImpact.updateChainMessage')}
          </Typography>
        </Box>
      ) : (
        <Paper 
          data-testid="chaine-impact-container"
          ref={containerRef}
          sx={{ 
            p: 0,
            overflow: 'hidden',
            position: 'relative',
            height: '600px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Instructions de navigation */}
          <Box sx={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 1,
            borderRadius: 1,
            fontSize: '0.75rem',
            color: 'text.secondary'
          }}>
            Glisser pour déplacer • Molette pour zoomer
          </Box>
          
          {/* Conteneur de l'arbre avec transformation de carte */}
          <Box sx={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 'max-content',
              py: 2
            }}>
              {/* Rendre l'arbre récursivement */}
              {treeData.tree.map((rootNode) => (
                <TreeNode
                  key={rootNode.id}
                  node={rootNode}
                  expandedNodes={expandedNodes}
                  onToggle={toggleNode}
                  level={0}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ChaineImpact;