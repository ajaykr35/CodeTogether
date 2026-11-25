// backend/src/models/User.js
// User ka model: database mein har user ka data kaisa dikhega.

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // aage-peeche ke spaces hata deta hai
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name can be at most 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ek email se ek hi account
      lowercase: true, // hamesha chhote letters mein save hoga
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },

    // Asli password kabhi save nahi hota, sirf uska bcrypt hash (Phase 4 mein banayenge)
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // user ko padhte waqt ye default mein nahi aata
    },
  },
  { timestamps: true } // createdAt aur updatedAt apne aap lagte hain
);

// Mongoose is model ke liye "users" naam ka collection banata hai
const User = mongoose.model("User", userSchema);

export default User;