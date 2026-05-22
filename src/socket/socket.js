import { io } from "socket.io-client";

let socket = null;

// ── Initialize Socket ───────────────────────────────
export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports:       ["websocket"],
      reconnection:     true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
  return socket;
};

// ── Get Socket Instance ─────────────────────────────
export const getSocket = () => socket;

// ── Disconnect Socket ───────────────────────────────
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;