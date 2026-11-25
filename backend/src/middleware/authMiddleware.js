// Middleware: controller se pehle chalta hai aur check karta hai ki user logged in hai ya nahi.
// Sahi hone par req.user mein user rakhta hai aur next() se aage jaane deta hai.

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    // 1. Header se token nikalo. Format:  Authorization: Bearer <token>
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Please log in to continue." });
    }

    // 2. Token ka signature aur expiry check karo (sirf wahi algorithm jo hum use karte hain)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // 3. User abhi database mein hai ya nahi (account delete ho gaya ho to token bekaar hai)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({
          message: "This account no longer exists. Please log in again.",
        });
    }

    // 4. Aage ke functions ke liye user ko request ke saath rakh do
    req.user = user;
    next();
  } catch (error) {
    // Token ki expiry khatam
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Token toota hua, badla hua, ya galat key se bana
    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res
        .status(401)
        .json({ message: "Invalid token. Please log in again." });
    }

    // Baaki sab: andar ki baat bahar nahi batate
    console.error("Auth error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
}
