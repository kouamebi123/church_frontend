import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Drawer,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Badge,
  Tabs,
  Tab,
  Paper,
  Fade,
  Zoom,
  Autocomplete
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  Close as CloseIcon,
  Send as SendIcon,
  MarkEmailRead as MarkEmailReadIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityHighIcon,
  Message as MessageIcon,
  Inbox as InboxIcon,
  ArrowBack as ArrowBackIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  FiberManualRecord as OnlineIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import messageService from '@services/messageService';
import { usePermissions } from '@hooks/usePermissions';
import { useRealtimeMessaging } from '@hooks/useRealtimeMessaging';
import i18nService from '@services/i18nService';
import { useSelectedChurch } from '@hooks/useSelectedChurch';
import { useAuth } from '@hooks/useAuth';
import ReadStatusIndicator from './ReadStatusIndicator';

// Animation de pulsation pour l'envoi de message
const pulseAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const MessageModal = ({ open, onClose, messageStats: propMessageStats }) => {
  const { isAdmin, isSuperAdmin } = usePermissions();
  const { selectedChurch } = useSelectedChurch();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  
  // États pour la conversation
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [tempMessage, setTempMessage] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Fonction pour faire défiler automatiquement vers le bas
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, []);
  
  // État pour l'envoi de message
  const [newMessage, setNewMessage] = useState({
    subject: i18nService.t('messages.defaultSubject'), // Sujet générique automatique
    content: '',
    recipient_ids: [],
    is_urgent: false
  });

  // Hook pour la messagerie en temps réel
  const {
    isConnected,
    messages: receivedMessages,
    conversations,
    conversationMessages: hookConversationMessages,
    messageStats: hookMessageStats,
    typingUsers,
    loadMessages,
    loadMessageStats,
    fetchConversations,
    loadConversationMessages,
    sendMessage,
    markAsRead,
    acknowledgeMessage,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation
  } = useRealtimeMessaging();

  // Utiliser les statistiques passées en props ou celles du hook
  const messageStats = propMessageStats || hookMessageStats;

  // Charger les données initiales
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Attendre que l'église soit disponible avant de charger les utilisateurs
  useEffect(() => {
    if (open) {
      if (selectedChurch && (selectedChurch.id || selectedChurch._id)) {
        
        loadInitialData();
      } else if (user?.eglise_locale) {
        // Si selectedChurch n'est pas encore initialisé mais que l'utilisateur a une église,
        // attendre un peu plus pour que useSelectedChurch finisse son initialisation
        
        
        const timer = setTimeout(() => {
          if (selectedChurch && (selectedChurch.id || selectedChurch._id)) {
            loadInitialData();
          } else {
          }
        }, 1000); // Attendre 1 seconde
        
        return () => clearTimeout(timer);
      }
    }
  }, [open, selectedChurch, user]);



  // Faire défiler automatiquement vers le bas quand les messages changent
  useEffect(() => {
    if (hookConversationMessages.length > 0) {
      scrollToBottom();
    }
  }, [hookConversationMessages, scrollToBottom]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Déterminer l'église à utiliser
      let churchToUse = selectedChurch;
      let churchId = selectedChurch?.id || selectedChurch?._id;
      
      // Fallback : utiliser l'église de l'utilisateur si selectedChurch n'est pas encore disponible
      if (!churchId && user?.eglise_locale) {
        churchToUse = user.eglise_locale;
        churchId = user.eglise_locale.id || user.eglise_locale._id;
      }
      
      if (!churchId) {
        
        setUsers([]);
        return;
      }
      
      const usersResponse = await messageService.getUsersForMessaging(churchId);
      setUsers(usersResponse.data || []);

      // Charger les conversations et statistiques via le hook
      await Promise.all([
        fetchConversations(),
        loadMessageStats()
      ]);

    } catch (error) {
      toast.error(i18nService.t('messages.errors.loadingData'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.content.trim() || newMessage.recipient_ids.length === 0) {
      toast.error(i18nService.t('messages.errors.fillRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      // Inclure les informations des destinataires pour créer les conversations
      const messageDataWithRecipients = {
        ...newMessage,
        recipients: users.filter(user => newMessage.recipient_ids.includes(user.id))
      };
      
      await sendMessage(messageDataWithRecipients);
      
      // Ouvrir automatiquement la conversation du premier destinataire
      if (messageDataWithRecipients.recipient_ids.length > 0) {
        const firstRecipientId = messageDataWithRecipients.recipient_ids[0];
        const firstRecipient = messageDataWithRecipients.recipients.find(r => r.id === firstRecipientId);
        
        if (firstRecipient) {
          // Créer l'objet conversation pour l'ouvrir
          const conversationToOpen = {
            id: `conversation_${firstRecipientId}`,
            partner: {
              id: firstRecipientId,
              username: firstRecipient.username || firstRecipient.pseudo || i18nService.t('messages.defaultUser'),
              role: firstRecipient.role || 'MEMBRE'
            },
            lastMessage: {
              content: messageDataWithRecipients.content,
              message_type: 'sent',
              is_read: true,
              created_at: new Date().toISOString()
            },
            stats: {
              total_messages: 1,
              unread_count: 0
            }
          };
          
          // Ouvrir la conversation et basculer vers l'onglet Messages
          await handleOpenConversation(conversationToOpen);
          setActiveTab(0); // Forcer l'onglet Messages
        }
      }
      
      // Réinitialiser le formulaire
      setNewMessage({
        subject: i18nService.t('messages.defaultSubject'),
        content: '',
        recipient_ids: [],
        is_urgent: false
      });
      
    } catch (error) {
      
      toast.error(error.response?.data?.message || i18nService.t('messages.errors.sendMessage'));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageRecipientId) => {
    try {
      await markAsRead(messageRecipientId);
      toast.success(i18nService.t('messages.success.markedAsRead'));
    } catch (error) {
      
      toast.error(i18nService.t('messages.errors.markAsRead'));
    }
  };

  const handleAcknowledge = async (messageRecipientId) => {
    try {
      await acknowledgeMessage(messageRecipientId);
      toast.success(i18nService.t('messages.success.acknowledged'));
    } catch (error) {
      toast.error(i18nService.t('messages.errors.acknowledge'));
    }
  };

  const handleRecipientChange = (event, newValue) => {
    setNewMessage(prev => ({
      ...prev,
      recipient_ids: newValue.map(user => user.id)
    }));
  };

  // Fonction pour retirer un destinataire
  const handleRemoveRecipient = (recipientId) => {
    setNewMessage(prev => ({
      ...prev,
      recipient_ids: prev.recipient_ids.filter(id => id !== recipientId)
    }));
  };

  // Obtenir les utilisateurs sélectionnés pour l'Autocomplete
  const getSelectedUsers = () => {
    return users.filter(user => newMessage.recipient_ids.includes(user.id));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecipientNames = (recipientIds) => {
    return users
      .filter(user => recipientIds.includes(user.id))
      .map(user => user.username)
      .join(', ');
  };

    // Fonctions pour gérer les conversations
  const handleOpenConversation = async (conversation) => {
    if (!conversation || !conversation.partner || !conversation.partner.id) {
      toast.error(i18nService.t('messages.errors.invalidStructure'));
      return;
    }
    
    setSelectedConversation(conversation);
    setLoading(true);
    try {
      // Charger l'historique de la conversation avec ce partenaire via le hook
      await loadConversationMessages(conversation.partner.id);
      
      // Rejoindre la conversation pour les notifications en temps réel
      joinConversation(`conversation_${conversation.partner.id}`);
      
      // Faire défiler vers le bas après un court délai pour laisser le temps au DOM de se mettre à jour
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      toast.error(i18nService.t('messages.errors.loadConversation'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error(i18nService.t('messages.errors.enterMessage'));
      return;
    }

    try {
      setIsSendingMessage(true);
      setLoading(true);
      
      // Créer un message temporaire pour l'animation
      const tempMsg = {
        id: `temp_${Date.now()}`,
        content: replyMessage,
        is_from_current_user: true,
        created_at: new Date().toISOString(),
        is_temp: true
      };
      setTempMessage(tempMsg);
      
      await sendMessage({
        subject: i18nService.t('messages.defaultSubject'), // Sujet simple et générique
        content: replyMessage,
        recipient_ids: [selectedConversation.partner.id],
        is_urgent: false
      });
      
      setReplyMessage('');
      setTempMessage(null);
      
      // Recharger la conversation via le hook
      await loadConversationMessages(selectedConversation.partner.id);
      
      // Faire défiler vers le bas après l'envoi
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      toast.error(i18nService.t('messages.errors.sendReply'));
    } finally {
      setLoading(false);
      setIsSendingMessage(false);
      setTempMessage(null);
    }
  };

  const handleBackToMessages = async () => {
    // Quitter la conversation
    if (selectedConversation) {
      leaveConversation(`conversation_${selectedConversation.partner.id}`);
    }
    
    // Réinitialiser immédiatement l'état pour afficher la liste des conversations
    setSelectedConversation(null);
    setReplyMessage('');
    
    // Forcer l'onglet Messages (activeTab = 0) quand on revient
    setActiveTab(0);
    
    // Recharger les conversations pour s'assurer qu'elles sont à jour avec la BD
    try {
      await fetchConversations();
    } catch (error) {
    }
  };

  const renderSendMessageTab = () => (
    <Box sx={{ 
      p: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      minHeight: 0
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          mb: 2
        }}
      >
        {i18nService.t('messages.sendMessage')}
      </Typography>
      
      <Autocomplete
        id="message-recipients"
        multiple
        fullWidth
        margin="normal"
        options={users}
        value={getSelectedUsers()}
        onChange={handleRecipientChange}
        getOptionLabel={(option) => option.username || ''}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            id="message-recipients-input"
            name="recipients"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(102, 45, 145, 0.08)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(102, 45, 145, 0.15)'
                }
              }
            }}
            label={i18nService.t('messages.recipients')}
            placeholder={i18nService.t('messages.searchPlaceholder')}
            helperText={i18nService.t('messages.searchUserHelper')}
            autoComplete="off"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.username}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={() => handleRemoveRecipient(option.id)}
              deleteIcon={<CancelIcon />}
            />
          ))
        }
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box component="li" key={key} {...otherProps}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {option.username}
              </Typography>
            </Box>
          );
        }}
        filterOptions={(options, { inputValue }) => {
          const filtered = options.filter(option =>
            (option.username && option.username.toLowerCase().includes(inputValue.toLowerCase())) ||
            option.role.toLowerCase().includes(inputValue.toLowerCase()) ||
            (option.eglise_locale?.nom && option.eglise_locale.nom.toLowerCase().includes(inputValue.toLowerCase()))
          );
          return filtered;
        }}
        noOptionsText={i18nService.t('messages.noUsersFound')}
        loadingText={i18nService.t('messages.loading')}
        sx={{
          '& .MuiAutocomplete-paper': {
            maxHeight: 300,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          }
        }}
      />
      
      <TextField
        fullWidth
        id="message-content"
        name="content"
        label={i18nService.t('messages.content')}
        multiline
        rows={4}
        value={newMessage.content}
        onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
        margin="normal"
        required
        autoComplete="off"
        sx={{ 
          flex: 1,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(102, 45, 145, 0.08)'
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(102, 45, 145, 0.15)'
            }
          }
        }}
      />
      
      <FormControlLabel
        control={
          <Checkbox
            id="message-urgent-checkbox"
            name="is_urgent"
            checked={newMessage.is_urgent}
            onChange={(e) => setNewMessage(prev => ({ ...prev, is_urgent: e.target.checked }))}
          />
        }
        label={i18nService.t('messages.urgent')}
      />
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            borderRadius: '12px',
            fontWeight: 700,
            px: 4,
            py: 1.2,
            boxShadow: '0 4px 12px rgba(102, 45, 145, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b1464, #662d91)',
              boxShadow: '0 6px 16px rgba(102, 45, 145, 0.35)',
              transform: 'translateY(-2px)'
            },
            '&:disabled': {
              background: 'rgba(102, 45, 145, 0.5)',
              color: 'white'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {i18nService.t('messages.send')}
        </Button>
      </Box>
    </Box>
  );

    const renderReceivedMessagesTab = () => (
    <Box sx={{ 
      p: 1.5, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      minHeight: 0
    }}>
      {conversations.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: 'text.secondary',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MessageIcon sx={{ 
            fontSize: 56, 
            mb: 2, 
            color: 'primary.main',
            opacity: 0.4 
          }} />
          <Typography 
            variant="body2"
            sx={{ fontWeight: 600, color: 'text.secondary' }}
          >
            Aucune conversation
          </Typography>
        </Box>
      ) : (
        <List sx={{ 
          p: 0, 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}>
          {conversations.map((conversation, index) => (
            <React.Fragment key={conversation.id}>
              <ListItem 
                alignItems="flex-start"
                onClick={() => handleOpenConversation(conversation)}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  mb: 1,
                  background: (conversation.lastMessage.is_read || conversation.lastMessage.message_type === 'sent') 
                    ? 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)' 
                    : 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
                  border: '2px solid',
                  borderColor: (conversation.lastMessage.is_read || conversation.lastMessage.message_type === 'sent') 
                    ? 'rgba(102, 45, 145, 0.1)' 
                    : 'rgba(102, 45, 145, 0.25)',
                  boxShadow: (conversation.lastMessage.is_read || conversation.lastMessage.message_type === 'sent')
                    ? '0 2px 8px rgba(102, 45, 145, 0.05)'
                    : '0 4px 12px rgba(102, 45, 145, 0.15)',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'linear-gradient(145deg, #EDE9FE 0%, #DDD6FE 100%)',
                    boxShadow: '0 4px 12px rgba(102, 45, 145, 0.2)',
                    borderColor: 'rgba(102, 45, 145, 0.35)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: (conversation.lastMessage.is_read || conversation.lastMessage.message_type === 'sent') ? 500 : 600,
                        fontSize: '0.9rem',
                        color: (conversation.lastMessage.is_read || conversation.lastMessage.message_type === 'sent') ? 'text.primary' : 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {conversation.lastMessage.is_urgent && (
                        <PriorityHighIcon 
                          sx={{ 
                            fontSize: '1rem', 
                            color: '#f44336' 
                          }} 
                        />
                      )}
                      {conversation.partner.username}
                      {conversation.lastMessage.message_type === 'sent' && (
                        <Typography 
                          component="span"
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.7rem',
                            color: 'success.main',
                            fontWeight: 500,
                            ml: 0.5
                          }}
                        >
                          {i18nService.t('messages.you')}
                        </Typography>
                      )}
                      {conversation.stats.unread_count > 0 && (
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            ml: 0.5,
                            display: 'inline-block'
                          }}
                        />
                      )}
                    </Typography>
                  }
                  secondary={
                    <Box component="div">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.85rem',
                          lineHeight: 1.4,
                          color: (conversation.lastMessage.is_read || conversation.lastMessage.message_type === 'sent') ? 'text.secondary' : 'text.primary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5
                        }}
                      >
                        {conversation.lastMessage.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.disabled',
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatDate(conversation.lastMessage.created_at)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {!conversation.lastMessage.is_read && conversation.lastMessage.message_type === 'received' && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(conversation.lastMessage.id)}
                        title={i18nService.t('messages.markAsRead')}
                        sx={{
                          width: 28,
                          height: 28,
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <MarkEmailReadIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    )}
                    {!conversation.lastMessage.acknowledged && conversation.lastMessage.message_type === 'received' && (
                      <IconButton
                        size="small"
                        onClick={() => handleAcknowledge(conversation.lastMessage.id)}
                        title={i18nService.t('messages.acknowledge')}
                        sx={{
                          width: 28,
                          height: 28,
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.08)'
                          }
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
                      </IconButton>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    );

  const renderConversationView = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header de la conversation */}
      <Box sx={{ 
        p: 1.5,
        borderBottom: '2px solid rgba(102, 45, 145, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        background: 'linear-gradient(135deg, rgba(102, 45, 145, 0.05), rgba(124, 58, 237, 0.05))',
        flexShrink: 0
      }}>
        <IconButton 
          onClick={handleBackToMessages}
          sx={{ 
            width: 36, 
            height: 36,
            mr: 1,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(102, 45, 145, 0.1)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s'
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1.3rem' }} />
        </IconButton>
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1rem'
            }}
          >
            {i18nService.t('messages.conversationWith', { name: selectedConversation?.partner.username })}
          </Typography>
        </Box>
      </Box>

      {/* Messages de la conversation */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 1.5,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : hookConversationMessages.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            color: 'text.secondary',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
            borderRadius: '16px',
            border: '2px dashed rgba(102, 45, 145, 0.2)',
            m: 2
          }}>
            <Typography 
              variant="body2"
              sx={{ fontWeight: 600 }}
            >
              Aucun message dans cette conversation
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Message temporaire en cours d'envoi */}
            {tempMessage && (
              <Box
                key={tempMessage.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: 1,
                  animation: `${pulseAnimation} 1.5s ease-in-out infinite`
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                    color: 'white',
                    position: 'relative',
                    opacity: 0.7,
                    boxShadow: '0 4px 12px rgba(102, 45, 145, 0.25)'
                  }}
                >
                  <Typography variant="body2">{tempMessage.content}</Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mt: 0.5,
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <CircularProgress size={12} sx={{ color: 'white' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      Envoi...
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            
            {hookConversationMessages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.is_from_current_user ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    borderRadius: '16px',
                    background: msg.is_from_current_user 
                      ? 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)' 
                      : 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                    border: msg.is_from_current_user 
                      ? 'none' 
                      : '2px solid rgba(102, 45, 145, 0.1)',
                    color: msg.is_from_current_user ? 'white' : 'text.primary',
                    position: 'relative',
                    boxShadow: msg.is_from_current_user 
                      ? '0 4px 12px rgba(102, 45, 145, 0.25)' 
                      : '0 2px 8px rgba(102, 45, 145, 0.08)'
                  }}
                >
                  {!msg.is_from_current_user && (
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      fontWeight: 600, 
                      mb: 0.5,
                      color: 'primary.main'
                    }}>
                      {msg.sender.username}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ 
                    fontSize: '0.9rem',
                    lineHeight: 1.4
                  }}>
                    {msg.content}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mt: 0.5
                  }}>
                    <Typography variant="caption" sx={{ 
                      opacity: 0.7,
                      fontSize: '0.75rem'
                    }}>
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    <ReadStatusIndicator 
                      message={msg} 
                      isFromCurrentUser={msg.is_from_current_user}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {/* Élément invisible pour le scroll automatique */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Zone de réponse */}
      <Box sx={{ 
        p: 1.5, 
        borderTop: '2px solid rgba(102, 45, 145, 0.1)',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
        flexShrink: 0
      }}>
        {/* Indicateur de frappe */}
        {typingUsers.size > 0 && (
          <Fade in={typingUsers.size > 0}>
            <Box sx={{ mb: 1, px: 1 }}>
              <Typography variant="caption" sx={{ 
                color: '#1877f2', 
                fontStyle: 'italic',
                fontSize: '0.75rem'
              }}>
                {Array.from(typingUsers.values()).map(user => user.userPseudo).join(', ')} 
                {typingUsers.size === 1 ? ' en train d\'écrire...' : ' en train d\'écrire...'}
              </Typography>
            </Box>
          </Fade>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            id="message-reply-input"
            name="replyMessage"
            multiline
            maxRows={3}
            placeholder={isSendingMessage ? i18nService.t('messages.sendingPlaceholder') : i18nService.t('messages.replyPlaceholder')}
            value={replyMessage}
            onChange={(e) => {
              setReplyMessage(e.target.value);
              
              // Gérer l'indication de frappe
              if (e.target.value.trim() && selectedConversation) {
                startTyping(`conversation_${selectedConversation.partner.id}`, selectedConversation.partner.id);
              } else if (selectedConversation) {
                stopTyping(`conversation_${selectedConversation.partner.id}`, selectedConversation.partner.id);
              }
            }}
            onBlur={() => {
              // Arrêter l'indication de frappe quand on quitte le champ
              if (selectedConversation) {
                stopTyping(`conversation_${selectedConversation.partner.id}`, selectedConversation.partner.id);
              }
            }}
            disabled={loading || isSendingMessage}
            size="small"
            autoComplete="off"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                opacity: isSendingMessage ? 0.7 : 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 2px 8px rgba(102, 45, 145, 0.08)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(102, 45, 145, 0.15)'
                }
              },
              '& .MuiInputBase-input': {
                transition: 'all 0.3s ease',
                fontWeight: 500
              }
            }}
          />
          <IconButton
            onClick={handleSendReply}
            disabled={!replyMessage.trim() || loading}
            sx={{
              background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
              color: 'white',
              width: 44,
              height: 44,
              boxShadow: '0 4px 12px rgba(102, 45, 145, 0.25)',
              transition: 'all 0.3s ease',
              transform: isSendingMessage ? 'scale(0.95)' : 'scale(1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1b1464, #662d91)',
                boxShadow: '0 6px 16px rgba(102, 45, 145, 0.35)',
                transform: isSendingMessage ? 'scale(0.95)' : 'scale(1.1)'
              },
              '&:disabled': {
                background: 'rgba(102, 45, 145, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
                transform: 'scale(1)'
              }
            }}
          >
            {isSendingMessage ? (
              <CircularProgress 
                size={20} 
                sx={{ 
                  color: 'white',
                  animation: `${pulseAnimation} 1.5s ease-in-out infinite`
                }} 
              />
            ) : (
              <SendIcon 
                sx={{
                  transition: 'transform 0.2s ease',
                  transform: isSendingMessage ? 'translateX(2px)' : 'translateX(0)'
                }}
              />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );



  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop={true}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '400px', md: '450px' },
          maxWidth: '90vw',
          height: '100%',
          maxHeight: '90vh',
          top: '71px',
          right: '0px',
          borderRadius: '20px 0 0 20px',
          boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
          border: '2px solid rgba(102, 45, 145, 0.1)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          zIndex: 1300,
          overflow: 'hidden'
        }
      }}
      transitionDuration={300}
      ModalProps={{
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(4px)'
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '2px solid rgba(102, 45, 145, 0.1)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        minHeight: 64,
                    background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
        borderRadius: '20px 0 0 0',
        boxShadow: '0 4px 12px rgba(102, 45, 145, 0.15)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
            💬 Messagerie
          </Typography>
          {messageStats.unread_count > 0 && (
            <Badge 
              badgeContent={messageStats.unread_count} 
              sx={{
                '& .MuiBadge-badge': {
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  height: '22px',
                  minWidth: '22px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)'
                }
              }}
            />
          )}
          {/* Indicateur de connexion */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
            {isConnected ? (
              <OnlineIcon sx={{ fontSize: '0.8rem', color: 'success.main' }} />
            ) : (
              <WifiOffIcon sx={{ fontSize: '0.8rem', color: 'error.main' }} />
            )}
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'white',
              opacity: 0.9
            }}>
              {isConnected ? i18nService.t('messages.online') : i18nService.t('messages.offline')}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            width: 32, 
            height: 32,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      </Box>
      
      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => {
                // Si on bascule vers l'onglet "Envoyer" depuis une conversation, fermer la conversation
                if (newValue === 1 && selectedConversation) {
                  handleBackToMessages();
                }
                setActiveTab(newValue);
              }}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                minHeight: 48,
                flexShrink: 0,
                '& .MuiTab-root': {
                  minHeight: 48,
                  height: 48,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3
                }
              }}
            >
              <Tab icon={<InboxIcon sx={{ fontSize: '1.1rem' }} />} label={i18nService.t('messages.messages')} />
              <Tab icon={<SendIcon sx={{ fontSize: '1.1rem' }} />} label={i18nService.t('messages.send')} />
            </Tabs>
            
            <Box sx={{ flex: 1, overflow: 'hidden', height: 0 }}>
              {selectedConversation && activeTab === 0 ? (
                renderConversationView()
              ) : (
                <>
                  {activeTab === 0 && renderReceivedMessagesTab()}
                  {activeTab === 1 && renderSendMessageTab()}
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default MessageModal;
