import { Server } from "socket.io";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("join-call", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    // WebRTC Signaling
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // Chat messages
    socket.on("chat-message", (message, username) => {
      io.emit("chat-message", message, username, socket.id);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
