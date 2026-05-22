import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import callService from "../services/callService";

// ── Async Thunks ────────────────────────────────────

export const saveCallLog = createAsyncThunk(
  "call/saveLog",
  async (logData, thunkAPI) => {
    try {
      return await callService.saveCallLog(logData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const fetchCallHistory = createAsyncThunk(
  "call/fetchHistory",
  async (_, thunkAPI) => {
    try {
      return await callService.getCallHistory();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ── Initial State ───────────────────────────────────

const initialState = {
  // Incoming call state
  incomingCall: null,       // { callId, callType, callerId, callerName, callerAvatar }

  // Active call state
  activeCall: null,         // { callId, callType, receiverId, receiverName, receiverAvatar }

  // Call status
  callStatus: "idle",       // idle | ringing | calling | connected | ended

  // Media state
  isAudioMuted:   false,
  isVideoMuted:   false,
  isScreenSharing: false,

  // Call duration
  callDuration: 0,          // in seconds
  callStartTime: null,

  // Call history
  callHistory:  [],
  historyLoading: false,

  error: null,
};

// ── Slice ───────────────────────────────────────────

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {

    // ── Incoming Call ──────────────────────────────
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
      state.callStatus   = "ringing";
    },

    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },

    // ── Outgoing Call ──────────────────────────────
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
      state.callStatus = "calling";
    },

    // ── Call Accepted ──────────────────────────────
    setCallConnected: (state) => {
      state.callStatus   = "connected";
      state.callStartTime = Date.now();
    },

    // ── Call Ended ─────────────────────────────────
    endCall: (state) => {
      state.incomingCall    = null;
      state.activeCall      = null;
      state.callStatus      = "idle";
      state.isAudioMuted    = false;
      state.isVideoMuted    = false;
      state.isScreenSharing = false;
      state.callDuration    = 0;
      state.callStartTime   = null;
    },

    // ── Media Controls ─────────────────────────────
    toggleAudioMute: (state) => {
      state.isAudioMuted = !state.isAudioMuted;
    },

    toggleVideoMute: (state) => {
      state.isVideoMuted = !state.isVideoMuted;
    },

    toggleScreenShare: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },

    setAudioMuted: (state, action) => {
      state.isAudioMuted = action.payload;
    },

    setVideoMuted: (state, action) => {
      state.isVideoMuted = action.payload;
    },

    // ── Call Duration ──────────────────────────────
    setCallDuration: (state, action) => {
      state.callDuration = action.payload;
    },

    incrementDuration: (state) => {
      state.callDuration += 1;
    },

    // ── Call Status ────────────────────────────────
    setCallStatus: (state, action) => {
      state.callStatus = action.payload;
    },

    clearCallError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Save Call Log ─────────────────────────────
      .addCase(saveCallLog.fulfilled, (state, action) => {
        state.callHistory = [action.payload, ...state.callHistory];
      })

      // ── Fetch Call History ────────────────────────
      .addCase(fetchCallHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchCallHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.callHistory    = action.payload;
      })
      .addCase(fetchCallHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error          = action.payload;
      });
  },
});

export const {
  setIncomingCall,
  clearIncomingCall,
  setActiveCall,
  setCallConnected,
  endCall,
  toggleAudioMute,
  toggleVideoMute,
  toggleScreenShare,
  setAudioMuted,
  setVideoMuted,
  setCallDuration,
  incrementDuration,
  setCallStatus,
  clearCallError,
} = callSlice.actions;

export default callSlice.reducer;