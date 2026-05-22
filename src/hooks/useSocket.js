import { useEffect, useRef }      from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket }              from "../socket/socket";
import {
  addMessage,
  removeMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
  addNotification,
} from "../store/chatSlice";

const useSocket = () => {
  const dispatch       = useDispatch();
  const { user }       = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);
  const activeChatRef  = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // ── Join a chat room ───────────────────────────────
  const joinChat = (chatId) => {
    const socket = getSocket();
    socket?.emit("chat:join", chatId);
  };

  // ── Leave a chat room ──────────────────────────────
  const leaveChat = (chatId) => {
    const socket = getSocket();
    socket?.emit("chat:leave", chatId);
  };

  // ── Send message via socket ────────────────────────
  const emitMessage = (message) => {
    const socket = getSocket();
    socket?.emit("message:send", message);
  };

  // ── Emit typing start ──────────────────────────────
  const emitTyping = (chatId) => {
    const socket = getSocket();
    socket?.emit("user:typing", {
      chatId,
      userId:   user?._id,
      userName: user?.name,
    });
  };

  // ── Emit typing stop ───────────────────────────────
  const emitStopTyping = (chatId) => {
    const socket = getSocket();
    socket?.emit("user:stopTyping", {
      chatId,
      userId: user?._id,
    });
  };

  // ── Emit message deleted ───────────────────────────
  const emitDeleteMessage = (chatId, messageId) => {
    const socket = getSocket();
    socket?.emit("message:deleted", { chatId, messageId });
  };

  // ── Emit group created ─────────────────────────────
  const emitGroupCreated = (group, members) => {
    const socket = getSocket();
    socket?.emit("group:created", { group, members });
  };

  // ── Emit member added to group ─────────────────────
  const emitMemberAdded = (chatId, userId, group) => {
    const socket = getSocket();
    socket?.emit("group:memberAdded", { chatId, userId, group });
  };

  // ── Emit member removed from group ────────────────
  const emitMemberRemoved = (chatId, userId, group) => {
    const socket = getSocket();
    socket?.emit("group:memberRemoved", { chatId, userId, group });
  };

  return {
    joinChat,
    leaveChat,
    emitMessage,
    emitTyping,
    emitStopTyping,
    emitDeleteMessage,
    emitGroupCreated,
    emitMemberAdded,
    emitMemberRemoved,
  };
};

export default useSocket;