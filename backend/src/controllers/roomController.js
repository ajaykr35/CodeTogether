// Room banana aur rooms ki list.

import bcrypt from "bcryptjs";
import Room from "../models/Room.js";
import { generateRoomId, generateRoomCode } from "../utils/generateCodes.js";

const SALT_ROUNDS = 10;
const MAX_ROOMS_PER_USER = 20; // ek user kitne rooms bana sakta hai (proposed limit)
const JOIN_MODES = ["open", "approval"];
const DEFAULT_ROLES = ["editor", "viewer"];

// Room ka data jo bahar bhejna surakshit hai (codeHash kabhi nahi)
function formatRoom(room, role) {
  return {
    roomId: room.roomId,
    name: room.name,
    joinMode: room.joinMode,
    defaultRole: room.defaultRole,
    role, // is user ka role is room mein
    memberCount: room.members.length,
    createdAt: room.createdAt,
  };
}

// Room banane ka data check karta hai
function validateCreateRoom({ name, joinMode, defaultRole }) {
  const errors = {};

  if (typeof name !== "string" || name.trim().length < 3) {
    errors.name = "Room name must be at least 3 characters.";
  } else if (name.trim().length > 50) {
    errors.name = "Room name can be at most 50 characters.";
  }

  if (!JOIN_MODES.includes(joinMode)) {
    errors.joinMode = "Choose open or approval.";
  }

  if (!DEFAULT_ROLES.includes(defaultRole)) {
    errors.defaultRole = "Choose editor or viewer.";
  }

  return errors;
}

// POST /api/rooms
export async function createRoom(req, res) {
  try {
    const { name, joinMode, defaultRole } = req.body || {};

    // 1. Data check
    const errors = validateCreateRoom({ name, joinMode, defaultRole });
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ message: "Please correct the errors.", errors });
    }

    // 2. Ek user ke rooms ki had
    const created = await Room.countDocuments({ admin: req.user._id });
    if (created >= MAX_ROOMS_PER_USER) {
      return res
        .status(403)
        .json({
          message: `You can create at most ${MAX_ROOMS_PER_USER} rooms.`,
        });
    }

    // 3. Code banao aur uska hash (asli code sirf ek baar user ko dikhega)
    const code = generateRoomCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);

    // 4. Room save karo. Room ID kisi aur room se mil jaye (bahut kam), to naya ID banakar dobara try
    let room = null;
    for (let attempt = 0; attempt < 5 && !room; attempt++) {
      try {
        room = await Room.create({
          roomId: generateRoomId(),
          codeHash,
          name: name.trim(),
          joinMode,
          defaultRole,
          admin: req.user._id,
          members: [{ user: req.user._id, role: "admin" }], // banane wala pehla member aur admin
        });
      } catch (error) {
        if (error.code !== 11000) throw error; // sirf "ID repeat" par dobara, baaki galti upar bhejo
      }
    }

    if (!room) {
      return res
        .status(500)
        .json({ message: "Could not create the room. Please try again." });
    }

    // 5. Jawab: code yahin sirf ek baar jata hai. Baad mein ise dobara dekha nahi ja sakta.
    return res.status(201).json({
      message: "Room created.",
      room: formatRoom(room, "admin"),
      code,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Please correct the errors." });
    }
    console.error("Create room error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}

// GET /api/rooms
export async function getMyRooms(req, res) {
  try {
    const rooms = await Room.find({ "members.user": req.user._id }).sort({
      updatedAt: -1,
    });

    const list = rooms.map((room) => {
      const me = room.members.find((member) =>
        member.user.equals(req.user._id),
      );
      return formatRoom(room, me ? me.role : "viewer");
    });

    return res.status(200).json({ rooms: list });
  } catch (error) {
    console.error("Get rooms error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
}
