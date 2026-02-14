import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/SocketManager.js";
import userRouter from "./routes/Users.route.js";

const app = express();
const httpServer = createServer(app);
connectToSocket(httpServer);

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRouter);

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 8000;

    const connectionDb = await mongoose.connect(
      "mongodb+srv://raisakshi643_db_user:ZkNfctDCQw5S7foU@cluster0.f94bwax.mongodb.net/?appName=Cluster0"
    );

    console.log(`MongoDB Connected: ${connectionDb.connection.host}`);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
