import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach staff JWT token. Anonymous user flow should send id/handle payload directly.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("healin_staff_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("healin_staff_token");
      window.location.href = "/staff/login";
    }
    return Promise.reject(error);
  }
);

export default api;
