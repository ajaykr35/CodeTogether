// Rooms se jude API calls.

import api from "./axiosInstance.js";

export const createRoomRequest = (data) => api.post("/rooms", data);
export const getMyRoomsRequest = () => api.get("/rooms");
