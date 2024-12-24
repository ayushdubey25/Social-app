import User from "../models/user.model.js";
import { generateTokenAndSetCookies } from "../lib/utils/generateToken.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;
    console.log("Request Body:", req.body);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    // hash password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newuser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    if (newuser) {
      generateTokenAndSetCookies(newuser._id, res);
      await newuser.save();
      res.status(201).json({
        _id: newuser._id,
        fullname: newuser.fullname,
        username: newuser.username,
        email: newuser.email,
        followers: newuser.follower,
        following: newuser.following,
        profileImg: newuser.profileImg,
        coverImg: newuser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookies(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      follower: user.follower,
      following: user.following,
      profileImg: user.profileImg,
      coverImgg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
