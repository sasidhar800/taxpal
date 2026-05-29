import axios from "axios";
import {
  AUTH_EVENT,
  clearAuthSession,
  getAuthHeaders,
} from "./auth";

const normalizeApiBaseUrl = (url) => {
  const trimmedUrl = url.replace(/\/+$/, "");

  return trimmedUrl.endsWith("/api") ? trimmedUrl.slice(0, -4) : trimmedUrl;
};

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const requestUrl = config.url || "";

  if (
    requestUrl &&
    !requestUrl.startsWith("http") &&
    !requestUrl.startsWith("/api")
  ) {
    config.url = requestUrl.startsWith("/")
      ? `/api${requestUrl}`
      : `/api/${requestUrl}`;
  }

  config.headers = {
    ...(config.headers || {}),
    ...getAuthHeaders(),
  };

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      window.dispatchEvent(new Event(AUTH_EVENT));
    }

    return Promise.reject(error);
  }
);

export default api;
