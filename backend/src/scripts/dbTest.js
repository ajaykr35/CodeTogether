// backend/src/scripts/dbTest.js
// Database test: user save karna, padhna, aur galat data rokna.
// Chalane ke liye:  npm run dbtest
// Test data hataane ke liye:  npm run dbclean

import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const TEST_EMAIL = "test.user@example.com";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to database:", mongoose.connection.name);

  // "clean" likha ho to sirf test user hatao aur ruk jao
  if (process.argv[2] === "clean") {
    const result = await User.deleteMany({ email: TEST_EMAIL });
    console.log(`Deleted ${result.deletedCount} test user(s).`);
    return;
  }

  // unique email wala index ban chuka hai, ye pakka karta hai
  await User.init();

  // Pehle purana test user hata do, taaki script baar-baar chal sake
  await User.deleteMany({ email: TEST_EMAIL });

  // 1. Create: naya user save karo (email bade letters mein bhi do, wo chhota ho jayega)
  const user = await User.create({
    name: "Test User",
    email: "Test.User@Example.com",
    passwordHash: "not-a-real-hash",
  });
  console.log("Saved:", {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  });

  // 2. Read: database se wapas padho
  const found = await User.findOne({ email: TEST_EMAIL });
  console.log("Read back:", found ? found.name : "not found");

  const total = await User.countDocuments();
  console.log("Users in database:", total);

  // 3. Duplicate email: dobara wahi email save karne par rukna chahiye
  try {
    await User.create({
      name: "Another",
      email: TEST_EMAIL,
      passwordHash: "x",
    });
    console.log("PROBLEM: duplicate email was saved");
  } catch (error) {
    if (error.code === 11000) console.log("Duplicate email blocked: OK");
    else throw error;
  }

  // 4. Validation: galat data par rukna chahiye
  try {
    await User.create({ name: "A", email: "not-an-email", passwordHash: "x" });
    console.log("PROBLEM: invalid data was saved");
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      console.log("Validation works:", messages.join(" | "));
    } else {
      throw error;
    }
  }

  console.log(
    "Test user is still in the database. Check it in Atlas, then run: npm run dbclean",
  );
}

run()
  .catch((error) => {
    console.error("Test failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
