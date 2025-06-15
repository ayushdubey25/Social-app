import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getUserProfile,
  getSuggestedUsers,
  updateUser,
} from "../controllers/user.controller.js";
import User from "../models/user.model.js";
const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

// In your users.routes.js
router.post("/follow/:userId", protectRoute, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Can't follow yourself
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userId);
      userToFollow.follower.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.follower.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
      isFollowing: !isFollowing, // The new following status
      user: {
        _id: userToFollow._id,
        follower: updatedData.follower || old.follower,
        followerCount: updatedData.follower?.length || old.followerCount || 0,
      },
      currentUser: {
        _id: currentUser._id,
        following: currentUser.following,
        followingCount: currentUser.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's follower
router.get("/:userId/follower", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("follower", "username fullname profileImg")
      .select("follower");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.follower || []);
  } catch (error) {
    console.error("Error fetching follower:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's following
router.get("/:userId/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("following", "username fullname profileImg")
      .select("following");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.following || []);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
