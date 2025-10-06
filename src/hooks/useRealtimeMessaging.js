import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import socketService from '../services/socketService';
import messageService from '../services/messageService';
import logger from '../utils/logger';
import i18nService from '../services/i18nService';

export const useRealtimeMessaging = () => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [messageStats, setMessageStats] = useState({
    unread_count: 0,
    unacknowledged_count: 0,
    urgent_unread_count: 0
  });
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  
  const typingTimeoutRef = useRef(new Map());
  const isInitialized = useRef(false);
  const currentConversationRef = useRef(null);

  // Initialiser Socket.IO
  useEffect(() => {
    if (user && token && !isInitialized.current) {
      // Initialisation de la messagerie en temps réel
      socketService.initialize(token);
      isInitialized.current = true;
    }
  }, [user, token]);

  // Gérer les événements Socket.IO
  useEffect(() => {
    if (!isInitialized.current) return;

    // Statut de connexion
    const handleConnectionStatus = (data) => {
      setIsConnected(data.connected);
      // Connection status
    };

    // Nouveau message
    const handleNewMessage = async (messageData) => {
      
      setMessages(prevMessages => {
        // Vérifier si le message existe déjà
        const exists = prevMessages.some(msg => msg.id === messageData.id);
        if (exists) return prevMessages;
        
        // Ajouter le nouveau message en haut de la liste
        return [messageData, ...prevMessages];
      });

      // Mettre à jour les messages de conversation si on est dans une conversation avec cet expéditeur
      setConversationMessages(prevMessages => {
        if (!user || !user.id) return prevMessages;
        
        const isFromCurrentUser = messageData.sender.id === user.id;
        const isToCurrentUser = messageData.recipients?.some(r => r.id === user.id);
        
        // Ajouter le message si c'est de l'utilisateur actuel ou s'il est destinataire
        if (isFromCurrentUser || isToCurrentUser) {
          // Vérifier si le message existe déjà
          const exists = prevMessages.some(msg => msg.id === messageData.id);
          if (exists) return prevMessages;
          
          // Ajouter le nouveau message à la fin de la liste
          return [...prevMessages, {
            ...messageData,
            is_from_current_user: isFromCurrentUser,
            is_read: isFromCurrentUser // Les messages envoyés sont considérés comme lus
          }];
        }
        
        return prevMessages;
      });

      // Mettre à jour les statistiques (seulement pour les messages reçus)
      const isFromCurrentUser = messageData.sender.id === user.id;
      if (!isFromCurrentUser) {
        // Vérifier si nous sommes actuellement dans cette conversation
        const currentConversation = currentConversationRef.current;
        const isInCurrentConversation = currentConversation && (
          currentConversation.partner.id === messageData.sender.id
        );
        
        // Si nous sommes dans la conversation, marquer automatiquement comme lu
        if (isInCurrentConversation) {
          // Marquer le message comme lu automatiquement
          setConversationMessages(prev => 
            prev.map(msg => 
              msg.id === messageData.id 
                ? {
                    ...msg,
                    recipients: msg.recipients?.map(recipient => 
                      recipient.id === user.id 
                        ? { ...recipient, is_read: true, read_at: new Date().toISOString() }
                        : recipient
                    )
                  }
                : msg
            )
          );
          
          // Marquer le message comme lu dans la base de données (synchronisé)
          try {
            await markMultipleAsRead([messageData.id]);
          } catch (error) {
            logger.error('❌ Erreur lors du marquage automatique en BD:', error);
          }
        } else {
          // Vérifier si le message est vraiment non lu dans la BD avant d'augmenter le compteur
          const isMessageRead = messageData.recipients?.find(r => r.id === user.id)?.is_read || false;
          
          if (!isMessageRead) {
            // Augmenter le compteur seulement si le message est vraiment non lu dans la BD
            setMessageStats(prev => ({
              ...prev,
              unread_count: prev.unread_count + 1,
              urgent_unread_count: messageData.is_urgent ? prev.urgent_unread_count + 1 : prev.urgent_unread_count
            }));
          }
        }
      }

      // Mettre à jour les conversations en temps réel
      updateConversation(messageData);
    };

    // Message marqué comme lu
    const handleMessageRead = (data) => {
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === data.messageId 
            ? {
                ...msg,
                recipients: msg.recipients?.map(recipient => 
                  recipient.id === user.id 
                    ? { ...recipient, is_read: true, read_at: data.timestamp }
                    : recipient
                )
              }
            : msg
        )
      );
    };

    // Message accusé de réception
    const handleMessageAcknowledged = (data) => {
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, acknowledged: true, acknowledged_at: data.timestamp }
            : msg
        )
      );
    };

    // Statut de lecture mis à jour
    const handleReadStatusUpdated = (data) => {
      
      // Mettre à jour les messages de conversation
      setConversationMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === data.messageId 
            ? {
                ...msg,
                recipients: msg.recipients?.map(recipient => {
                  const updatedRecipient = data.readStatus.find(rs => rs.recipient.id === recipient.id);
                  return updatedRecipient ? {
                    ...recipient,
                    is_read: updatedRecipient.is_read,
                    read_at: updatedRecipient.read_at,
                    acknowledged: updatedRecipient.acknowledged,
                    acknowledged_at: updatedRecipient.acknowledged_at
                  } : recipient;
                })
              }
            : msg
        )
      );
    };

    // Statistiques mises à jour
    const handleStatsUpdated = (data) => {
      setMessageStats(data.stats);
    };

    // Utilisateur en train de taper
    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        
        if (data.isTyping) {
          newMap.set(data.userId, {
            userPseudo: data.userPseudo,
            conversationId: data.conversationId,
            timestamp: Date.now()
          });
        } else {
          newMap.delete(data.userId);
        }
        
        return newMap;
      });
    };

    // Notification générale
    const handleNotification = (notification) => {
      
      setNotifications(prev => [
        {
          id: Date.now(),
          ...notification,
          timestamp: new Date(notification.timestamp)
        },
        ...prev.slice(0, 9) // Garder seulement les 10 dernières
      ]);
    };

    // Ajouter les listeners
    socketService.addListener('connection_status', handleConnectionStatus);
    socketService.addListener('new_message', handleNewMessage);
    socketService.addListener('message_read', handleMessageRead);
    socketService.addListener('message_acknowledged', handleMessageAcknowledged);
    socketService.addListener('read_status_updated', handleReadStatusUpdated);
    socketService.addListener('message_stats_updated', handleStatsUpdated);
    socketService.addListener('user_typing', handleUserTyping);
    socketService.addListener('notification', handleNotification);

    // Nettoyer les timeouts de frappe
    const cleanupTypingTimeouts = () => {
      typingTimeoutRef.current.forEach((timeout, userId) => {
        clearTimeout(timeout);
      });
      typingTimeoutRef.current.clear();
    };

    // Nettoyage
    return () => {
      socketService.removeListener('connection_status', handleConnectionStatus);
      socketService.removeListener('new_message', handleNewMessage);
      socketService.removeListener('message_read', handleMessageRead);
      socketService.removeListener('message_acknowledged', handleMessageAcknowledged);
      socketService.removeListener('read_status_updated', handleReadStatusUpdated);
      socketService.removeListener('message_stats_updated', handleStatsUpdated);
      socketService.removeListener('user_typing', handleUserTyping);
      socketService.removeListener('notification', handleNotification);
      cleanupTypingTimeouts();
    };
  }, [isInitialized.current]);

  // Charger les messages initiaux
  const loadMessages = useCallback(async () => {
    try {
      const response = await messageService.getReceivedMessages();
      setMessages(response.data?.messages || []);
    } catch (error) {
      logger.error('❌ Erreur lors du chargement des messages:', error);
    }
  }, []);

  // Charger les statistiques initiales
  const loadMessageStats = useCallback(async () => {
    try {
      const response = await messageService.getMessageStats();
      setMessageStats(response.data || {});
    } catch (error) {
      logger.error('❌ Erreur lors du chargement des statistiques:', error);
    }
  }, []);

  // Envoyer un message (synchronisé BD + local)
  const sendMessage = useCallback(async (messageData) => {
    try {
      // 1. Envoyer le message à la base de données
      const response = await messageService.sendMessage(messageData);
      
      // 2. Mettre à jour la liste des conversations pour chaque destinataire
      setConversations(prevConversations => {
        let updatedConversations = [...prevConversations];
        
        // Traiter chaque destinataire
        messageData.recipient_ids.forEach(recipientId => {
          // Chercher si la conversation existe déjà
          const existingConversationIndex = updatedConversations.findIndex(conv => 
            conv.partner.id === recipientId
          );

          if (existingConversationIndex >= 0) {
            // Mettre à jour la conversation existante
            updatedConversations[existingConversationIndex] = {
              ...updatedConversations[existingConversationIndex],
              lastMessage: {
                ...response.data,
                message_type: 'sent',
                is_read: true, // Le message envoyé est considéré comme "lu" par l'expéditeur
                read_at: new Date().toISOString()
              },
              stats: {
                ...updatedConversations[existingConversationIndex].stats,
                unread_count: 0 // Pas de messages non lus pour l'expéditeur
              }
            };
            
            // Déplacer la conversation en haut de la liste
            const [movedConversation] = updatedConversations.splice(existingConversationIndex, 1);
            updatedConversations = [movedConversation, ...updatedConversations];
          } else {
            // Créer une nouvelle conversation pour un nouveau destinataire
            // Trouver les informations du destinataire dans la liste des utilisateurs
            const recipientInfo = messageData.recipients?.find(r => r.id === recipientId) || {
              id: recipientId,
              username: i18nService.t('messages.defaultUser'),
              pseudo: i18nService.t('messages.defaultUser'),
              role: 'MEMBRE'
            };
            
            const newConversation = {
              id: `conversation_${recipientId}`,
              partner: {
                id: recipientId,
                pseudo: recipientInfo.pseudo || recipientInfo.username || i18nService.t('messages.defaultUser'),
                role: recipientInfo.role || 'MEMBRE'
              },
              lastMessage: {
                ...response.data,
                message_type: 'sent',
                is_read: true,
                read_at: new Date().toISOString()
              },
              stats: {
                total_messages: 1,
                unread_count: 0
              }
            };
            
            // Ajouter la nouvelle conversation en haut de la liste
            updatedConversations = [newConversation, ...updatedConversations];
          }
        });
        
        return updatedConversations;
      });

      // 3. Si nous sommes dans une de ces conversations, mettre à jour les messages de conversation
      if (currentConversationRef.current && 
          messageData.recipient_ids.includes(currentConversationRef.current.partner.id)) {
        setConversationMessages(prevMessages => [response.data, ...prevMessages]);
      }

      // 4. Mettre à jour les statistiques
      setMessageStats(prev => ({
        ...prev,
        total_messages: prev.total_messages + 1
      }));
      
      return response;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }, []);



  // Marquer un message comme lu (synchronisé BD + local)
  const markAsRead = useCallback(async (messageId) => {
    try {
      // 1. Mettre à jour localement d'abord (optimistic update)
      const updateLocalState = () => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  recipients: msg.recipients?.map(recipient => 
                    recipient.id === user.id 
                      ? { ...recipient, is_read: true, read_at: new Date().toISOString() }
                      : recipient
                  )
                }
              : msg
          )
        );

        setConversationMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  recipients: msg.recipients?.map(recipient => 
                    recipient.id === user.id 
                      ? { ...recipient, is_read: true, read_at: new Date().toISOString() }
                      : recipient
                  )
                }
              : msg
          )
        );

        // Mettre à jour les statistiques
        setMessageStats(prev => ({
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1)
        }));
      };

      // 2. Mettre à jour la base de données
      await messageService.markAsRead(messageId);
      
      // 3. Appliquer les changements locaux
      updateLocalState();
      
      // 4. Mettre à jour la liste des conversations pour refléter le marquage comme lu
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          // Trouver la conversation qui contient ce message
          if (conv.lastMessage.id === messageId) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                is_read: true
              },
              stats: {
                ...conv.stats,
                unread_count: Math.max(0, conv.stats.unread_count - 1)
              }
            };
          }
          return conv;
        })
      );
      
    } catch (error) {
      logger.error('❌ Erreur lors du marquage comme lu:', error);
      // En cas d'erreur, recharger les données depuis la BD pour restaurer la cohérence
      await loadMessageStats();
      throw error;
    }
  }, [user?.id]);

  // Accuser réception d'un message (synchronisé BD + local)
  const acknowledgeMessage = useCallback(async (messageId) => {
    try {
      // 1. Mettre à jour localement d'abord (optimistic update)
      const updateLocalState = () => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
              : msg
          )
        );

        setConversationMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
              : msg
          )
        );

        // Mettre à jour les statistiques
        setMessageStats(prev => ({
          ...prev,
          unacknowledged_count: Math.max(0, prev.unacknowledged_count - 1)
        }));
      };

      // 2. Mettre à jour la base de données
      await messageService.acknowledgeMessage(messageId);
      
      // 3. Appliquer les changements locaux
      updateLocalState();
      
      // 4. Mettre à jour la liste des conversations pour refléter l'accusé de réception
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          // Trouver la conversation qui contient ce message
          if (conv.lastMessage.id === messageId) {
            return {
              ...conv,
              lastMessage: {
                ...conv.lastMessage,
                acknowledged: true,
                acknowledged_at: new Date().toISOString()
              }
            };
          }
          return conv;
        })
      );
      
    } catch (error) {
      logger.error('❌ Erreur lors de l\'accusé de réception:', error);
      // En cas d'erreur, recharger les données depuis la BD pour restaurer la cohérence
      await loadMessageStats();
      throw error;
    }
  }, []);

  // Marquer plusieurs messages comme lus (synchronisé BD + local)
  const markMultipleAsRead = useCallback(async (messageIds) => {
    try {
      // 1. Mettre à jour localement d'abord (optimistic update)
      const updateLocalState = () => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            messageIds.includes(msg.id)
              ? {
                  ...msg,
                  recipients: msg.recipients?.map(recipient => 
                    recipient.id === user.id 
                      ? { ...recipient, is_read: true, read_at: new Date().toISOString() }
                      : recipient
                  )
                }
              : msg
          )
        );

        setConversationMessages(prevMessages => 
          prevMessages.map(msg => 
            messageIds.includes(msg.id)
              ? {
                  ...msg,
                  recipients: msg.recipients?.map(recipient => 
                    recipient.id === user.id 
                      ? { ...recipient, is_read: true, read_at: new Date().toISOString() }
                      : recipient
                  )
                }
              : msg
          )
        );

        // Mettre à jour les statistiques
        setMessageStats(prev => ({
          ...prev,
          unread_count: Math.max(0, prev.unread_count - messageIds.length)
        }));
      };

      // 2. Mettre à jour la base de données
      await messageService.markMultipleAsRead(messageIds);
      
      // 3. Appliquer les changements locaux
      updateLocalState();
      
    } catch (error) {
      logger.error('❌ Erreur lors du marquage multiple:', error);
      // En cas d'erreur, recharger les données depuis la BD pour restaurer la cohérence
      await loadMessageStats();
      throw error;
    }
  }, [user?.id]);

  // Indiquer qu'un utilisateur tape
  const startTyping = useCallback((conversationId, recipientId) => {
    socketService.startTyping(conversationId, recipientId);
    
    // Nettoyer le timeout précédent
    if (typingTimeoutRef.current.has(recipientId)) {
      clearTimeout(typingTimeoutRef.current.get(recipientId));
    }
    
    // Arrêter l'indication après 3 secondes
    const timeout = setTimeout(() => {
      socketService.stopTyping(conversationId, recipientId);
      typingTimeoutRef.current.delete(recipientId);
    }, 3000);
    
    typingTimeoutRef.current.set(recipientId, timeout);
  }, []);

  // Arrêter l'indication de frappe
  const stopTyping = useCallback((conversationId, recipientId) => {
    socketService.stopTyping(conversationId, recipientId);
    
    if (typingTimeoutRef.current.has(recipientId)) {
      clearTimeout(typingTimeoutRef.current.get(recipientId));
      typingTimeoutRef.current.delete(recipientId);
    }
  }, []);

  // Rejoindre une conversation
  const joinConversation = useCallback((conversationId) => {
    socketService.joinConversation(conversationId);
  }, []);

  // Quitter une conversation
  const leaveConversation = useCallback((conversationId) => {
    socketService.leaveConversation(conversationId);
    // Nettoyer la référence de conversation actuelle
    currentConversationRef.current = null;
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  // Nettoyer les notifications anciennes
  const clearOldNotifications = useCallback(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    setNotifications(prev => prev.filter(notif => notif.timestamp.getTime() > oneHourAgo));
  }, []);

  // Récupérer les conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération des conversations:', error);
    }
  }, []);

  // Charger les messages d'une conversation
  const loadConversationMessages = useCallback(async (userId) => {
    try {
      const conversationData = await messageService.getConversationHistory(userId);
      setConversationMessages(conversationData);
      
      // Mettre à jour la référence de conversation actuelle
      currentConversationRef.current = {
        partner: { id: userId }
      };
      
      // Marquer automatiquement tous les messages non lus comme lus
      if (!user || !user.id) return conversationData;
      
      const unreadMessages = conversationData.filter(msg => {
        // Ne pas marquer les messages envoyés par l'utilisateur actuel
        if (msg.sender.id === user.id) return false;
        
        // Chercher le statut de lecture pour l'utilisateur actuel dans les recipients
        const userRecipient = msg.recipients?.find(r => r.id === user.id);
        return userRecipient && !userRecipient.is_read;
      });
      
      if (unreadMessages.length > 0) {
        try {
          // Utiliser le marquage multiple synchronisé (gère BD + local automatiquement)
          const messageIds = unreadMessages.map(msg => msg.id);
          await markMultipleAsRead(messageIds);
          
          // Mettre à jour la liste des conversations pour refléter le marquage comme lu
          setConversations(prevConversations => 
            prevConversations.map(conv => {
              // Trouver la conversation correspondante (par ID du partenaire)
              const conversationPartnerId = currentConversationRef.current?.partner?.id;
              if (conv.partner.id === conversationPartnerId) {
                return {
                  ...conv,
                  lastMessage: {
                    ...conv.lastMessage,
                    is_read: true
                  },
                  stats: {
                    ...conv.stats,
                    unread_count: Math.max(0, conv.stats.unread_count - unreadMessages.length)
                  }
                };
              }
              return conv;
            })
          );
        } catch (error) {
          logger.error('❌ Erreur lors du marquage automatique multiple:', error);
        }
      }
      
      return conversationData;
    } catch (error) {
      logger.error('❌ Erreur lors du chargement des messages de conversation:', error);
      throw error;
    }
  }, [user?.id, fetchConversations]);

  // Mettre à jour une conversation après un nouveau message
  const updateConversation = useCallback((messageData) => {
    if (!user || !user.id) return;
    
    setConversations(prevConversations => {
      const partnerId = messageData.sender.id === user.id ? 
        messageData.recipients?.[0]?.id : messageData.sender.id;
      
      if (!partnerId) return prevConversations;

      const existingConversationIndex = prevConversations.findIndex(
        conv => conv.partner.id === partnerId
      );

      // Déterminer l'état de lecture basé sur les données réelles de la BD
      const isMessageRead = messageData.sender.id === user.id ? 
        true : // Message envoyé = toujours lu par l'expéditeur
        (messageData.recipients?.find(r => r.id === user.id)?.is_read || false); // Message reçu = vérifier l'état BD

      // Déterminer le compteur de messages non lus
      const unreadCount = messageData.sender.id === user.id ? 
        0 : // Message envoyé = 0 non lu
        (isMessageRead ? 0 : 1); // Message reçu = 0 si lu, 1 si non lu

      // Message reçu

      const updatedConversation = {
        id: partnerId,
        partner: {
          id: partnerId,
          pseudo: messageData.sender.id === user.id ? 
            messageData.recipients?.[0]?.pseudo : messageData.sender.pseudo,
          role: messageData.sender.id === user.id ? 
            messageData.recipients?.[0]?.role : messageData.sender.role
        },
        lastMessage: {
          id: messageData.id,
          subject: messageData.subject,
          content: messageData.content,
          is_urgent: messageData.is_urgent,
          created_at: messageData.created_at,
          sender: messageData.sender,
          message_type: messageData.sender.id === user.id ? 'sent' : 'received',
          is_read: isMessageRead, // ✅ État de lecture basé sur la BD
          acknowledged: false
        },
        stats: {
          total_messages: 1,
          unread_count: unreadCount // ✅ Compteur basé sur l'état réel
        }
      };

      if (existingConversationIndex >= 0) {
        // Mettre à jour la conversation existante
        const updated = [...prevConversations];
        const existingConv = updated[existingConversationIndex];
        
        // Mettre à jour avec le nouveau message et les bonnes statistiques
        const isInCurrentConversation = currentConversationRef.current && 
          currentConversationRef.current.partner.id === partnerId;
        
        // Calculer le nouveau compteur de messages non lus basé sur l'état BD
        const newUnreadCount = messageData.sender.id === user.id ? 
          existingConv.stats.unread_count : // Message envoyé = garder le compteur existant
          (isInCurrentConversation ? 
            existingConv.stats.unread_count : // Dans la conversation = pas d'augmentation
            (isMessageRead ? 
              existingConv.stats.unread_count : // Message lu = pas d'augmentation
              existingConv.stats.unread_count + 1)); // Message non lu = augmentation
        
        updated[existingConversationIndex] = {
          ...existingConv,
          lastMessage: {
            ...updatedConversation.lastMessage,
            is_read: isMessageRead // ✅ Utiliser l'état de lecture basé sur la BD
          },
          stats: {
            total_messages: existingConv.stats.total_messages + 1,
            unread_count: newUnreadCount // ✅ Utiliser le compteur basé sur l'état BD
          }
        };

        // Conversation mise à jour
        
        // Déplacer la conversation en haut de la liste
        const [movedConversation] = updated.splice(existingConversationIndex, 1);
        return [movedConversation, ...updated];
      } else {
        // Nouvelle conversation créée
        
        // Ajouter une nouvelle conversation en haut
        return [updatedConversation, ...prevConversations];
      }
    });
  }, [user]);

  // Vérifier que l'utilisateur est connecté
  if (!user || !user.id) {
    return {
      isConnected: false,
      messages: [],
      conversations: [],
      conversationMessages: [],
      messageStats: { unread_count: 0, unacknowledged_count: 0, urgent_unread_count: 0 },
      typingUsers: new Map(),
      notifications: [],
      sendMessage: () => Promise.reject(new Error(i18nService.t('messages.errors.userNotConnected'))),
      markAsRead: () => Promise.reject(new Error(i18nService.t('messages.errors.userNotConnected'))),
      acknowledgeMessage: () => Promise.reject(new Error(i18nService.t('messages.errors.userNotConnected'))),
      startTyping: () => {},
      stopTyping: () => {},
      joinConversation: () => {},
      leaveConversation: () => {},
      removeNotification: () => {},
      clearOldNotifications: () => {},
      fetchConversations: () => Promise.resolve([]),
      loadConversationMessages: () => Promise.resolve([]),
      updateConversation: () => {},
      loadMessages: () => Promise.resolve([]),
      loadMessageStats: () => Promise.resolve({})
    };
  }

  return {
    // État
    isConnected,
    messages,
    conversations,
    conversationMessages,
    messageStats,
    typingUsers,
    notifications,
    
    // Actions
    loadMessages,
    loadMessageStats,
    fetchConversations,
    loadConversationMessages,
    sendMessage,
    markAsRead,
    markMultipleAsRead,
    acknowledgeMessage,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
    removeNotification,
    clearOldNotifications
  };
};
