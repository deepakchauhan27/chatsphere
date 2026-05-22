import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import callReducer from "./callSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    call: callReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable values
        ignoredActions: [
          "call/setCallConnected",
          "call/setActiveCall",
        ],
        ignoredPaths: ["call.callStartTime"],
      },
    }),
});

export default store;