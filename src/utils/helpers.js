import moment from "moment";

// ── Format chat timestamp ────────────────────────────
export const formatChatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = moment(timestamp);
  const now  = moment();

  if (date.isSame(now, "day"))   return date.format("h:mm A");
  if (date.isSame(now, "week"))  return date.format("ddd");
  if (date.isSame(now, "year"))  return date.format("MMM D");
  return date.format("MM/DD/YY");
};

// ── Format message time ──────────────────────────────
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  return moment(timestamp).format("h:mm A");
};

// ── Format full date ─────────────────────────────────
export const formatFullDate = (timestamp) => {
  if (!timestamp) return "";
  const date = moment(timestamp);
  const now  = moment();

  if (date.isSame(now, "day"))        return "Today";
  if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
  if (date.isSame(now, "year"))       return date.format("MMMM D");
  return date.format("MMMM D, YYYY");
};

// ── Format call duration ─────────────────────────────
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// ── Format file size ─────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes)           return "0 B";
  if (bytes < 1024)     return `${bytes} B`;
  if (bytes < 1048576)  return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

// ── Get file extension ───────────────────────────────
export const getFileExtension = (filename) => {
  if (!filename) return "";
  return filename.split(".").pop().toLowerCase();
};

// ── Detect media type from mimetype ─────────────────
export const detectMediaType = (mimetype) => {
  if (!mimetype)                     return "file";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "file";
};

// ── Truncate text ────────────────────────────────────
export const truncateText = (text, maxLength = 50) => {
  if (!text)                    return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// ── Get chat partner from chat object ────────────────
export const getChatPartner = (chat, currentUserId) => {
  if (!chat || chat.isGroup) return null;
  return chat.participants?.find((p) => p._id !== currentUserId) || null;
};

// ── Get chat display name ────────────────────────────
export const getChatName = (chat, currentUserId) => {
  if (!chat) return "";
  if (chat.isGroup) return chat.groupName;
  const partner = getChatPartner(chat, currentUserId);
  return partner?.name || "Unknown";
};

// ── Get chat avatar ──────────────────────────────────
export const getChatAvatar = (chat, currentUserId) => {
  if (!chat) return "";
  if (chat.isGroup) return chat.groupAvatar;
  const partner = getChatPartner(chat, currentUserId);
  return partner?.avatar || "";
};

// ── Get last message preview ─────────────────────────
export const getLastMessagePreview = (chat, currentUserId) => {
  const msg = chat?.lastMessage;
  if (!msg) return "Start a conversation";

  const isOwn      = msg.sender?._id === currentUserId;
  const senderName = isOwn ? "You" : msg.sender?.name?.split(" ")[0];
  const prefix     = chat.isGroup ? `${senderName}: ` : isOwn ? "You: " : "";

  if (msg.type === "image") return `${prefix}📷 Photo`;
  if (msg.type === "video") return `${prefix}🎥 Video`;
  if (msg.type === "audio") return `${prefix}🎙️ Audio`;
  if (msg.type === "file")  return `${prefix}📎 ${msg.mediaName || "File"}`;
  return `${prefix}${truncateText(msg.content, 40)}`;
};

// ── Check if user is online ──────────────────────────
export const isUserOnline = (userId, onlineUsers = []) => {
  return onlineUsers.includes(userId);
};

// ── Generate random avatar color ─────────────────────
export const getAvatarColor = (name) => {
  const colors = [
    "bg-yellow-300 text-yellow-900",
    "bg-blue-300 text-blue-900",
    "bg-green-300 text-green-900",
    "bg-purple-300 text-purple-900",
    "bg-pink-300 text-pink-900",
    "bg-red-300 text-red-900",
    "bg-indigo-300 text-indigo-900",
    "bg-orange-300 text-orange-900",
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ── Validate email ───────────────────────────────────
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ── Validate password ────────────────────────────────
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// ── Debounce function ────────────────────────────────
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── Copy text to clipboard ───────────────────────────
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ── Scroll element to bottom ─────────────────────────
export const scrollToBottom = (ref, smooth = true) => {
  if (ref?.current) {
    ref.current.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }
};