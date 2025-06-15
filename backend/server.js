import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http"; // Import Node's http module
import { Server } from "socket.io"; // Import Socket.IO's Server class
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import timetableRoutes from "./routes/timetable.route.js"; // Import the timetable routes

import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize Socket.IO server on the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust as needed)
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for joining a room (for private messaging)
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Listen for sending a message
  socket.on("sendMessage", ({ roomId, message, sender }) => {
    // Broadcast the message to other clients in the room
    socket.to(roomId).emit("receiveMessage", {
      message,
      sender,
      timestamp: Date.now(),
    });
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware setup
app.use(express.json({ limit: "5mb" })); // to parse req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());

console.log(process.env.MONGO_URI);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/timetable", timetableRoutes); // Use the timetable routes
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is ready");
});

// Start the HTTP server (instead of app.listen)
console.log("✅ MONGO_URI from .env:", process.env.MONGO_URI);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  connectMongoDB();
});
