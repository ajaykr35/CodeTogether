// Room ka model: naam, Room ID, code ka hash, join mode aur members.

import mongoose from "mongoose";

// Room ke andar ek member: kaun, aur uska role
const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "editor", "viewer"], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }, // har member ko alag id ki zaroorat nahi
);

const roomSchema = new mongoose.Schema(
  {
    // Room ko pehchanne wala 8 akshar ka ID (har room ka alag)
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Code ka bcrypt hash. Asli code kabhi save nahi hota.
    codeHash: { type: String, required: true, select: false },

    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [3, "Room name must be at least 3 characters"],
      maxlength: [50, "Room name can be at most 50 characters"],
    },

    // open = Room ID aur code se seedha andar, approval = admin ki ijazat chahiye
    joinMode: { type: String, enum: ["open", "approval"], default: "open" },

    // Naya member join kare to use kaunsa role mile
    defaultRole: {
      type: String,
      enum: ["editor", "viewer"],
      default: "editor",
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: { type: [memberSchema], default: [] },
  },
  { timestamps: true },
);

// "Mere rooms" ki list jaldi nikalne ke liye
roomSchema.index({ "members.user": 1 });

const Room = mongoose.model("Room", roomSchema);

export default Room;
