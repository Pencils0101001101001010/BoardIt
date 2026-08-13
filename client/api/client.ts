import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// axios.create() makes a reusable instance with shared config, so you don't repeat baseURL/headers on every call
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptors run before every outgoing request, letting you modify config globally
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("boardit_token");
  // Attaching the token here means every request auto-includes auth, no manual header-setting per call
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config; // Must return the config, or the request gets stuck/broken
});

// Response interceptors take two functions: one for success, one for errors (like a global .then/.catch)
api.interceptors.response.use(
  //Success handler. This just passes success response through unchanged
  (res) => res,
  (err: AxiosError) => {
    // 401 means the token is invalid/expired, so this is a global "log the user out" handler
    if (err.response?.status === 401) {
      localStorage.removeItem("boardit_token");
      window.location.href = "/login"; // Hard redirect since we're outside React's router context here
    }
    // Re-throwing keeps the error flowing to the .catch() in whatever component made the call
    return Promise.reject(err);
  },
);

export default api; // Import this instance everywhere instead of raw axios, so config/interceptors always apply
