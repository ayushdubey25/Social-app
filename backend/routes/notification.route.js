// notification.route.js
import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const router = express.Router();

// Get all notifications for user
router.get("/", protectRoute, async (req, res) => {
  try {
    const notifications = await Notification.find({ to: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "from",
        select: "username profileImg",
      });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread notification count
router.get("/unread-count", protectRoute, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      to: req.user._id,
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Mark notifications as read
router.put("/mark-as-read", protectRoute, async (req, res) => {
  try {
    await Notification.updateMany(
      { to: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create message notification
router.post("/message", protectRoute, async (req, res) => {
  try {
    const { to, conversationId } = req.body;

    const notification = await Notification.create({
      type: "message",
      from: req.user._id,
      to,
      conversationId,
      read: false,
    });

    // Populate the 'from' field before sending response
    await notification.populate({
      path: "from",
      select: "username profileImg",
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
