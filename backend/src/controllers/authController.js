// Register aur (aage) login ka asli logic yahan likha jata hai.

import bcrypt from "bcryptjs";
import User from "../models/User.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10; // hash kitna "mehnat" se banega (zyada = zyada surakshit, par dheema)

// Register ka data check karta hai. Galtiyan { field: "message" } ke roop mein return karta hai.
function validateRegister({ name, email, password }) {
  const errors = {};

  // typeof string check: koi object ya list bhejkar database ko dhokha na de sake
  if (typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.trim().length > 50) {
    errors.name = "Name can be at most 50 characters.";
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (typeof password !== "string" || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  } else if (password.length > 72) {
    // bcrypt sirf pehle 72 characters padhta hai
    errors.password = "Password can be at most 72 characters.";
  }

  return errors;
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    // 1. Data check
    const errors = validateRegister({ name, email, password });
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ message: "Please correct the errors.", errors });
    }

    // 2. Password ko hash karo (asli password kabhi save nahi hota)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Database mein save karo (model email ko chhote letters mein badal dega)
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
    });

    // 4. Jawab: hash kabhi wapas nahi bhejte
    return res.status(201).json({
      message: "Account created.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    // Same email dobara: database ka unique index rokta hai (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
        errors: { email: "An account with this email already exists." },
      });
    }

    // Mongoose ke apne validation ki galti
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Please correct the errors." });
    }

    // Baaki sab: andar ki baat user ko nahi batate, sirf server ke terminal mein likhte hain
    console.error("Register error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}
