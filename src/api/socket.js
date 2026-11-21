import { io } from "socket.io-client";
import { API_URL } from "./client";

// Tətbiq boyu bir socket bağlantısı (singleton). Kimlik JWT ilə yoxlanılır.
// Dinləyicilər reyestrdə saxlanılır: socket yenidən yaradılanda (məs. girişdən sonra) avtomatik qoşulurlar.
class SocketService {
  socket = null;
  token = null;
  handlers = new Map(); // event -> Set(handler)

  connect(token) {
    if (!token) return null;
    if (this.socket && this.token === token) return this.socket;
    this.disconnect();
    this.token = token;
    this.socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { token },
    });
    for (const [event, set] of this.handlers) {
      for (const handler of set) this.socket.on(event, handler);
    }
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.token = null;
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }

  on(event, handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(handler);
    this.socket?.on(event, handler);
  }

  off(event, handler) {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }
    return false;
  }

  joinRoom(roomId) {
    this.emit("join_room", { roomId });
  }

  leaveRoom(roomId) {
    this.emit("leave_room", { roomId });
  }

  sendMessage(message) {
    return this.emit("send_message", message);
  }

  sendTyping(roomId, isTyping) {
    this.emit("typing_indicator", { roomId, isTyping });
  }
}

const socketService = new SocketService();
export default socketService;
