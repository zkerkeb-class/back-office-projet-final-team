import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    // On force la connexion vers le serveur back-end avec le namespace admin
    const BACKEND_URL = 'http://localhost:8080/admin';

    // En développement, on utilise le token de test si aucun token n'est fourni
    const authToken =
      process.env.NODE_ENV !== 'production' ? token || 'test-token' : token;

    if (!authToken) {
      return null;
    }

    this.socket = io(BACKEND_URL, {
      transports: ['websocket'],
      path: '/socket.io',
      auth: {
        token: authToken,
      },
      withCredentials: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
