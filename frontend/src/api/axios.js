import axios from "axios";

// Central place to change the backend URL. Everything else imports this file.
// Set VITE_API_URL in a .env file to override (see .env.example).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tourease_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, the backend returns 401/422 (flask-jwt-extended).
// Clear the stored session so the app doesn't keep sending a dead token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 422) {
      localStorage.removeItem("tourease_token");
      localStorage.removeItem("tourease_user");
    }
    return Promise.reject(error);
  }
);

export default api;
