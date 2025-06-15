import mongoose from "mongoose";
import User from "./models/user.model.js"; // adjust path if needed

const deleteAllUsers = async () => {
  try {
    // Replace with your actual old MongoDB connection URI
    const uri =
      "mongodb+srv://ayushdube99347:ayushdatamongo@cluster0.vgf9e.mongodb.net/test?retryWrites=true&w=majority";

    await mongoose.connect(uri);
    console.log("✅ Connected to old MongoDB database");

    const result = await User.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} user(s)`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  } catch (error) {
    console.error("❌ Error deleting users:", error.message);
  }
};

deleteAllUsers();
