import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
  name: String,
  inviteCode: { type: String, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);