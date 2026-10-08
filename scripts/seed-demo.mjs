import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DEMO = {
  name: "Demo User",
  email: "demo@gmail.com",
  password: "demo1234",
  role: "student",
};

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

const now = new Date();
await mongoose.connection.collection("users").updateOne(
  { email: DEMO.email },
  {
    $set: {
      name: DEMO.name,
      role: DEMO.role,
      password: await bcrypt.hash(DEMO.password, 10),
      updatedAt: now,
    },
    $setOnInsert: { createdAt: now, __v: 0 },
  },
  { upsert: true }
);

console.log(`Demo account ready: ${DEMO.email} / ${DEMO.password}`);
await mongoose.disconnect();
