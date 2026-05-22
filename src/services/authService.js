import api from "./api";

const authService = {

  // ── Register ────────────────────────────────────
  register: async ({ name, email, password }) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      
    });
    return data;
  },

  // ── Login ────────────────────────────────────────
  login: async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  // ── Logout ───────────────────────────────────────
  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  // ── Get Current User ─────────────────────────────
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // ── Update Profile ───────────────────────────────
  updateProfile: async (formData) => {
    const { data } = await api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // ── Search Users by Email ────────────────────────
  searchUsers: async (email) => {
    const { data } = await api.get(`/users/search?email=${email}`);
    return data;
  },

  // ── Get User Profile by ID ───────────────────────
  getUserProfile: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },
};

export default authService;