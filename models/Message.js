import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  receiverId: mongoose.Schema.Types.ObjectId,
  groupId: mongoose.Schema.Types.ObjectId,
  messageText: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);