// /api/auth/... ke URLs aur unke controller functions ka mapping.

import { Router } from "express";
import { register } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);

export default router;
