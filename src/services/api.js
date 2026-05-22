import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ─────────────────────────────
// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("chatly_user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────
// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("chatly_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;