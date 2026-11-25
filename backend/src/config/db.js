// MongoDB Atlas se connect karne ka function.

import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Agar .env mein MONGODB_URI nahi hai, to saaf message dekar ruk jao
  if (!uri) {
    console.error("MONGODB_URI is missing. Add it to backend/.env");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(uri);
    console.log(`MongoDB connected (database: ${connection.connection.name})`);
  } catch (error) {
    // Password ya connection string ko print nahi karte, sirf error ka message
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;
