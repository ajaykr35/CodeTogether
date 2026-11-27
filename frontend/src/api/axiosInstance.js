// Axios ka ek taiyar object: backend ka address aur har request mein token lagana.

import axios from "axios";

export const TOKEN_KEY = "codetogether-token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Har request bhejne se pehle: agar token saved hai, to header mein laga do
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Storage na mile to bina token ke bhejo
  }
  return config;
});

export default api;
