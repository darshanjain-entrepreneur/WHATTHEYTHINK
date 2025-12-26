import Message from "../models/Message.js";
import { connectDB } from "./_db.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { receiverId, groupId, messageText } = req.body;
    await Message.create({ receiverId, groupId, messageText });
    return res.json({ success: true });
  }

  if (req.method === "GET") {
    const { receiverId } = req.query;
    const messages = await Message.find({ receiverId }).sort({ createdAt: -1 });
    return res.json(messages);
  }

  res.status(405).end();
}