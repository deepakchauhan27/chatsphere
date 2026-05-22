import api from "./api";

const chatService = {

  // ── Get All My Chats ─────────────────────────────
  getMyChats: async () => {
    const { data } = await api.get("/chats");
    return data;
  },

  // ── Access or Create One-to-One Chat ─────────────
  accessChat: async (userId) => {
    const { data } = await api.post("/chats", { userId });
    return data;
  },

  // ── Get Chat by ID ───────────────────────────────
  getChatById: async (chatId) => {
    const { data } = await api.get(`/chats/${chatId}`);
    return data;
  },

  // ── Create Group Chat ────────────────────────────
  createGroup: async (groupData) => {
    const { data } = await api.post("/chats/group", groupData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Update Group ─────────────────────────────────
  updateGroup: async (chatId, groupData) => {
    const { data } = await api.put(`/chats/group/${chatId}`, groupData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Add Member to Group ──────────────────────────
  addToGroup: async (chatId, userId) => {
    const { data } = await api.put(`/chats/group/${chatId}/add`, { userId });
    return data;
  },

  // ── Remove Member from Group ─────────────────────
  removeFromGroup: async (chatId, userId) => {
    const { data } = await api.put(`/chats/group/${chatId}/remove`, { userId });
    return data;
  },

  // ── Get Messages ─────────────────────────────────
  getMessages: async (chatId) => {
    const { data } = await api.get(`/messages/${chatId}`);
    return data;
  },

  // ── Send Message ─────────────────────────────────
  sendMessage: async (messageData) => {
    const { data } = await api.post("/messages", messageData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Delete Message ───────────────────────────────
  deleteMessage: async (messageId) => {
    const { data } = await api.delete(`/messages/${messageId}`);
    return data;
  },

  // ── Mark Messages as Read ────────────────────────
  markAsRead: async (chatId) => {
    const { data } = await api.put(`/messages/read/${chatId}`);
    return data;
  },

  // ── Search Users by Email ────────────────────────
  searchUsers: async (email) => {
    const { data } = await api.get(`/users/search?email=${email}`);
    return data;
  },

  // ── Get All Users ────────────────────────────────
  getAllUsers: async () => {
    const { data } = await api.get("/users");
    return data;
  },

  // ── Upload Media ─────────────────────────────────
  uploadMedia: async (formData) => {
    const { data } = await api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Get Chat Media ───────────────────────────────
  getChatMedia: async (chatId) => {
    const { data } = await api.get(`/media/chat/${chatId}`);
    return data;
  },

  // ── Delete Media ─────────────────────────────────
  deleteMedia: async (messageId) => {
    const { data } = await api.delete(`/media/${messageId}`);
    return data;
  },
};

export default chatService;