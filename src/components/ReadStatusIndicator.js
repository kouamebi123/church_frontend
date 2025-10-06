import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import i18nService from '../services/i18nService';

const ReadStatusIndicator = ({ 
  message, 
  isFromCurrentUser = false, 
  showTooltip = true,
  size = 'small' 
}) => {
  // Si ce n'est pas un message de l'utilisateur actuel, ne pas afficher de statut
  if (!isFromCurrentUser) {
    return null;
  }

  // Si le message n'a pas de destinataires, ne pas afficher de statut
  if (!message.recipients || message.recipients.length === 0) {
    return null;
  }

  // Calculer les statuts de lecture
  const totalRecipients = message.recipients.length;
  const readRecipients = message.recipients.filter(recipient => recipient.is_read).length;
  const acknowledgedRecipients = message.recipients.filter(recipient => recipient.acknowledged).length;

  // Déterminer le statut et l'icône
  let status = 'sent';
  let icon = <DoneIcon sx={{ fontSize: size === 'small' ? 16 : 20, color: 'text.secondary' }} />;
  let tooltipText = i18nService.t('messages.status.sent');

  if (readRecipients === totalRecipients) {
    if (acknowledgedRecipients === totalRecipients) {
      status = 'acknowledged';
      icon = <CheckCircleIcon sx={{ fontSize: size === 'small' ? 16 : 20, color: 'success.main' }} />;
      tooltipText = i18nService.t('messages.status.acknowledgedAll');
    } else {
      status = 'read';
      icon = <DoneAllIcon sx={{ fontSize: size === 'small' ? 16 : 20, color: 'success.main' }} />;
      tooltipText = i18nService.t('messages.status.readBy', { read: readRecipients, total: totalRecipients });
    }
  } else if (readRecipients > 0) {
    status = 'partially_read';
    icon = <DoneAllIcon sx={{ fontSize: size === 'small' ? 16 : 20, color: 'text.secondary' }} />;
    tooltipText = i18nService.t('messages.status.readBy', { read: readRecipients, total: totalRecipients });
  }

  // Créer le contenu de l'outil
  const tooltipContent = (
    <Box>
      <Typography variant="caption" display="block">
        {tooltipText}
      </Typography>
      {message.recipients.map((recipient, index) => (
        <Typography key={index} variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
          {recipient.pseudo}: {recipient.is_read ? i18nService.t('messages.status.read') : i18nService.t('messages.status.pending')}
          {recipient.acknowledged && ` ${i18nService.t('messages.status.acknowledged')}`}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
      {showTooltip ? (
        <Tooltip title={tooltipContent} placement="top" arrow>
          {icon}
        </Tooltip>
      ) : (
        icon
      )}
    </Box>
  );
};

export default ReadStatusIndicator;
