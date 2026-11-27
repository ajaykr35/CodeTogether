// Yahan Express app banta hai aur uske routes (URLs) jode jate hain.
// Server chalane (listen) ka kaam server.js mein hai.

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

const app = express();

// CORS: sirf hamare frontend ko backend se baat karne do (koi aur website nahi)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

// Request ke andar bheja gaya JSON data padhne ke liye
app.use(express.json());

// Health check: server aur database ki halat dekhne ke liye
app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  res.json({
    status: "ok",
    message: "CodeTogether backend is running",
    database: states[mongoose.connection.readyState],
  });
});

// Account se jude routes: /api/auth/register, /login, /me
app.use("/api/auth", authRoutes);

// Room se jude routes: /api/rooms
app.use("/api/rooms", roomRoutes);

// Agar upar ka koi route match na ho, to ye chalega (404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler: koi bhi bachi hui galti yahan aati hai (4 parameters hone zaroori hain)
app.use((err, req, res, next) => {
  // Request mein galat JSON bheja gaya
  if (err.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "Invalid JSON in the request body." });
  }

  console.error("Unexpected error:", err.message);
  res.status(500).json({ message: "Something went wrong." });
});

export default app;
