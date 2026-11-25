// Yahan Express app banta hai aur uske routes (URLs) jode jate hain.
// Server chalane (listen) ka kaam server.js mein hai.

import express from "express";
import mongoose from "mongoose";

const app = express();

// Request ke andar bheja gaya JSON data padhne ke liye
app.use(express.json());

// Health check: server aur database ki halat dekhne ke liye
app.get("/api/health", (req, res) => {
  // mongoose ka connection number ko naam mein badalna
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  res.json({
    status: "ok",
    message: "CodeTogether backend is running",
    database: states[mongoose.connection.readyState],
  });
});

// Agar upar ka koi route match na ho, to ye chalega (404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
