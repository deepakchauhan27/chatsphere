import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../services/chatService";

// ── Async Thunks ────────────────────────────────────

export const fetchMyChats = createAsyncThunk(
  "chat/fetchMyChats",
  async (_, thunkAPI) => {
    try {
      return await chatService.getMyChats();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const accessChat = createAsyncThunk(
  "chat/accessChat",
  async (userId, thunkAPI) => {
    try {
      return await chatService.accessChat(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const createGroupChat = createAsyncThunk(
  "chat/createGroup",
  async (groupData, thunkAPI) => {
    try {
      return await chatService.createGroup(groupData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, thunkAPI) => {
    try {
      return await chatService.getMessages(chatId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, thunkAPI) => {
    try {
      return await chatService.sendMessage(messageData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (email, thunkAPI) => {
    try {
      return await chatService.searchUsers(email);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ── Initial State ───────────────────────────────────

const initialState = {
  chats:          [],
  activeChat:     null,
  messages:       [],
  searchResults:  [],
  onlineUsers:    [],
  typingUsers:    [],
  loading:        false,
  msgLoading:     false,
  error:          null,
  notification:   [],
};

// ── Slice ───────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {

    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },

    clearActiveChat: (state) => {
      state.activeChat = null;
      state.messages   = [];
    },

    // New message received via socket
    addMessage: (state, action) => {
      const message = action.payload;
      // Only add if belongs to active chat
      if (state.activeChat && message.chat._id === state.activeChat._id) {
        state.messages.push(message);
      }
      // Update last message in chat list
      state.chats = state.chats.map((chat) =>
        chat._id === (message.chat._id || message.chat)
          ? { ...chat, lastMessage: message }
          : chat
      );
    },

    // Message deleted via socket
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (m) => m._id !== action.payload.messageId
      );
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    addTypingUser: (state, action) => {
      const { userId } = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },

    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (id) => id !== action.payload.userId
      );
    },

    addNotification: (state, action) => {
      state.notification.push(action.payload);
    },

    clearNotification: (state, action) => {
      state.notification = state.notification.filter(
        (n) => n.chat._id !== action.payload
      );
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    // Update chat list after group update
    updateChatInList: (state, action) => {
      state.chats = state.chats.map((chat) =>
        chat._id === action.payload._id ? action.payload : chat
      );
    },

    // Add new chat to list
    addChatToList: (state, action) => {
      const exists = state.chats.find((c) => c._id === action.payload._id);
      if (!exists) {
        state.chats = [action.payload, ...state.chats];
      }
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch My Chats ────────────────────────────
      .addCase(fetchMyChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats   = action.payload;
      })
      .addCase(fetchMyChats.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── Access Chat ───────────────────────────────
      .addCase(accessChat.fulfilled, (state, action) => {
        state.activeChat = action.payload;
        const exists = state.chats.find((c) => c._id === action.payload._id);
        if (!exists) {
          state.chats = [action.payload, ...state.chats];
        }
      })

      // ── Create Group ──────────────────────────────
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.chats = [action.payload, ...state.chats];
      })

      // ── Fetch Messages ────────────────────────────
      .addCase(fetchMessages.pending, (state) => {
        state.msgLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.msgLoading = false;
        state.messages   = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.msgLoading = false;
        state.error      = action.payload;
      })

      // ── Send Message ──────────────────────────────
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.chats = state.chats.map((chat) =>
          chat._id === action.payload.chat._id
            ? { ...chat, lastMessage: action.payload }
            : chat
        );
      })

      // ── Search Users ──────────────────────────────
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading       = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const {
  setActiveChat,
  clearActiveChat,
  addMessage,
  removeMessage,
  setOnlineUsers,
  addTypingUser,
  removeTypingUser,
  addNotification,
  clearNotification,
  clearSearchResults,
  updateChatInList,
  addChatToList,
} = chatSlice.actions;

export default chatSlice.reducer;