// Server yahan se shuru hota hai: pehle settings check, phir database, phir server.

import "dotenv/config"; // .env ko sabse pehle load karna zaroori hai
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

// Port: jis darwaze par server sunega
const PORT = process.env.PORT || 5000;

// Bina JWT_SECRET ke login surakshit nahi hota, isliye shuru hi nahi karte
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET is missing or too short. Add a long random text (32+ characters) to backend/.env",
  );
  process.exit(1);
}

async function start() {
  await connectDB(); // pehle database
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
