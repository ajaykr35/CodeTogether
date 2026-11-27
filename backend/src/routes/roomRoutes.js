// /api/rooms/... ke URLs. Saare routes ke liye login zaroori hai.

import { Router } from "express";
import { createRoom, getMyRooms } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Is file ke saare routes protect ke peeche
router.use(protect);

router.post("/", createRoom);
router.get("/", getMyRooms);

export default router;
