// Register aur login ka asli logic.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10; // hash kitna "mehnat" se banega (zyada = zyada surakshit, par dheema)

// Login mein user na mile tab bhi bcrypt chalate hain, taaki jawab ka time same rahe.
// Isse bahar wala ye andaza nahi laga sakta ki ye email register hai ya nahi.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", SALT_ROUNDS);

// Login ke baad ka token banata hai. Payload mein sirf user ki id.
function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

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

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    // 1. Data check: dono text hone chahiye aur khali nahi
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Enter your email and password." });
    }

    // 2. User dhoondo. passwordHash model mein chhupa hai, isliye .select("+passwordHash") se maangte hain
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    // 3. Password match karo (user na mile to dummy hash se, taaki time same rahe)
    const isMatch = await bcrypt.compare(
      password,
      user ? user.passwordHash : DUMMY_HASH,
    );

    // 4. Email galat ho ya password, jawab ek hi: kisi ko hint nahi milta
    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 5. Sab sahi: token banao aur bhejo
    return res.status(200).json({
      message: "Logged in.",
      token: createToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

// protect middleware ne req.user pehle hi bhar diya hota hai
export function getMe(req, res) {
  const user = req.user;

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}
