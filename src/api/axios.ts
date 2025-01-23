import axios, { AxiosInstance } from "axios";
import { clearStorage, getAuthTokenFromStorage } from "../utils/authHelplers";

const SERVER_URL = import.meta.env.VITE_SERVER_URL as string;
const BASE_URL = `${SERVER_URL}/api`;

// Create Axios instance for private requests
const axiosApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public request instance without authorization
export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to add auth token for private requests
axiosApi.interceptors.request.use(
  (config) => {
    const token = getAuthTokenFromStorage();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - please log in.");
      clearStorage();
      window.location.reload(); // Refresh the current page
    }
    return Promise.reject(error);
  }
);

export default axiosApi;
