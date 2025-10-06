import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import logger from '../utils/logger';
import { API_URL } from '../config/apiConfig';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  // Initialiser la connexion Socket.IO
  initialize(token) {
    if (this.socket) {
      this.disconnect();
    }

    // Utiliser l'URL de l'API pour Socket.IO
    const serverUrl = API_URL.replace('/api', '');
    
    // Délai pour s'assurer que le backend est prêt
    setTimeout(() => {
      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
      });

      this.setupEventHandlers();
      // Socket.IO client initialisé
    }, 1000); // Délai de 1 seconde
  }

  // Configurer les gestionnaires d'événements
  setupEventHandlers() {
    if (!this.socket) return;

    // Connexion réussie
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      // Connexion Socket.IO établie
      
      // Notifier les listeners
      this.emitToListeners('connection_status', { connected: true });
    });

    // Déconnexion
    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      //logger.warn(`🔌 Déconnexion Socket.IO: ${reason}`);
      
      // Notifier les listeners
      this.emitToListeners('connection_status', { connected: false, reason });
    });

    // Erreur de connexion
    this.socket.on('connect_error', (error) => {
      //logger.error('❌ Erreur de connexion Socket.IO:', error);
      
      if (error.message === 'Token invalide') {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      } else {
        // Pour les autres erreurs (comme WebSocket fermé), ne pas afficher d'erreur
        // La reconnexion automatique se chargera de rétablir la connexion
        console.log('Tentative de reconnexion Socket.IO...');
      }
    });

    // Nouveau message reçu
    this.socket.on('new_message', (messageData) => {
      // Nouveau message reçu via Socket.IO
      
      // Notifier les listeners
      this.emitToListeners('new_message', messageData);
      
      // Notification toast supprimée - les messages sont gérés en temps réel dans l'interface
    });

    // Message marqué comme lu
    this.socket.on('message_read', (data) => {
      // Message marqué comme lu
      this.emitToListeners('message_read', data);
    });

    // Message accusé de réception
    this.socket.on('message_acknowledged', (data) => {
      // Message accusé de réception
      this.emitToListeners('message_acknowledged', data);
    });

    // Statistiques des messages mises à jour
    this.socket.on('message_stats_updated', (data) => {
      // Statistiques des messages mises à jour
      this.emitToListeners('message_stats_updated', data);
    });

    // Utilisateur en train de taper
    this.socket.on('user_typing', (data) => {
      this.emitToListeners('user_typing', data);
    });

    // Notification générale
    this.socket.on('notification', (notification) => {
      // Notification reçue
      this.emitToListeners('notification', notification);
      
      // Afficher la notification
      toast.info(notification.message || 'Nouvelle notification', {
        autoClose: 5000,
        position: 'top-right'
      });
    });

    // Ping/Pong pour maintenir la connexion
    this.socket.on('pong', () => {
      // Connexion maintenue
    });
  }

  // Méthode pour rejoindre une conversation
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', { conversationId });
      // Rejoint la conversation
    }
  }

  // Méthode pour quitter une conversation
  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', { conversationId });
      // Quitté la conversation
    }
  }

  // Méthode pour indiquer qu'un utilisateur tape
  startTyping(conversationId, recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { conversationId, recipientId });
    }
  }

  // Méthode pour arrêter l'indication de frappe
  stopTyping(conversationId, recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { conversationId, recipientId });
    }
  }

  // Méthode pour envoyer un ping
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Méthode pour ajouter un listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Méthode pour supprimer un listener
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Méthode pour émettre aux listeners
  emitToListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          //logger.error(`❌ Erreur dans le listener ${event}:`, error);
        }
      });
    }
  }

  // Méthode pour vérifier la connexion
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Méthode pour se déconnecter
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      // Socket.IO déconnecté
    }
  }

  // Méthode pour obtenir l'ID du socket
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Instance singleton
const socketService = new SocketService();

export default socketService;
