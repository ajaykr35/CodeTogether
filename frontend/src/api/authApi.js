// Account se jude API calls. Pages seedha URL nahi likhte, yahan se bulate hain.

import api from "./axiosInstance.js";

export const registerRequest = (data) => api.post("/auth/register", data);
export const loginRequest = (data) => api.post("/auth/login", data);
export const getMeRequest = () => api.get("/auth/me");
