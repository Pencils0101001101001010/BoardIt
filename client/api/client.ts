import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("boardit_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  //Success handler. This just passes success response through unchanged
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("boardit_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
