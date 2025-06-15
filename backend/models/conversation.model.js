import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    // Optional: you can store the last message info here for performance
    lastMessage: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
