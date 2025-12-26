import Group from "../models/Group.js";
import User from "../models/User.js";
import { connectDB } from "./_db.js";
import crypto from "crypto";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") return res.status(405).end();

  const { userId, name } = req.body;
  const inviteCode = crypto.randomBytes(4).toString("hex");

  const group = await Group.create({ name, inviteCode, members: [userId] });
  await User.findByIdAndUpdate(userId, { $push: { groups: group._id } });

  res.json(group);
}