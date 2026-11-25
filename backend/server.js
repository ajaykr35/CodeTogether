// Server yahan se shuru hota hai: pehle database se connect, phir server chalu.

import "dotenv/config"; // .env ko sabse pehle load karna zaroori hai
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

// Port: jis darwaze par server sunega
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB(); // pehle database
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
