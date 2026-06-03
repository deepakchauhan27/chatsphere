import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import callService from "../services/callService";

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

const initialState = {
  incomingCall:     null,
  activeCall:       null,
  callStatus:       "idle",
  isAudioMuted:     false,
  isVideoMuted:     false,
  isScreenSharing:  false,
  callDuration:     0,
  callStartTime:    null,
  callHistory:      [],
  historyLoading:   false,
  error:            null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
      if (action.payload) state.callStatus = "ringing";
    },

    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },

    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
      if (action.payload) state.callStatus = "calling";
    },

    setCallConnected: (state) => {
      state.callStatus   = "connected";
      state.callStartTime = Date.now();
    },

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

    toggleAudioMute: (state) => {
      state.isAudioMuted = !state.isAudioMuted;
    },

    toggleVideoMute: (state) => {
      state.isVideoMuted = !state.isVideoMuted;
    },

    toggleScreenShare: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },

    setCallDuration: (state, action) => {
      state.callDuration = action.payload;
    },

    incrementDuration: (state) => {
      state.callDuration += 1;
    },

    setCallStatus: (state, action) => {
      state.callStatus = action.payload;
    },

    clearCallError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(saveCallLog.fulfilled, (state, action) => {
        state.callHistory = [action.payload, ...state.callHistory];
      })
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
  setCallDuration,
  incrementDuration,
  setCallStatus,
  clearCallError,
} = callSlice.actions;

export default callSlice.reducer;