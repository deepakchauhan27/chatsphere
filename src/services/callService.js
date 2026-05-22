import api from "./api";

const callService = {

  // ── Save Call Log ────────────────────────────────
  saveCallLog: async ({ receiverId, type, status, duration, startedAt, endedAt }) => {
    const { data } = await api.post("/calls", {
      receiverId,
      type,
      status,
      duration,
      startedAt,
      endedAt,
    });
    return data;
  },

  // ── Get Call History ─────────────────────────────
  getCallHistory: async () => {
    const { data } = await api.get("/calls/history");
    return data;
  },

  // ── Update Call Status ───────────────────────────
  updateCallStatus: async (callId, { status, duration, endedAt }) => {
    const { data } = await api.put(`/calls/${callId}`, {
      status,
      duration,
      endedAt,
    });
    return data;
  },

  // ── Delete Call Log ──────────────────────────────
  deleteCallLog: async (callId) => {
    const { data } = await api.delete(`/calls/${callId}`);
    return data;
  },
};

export default callService;