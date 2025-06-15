// routes/conversation.route.js
import express from "express";
import Conversation from "../models/conversation.model.js";

const router = express.Router();

// Get a conversation between two users (or create one if it doesn't exist)
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    // Ensure both participants are in the conversation; order doesn't matter
    let conversation = await Conversation.findOne({
      participants: { $all: [user1, user2], $size: 2 },
    });
    if (!conversation) {
      // Create a new conversation if one doesn't exist
      conversation = await Conversation.create({
        participants: [user1, user2],
      });
    }
    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

export default router;
