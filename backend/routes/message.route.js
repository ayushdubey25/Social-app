// routes/message.route.js
import express from "express";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const router = express.Router();

// Endpoint to send a message
router.post("/send", async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    // Create the message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content,
    });
    // Update conversation's last updated timestamp (or lastMessage) if desired
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastUpdated: Date.now(),
    });
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// Endpoint to fetch messages for a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 }) // chronological order
      .populate("sender", "username fullname"); // Optionally populate sender info
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

export default router;
