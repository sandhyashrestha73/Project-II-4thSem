import axios from "axios";

// Central place to change the backend URL
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tourease_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // JSON request हो भने JSON content type राख्ने
  // FormData हो भने Content-Type manually नराख्ने
  // Browser/Axios ले multipart boundary आफैं सेट गर्छ।
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Handle invalid/expired JWT
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