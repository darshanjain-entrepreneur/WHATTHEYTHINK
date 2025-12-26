import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDB } from "./_db.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: "User exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash });

  res.json({ success: true });
}