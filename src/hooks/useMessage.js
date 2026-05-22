import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector }    from "react-redux";
import {
  fetchMessages,
  sendMessage,
  clearNotification,
} from "../store/chatSlice";
import useSocket from "./useSocket";
import chatService from "../services/chatService";

const useMessages = (chatId) => {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const { messages, msgLoading } = useSelector((state) => state.chat);
  const { emitMessage, emitTyping, emitStopTyping, emitDeleteMessage } = useSocket();

  const [isTyping,   setIsTyping]   = useState(false);
  const typingTimerRef              = useRef(null);
  const bottomRef                   = useRef(null);

  // ── Fetch messages on chat open ────────────────────
  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages(chatId));
      dispatch(clearNotification(chatId));
      chatService.markAsRead(chatId);
    }
  }, [chatId, dispatch]);

  // ── Scroll to bottom on new message ───────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send text message ──────────────────────────────
  const handleSendMessage = async (content) => {
    if (!content.trim() || !chatId) return;

    const formData = new FormData();
    formData.append("chatId",  chatId);
    formData.append("content", content.trim());
    formData.append("type",    "text");

    const result = await dispatch(sendMessage(formData));

    if (sendMessage.fulfilled.match(result)) {
      emitMessage(result.payload);
      emitStopTyping(chatId);
    }
  };

  // ── Send media message ─────────────────────────────
  const handleSendMedia = async (file, type) => {
    if (!file || !chatId) return;

    const formData = new FormData();
    formData.append("chatId",  chatId);
    formData.append("media",   file);
    formData.append("type",    type);
    formData.append("content", file.name);

    const result = await dispatch(sendMessage(formData));

    if (sendMessage.fulfilled.match(result)) {
      emitMessage(result.payload);
    }
  };

  // ── Delete message ─────────────────────────────────
  const handleDeleteMessage = async (messageId) => {
    await chatService.deleteMessage(messageId);
    emitDeleteMessage(chatId, messageId);
  };

  // ── Typing indicator logic ─────────────────────────
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(chatId);
    }

    // Stop typing after 2 seconds of inactivity
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(chatId);
    }, 2000);
  };

  // ── Format message timestamp ───────────────────────
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  // ── Check if message is own ────────────────────────
  const isOwnMessage = (senderId) => {
    return senderId === user?._id ||
           senderId?._id === user?._id;
  };

  // ── Group messages by date ─────────────────────────
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  return {
    messages,
    msgLoading,
    isTyping,
    bottomRef,
    handleSendMessage,
    handleSendMedia,
    handleDeleteMessage,
    handleTyping,
    formatTime,
    isOwnMessage,
    groupMessagesByDate,
  };
};

export default useMessages;