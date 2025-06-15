// routes/timetable.route.js
import express from "express";
import User from "../models/user.model.js";

import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

// Endpoint to add or edit the user's timetable
router.post("/", async (req, res) => {
  const { userId, timetable } = req.body; // Expecting userId and timetable in the request body

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }

    user.timetable = timetable; // Update the timetable
    await user.save(); // Save the user document

    res.status(200).json({
      message: "Timetable saved successfully",
      timetable: user.timetable,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save timetable" });
  }
});

// Endpoint to get the user's timetable
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }

    res.status(200).json({ timetable: user.timetable });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve timetable" });
  }
});

// In your timetable routes

router.delete("/remove-slot", protectRoute, async (req, res) => {
  try {
    const { userId, day, slot } = req.body;
    const requestingUser = req.user;

    // 1. Validate ownership
    if (requestingUser._id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You can only modify your own timetable" });
    }

    // 2. Validate day and slot structure
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    if (!validDays.includes(day)) {
      return res.status(400).json({ error: "Invalid day specified" });
    }

    if (!slot?.start || !slot?.end) {
      return res.status(400).json({ error: "Invalid time slot format" });
    }

    // 3. Find user and verify timetable exists
    const user = await User.findById(userId);
    if (!user || !user.timetable) {
      return res.status(404).json({ error: "User or timetable not found" });
    }

    // 4. Filter out the specified slot
    const initialLength = user.timetable[day]?.length || 0;

    user.timetable[day] = user.timetable[day].filter((s) => {
      const startMatch = s.start.trim() === slot.start.trim();
      const endMatch = s.end.trim() === slot.end.trim();
      const match = startMatch && endMatch;

      console.log(`🟡 Comparing slot:`, s);
      console.log(
        `🔸 Start match: ${startMatch}, End match: ${endMatch}, Overall match: ${match}`
      );

      return !match;
    });

    const newLength = user.timetable[day].length;
    console.log(
      `✅ Initial count: ${initialLength}, After filter: ${newLength}`
    );

    // 5. Verify removal actually occurred
    if (newLength === initialLength) {
      return res.status(404).json({ error: "Specified time slot not found" });
    }

    // 6. Mark as modified and save
    user.markModified("timetable");
    const savedUser = await user.save();

    if (!savedUser) {
      throw new Error("Failed to save user document");
    }

    // 7. Return success response
    res.status(200).json({
      success: true,
      timetable: savedUser.timetable,
      message: "Time slot permanently removed",
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database operation failed",
      details: error.message,
    });
  }
});

export default router;
