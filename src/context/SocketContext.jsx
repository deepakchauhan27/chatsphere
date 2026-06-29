import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket";

import {
  addMessage,
  removeMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
  addNotification,
  updateChatInList,
  addChatToList,
} from "../store/chatSlice";

import { setIncomingCall } from "../store/callSlice";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);

  const activeChatRef = useRef(activeChat);
  const [isConnected, setIsConnected] = useState(false);

  // Keep activeChatRef in sync
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    if (socket.connected) {
      setIsConnected(true);
      socket.emit("user:online", user._id);
    }

    // Remove old listeners before adding new ones
    socket.off("connect");
    socket.off("disconnect");
    socket.off("user:online");
    socket.off("user:offline");
    socket.off("message:receive");
    socket.off("message:deleted");
    socket.off("user:typing");
    socket.off("user:stopTyping");
    socket.off("group:created");
    socket.off("group:updated");
    socket.off("group:memberAdded");
    socket.off("group:memberRemoved");
    socket.off("call:incoming");

    // ── Connection ─────────────────────────────────
    socket.on("connect", () => {
      console.log("Socket Connected");

      setIsConnected(true);
      socket.emit("user:online", user._id);
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
      setIsConnected(false);
    });

    // ── Online Users ───────────────────────────────
    socket.on("user:online", ({ onlineUsers }) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("user:offline", ({ onlineUsers }) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    // ── Receive Message ────────────────────────────
    socket.on("message:receive", (message) => {
      dispatch(addMessage(message));

      // Show notification if not in active chat
      if (
        !activeChatRef.current ||
        activeChatRef.current._id !== (message.chat._id || message.chat)
      ) {
        dispatch(addNotification(message));
      }
    });

    // ── Message Deleted ────────────────────────────
    socket.on("message:deleted", ({ messageId }) => {
      dispatch(removeMessage({ messageId }));
    });

    // ── Typing Indicators ──────────────────────────
    socket.on("user:typing", ({ chatId, userId, userName }) => {
      dispatch(addTypingUser({ userId, chatId, userName }));
    });

    socket.on("user:stopTyping", ({ chatId, userId }) => {
      dispatch(removeTypingUser({ userId, chatId }));
    });

    // ── Group Events ───────────────────────────────
    socket.on("group:created", (group) => {
      dispatch(addChatToList(group));
    });

    socket.on("group:updated", (group) => {
      dispatch(updateChatInList(group));
    });

    socket.on("group:memberAdded", (group) => {
      dispatch(addChatToList(group));
    });

    socket.on("group:memberRemoved", (group) => {
      dispatch(updateChatInList(group));
    });

    // ── Incoming Call Only ─────────────────────────
    socket.on("call:incoming", (callData) => {
      console.log("Incoming call:", callData);
      dispatch(setIncomingCall(callData));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("message:receive");
      socket.off("message:deleted");
      socket.off("user:typing");
      socket.off("user:stopTyping");
      socket.off("group:created");
      socket.off("group:updated");
      socket.off("group:memberAdded");
      socket.off("group:memberRemoved");
      socket.off("call:incoming");
    };
  }, [user, dispatch]);

  // ── Emit Helpers ────────────────────────────────
  const joinChat = (chatId) => {
    const socket = getSocket();
    socket?.emit("chat:join", chatId);
  };

  const leaveChat = (chatId) => {
    const socket = getSocket();
    socket?.emit("chat:leave", chatId);
  };

  const emitMessage = (message) => {
    const socket = getSocket();
    socket?.emit("message:send", message);
  };

  const emitTyping = (chatId) => {
    const socket = getSocket();

    socket?.emit("user:typing", {
      chatId,
      userId: user._id,
      userName: user.name,
    });
  };

  const emitStopTyping = (chatId) => {
    const socket = getSocket();

    socket?.emit("user:stopTyping", {
      chatId,
      userId: user._id,
    });
  };

  const emitDeleteMessage = (chatId, messageId) => {
    const socket = getSocket();
    socket?.emit("message:deleted", { chatId, messageId });
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        joinChat,
        leaveChat,
        emitMessage,
        emitTyping,
        emitStopTyping,
        emitDeleteMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }

  return context;
};

export default SocketContext;
