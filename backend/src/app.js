import express from "express";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { initSocket } from "./SocketManager.js";
import userRouter from "./routes/Users.route.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/v1/users", userRouter);

// Initialize Socket.IO
initSocket(httpServer);

// MongoDB Connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 8000;

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server start error:", error);
  }
};

startServer();
