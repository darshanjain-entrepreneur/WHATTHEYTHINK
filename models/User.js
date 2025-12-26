import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }]
});

export default mongoose.models.User || mongoose.model("User", UserSchema);