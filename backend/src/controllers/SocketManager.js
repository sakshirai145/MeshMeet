import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join call / room
    socket.on("join-call", (room) => {
      if (!connections[room]) {
        connections[room] = [];
      }

      connections[room].push(socket.id);
      timeOnline[socket.id] = new Date();

      // Initialize messages array if not exists
      if (!messages[room]) {
        messages[room] = [];
      }

      // Send previous messages to new user
      messages[room].forEach((msg) => {
        io.to(socket.id).emit(
          "chat-message",
          msg.data,
          msg.sender,
          msg.socketIdSender
        );
      });
    });

    // WebRTC signal
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // Chat message
    socket.on("chat-message", (data, sender) => {
      let roomFound = null;

      for (const [room, users] of Object.entries(connections)) {
        if (users.includes(socket.id)) {
          roomFound = room;
          break;
        }
      }

      if (!roomFound) return;

      if (!messages[roomFound]) {
        messages[roomFound] = [];
      }

      messages[roomFound].push({
        sender,
        data,
        socketIdSender: socket.id
      });

      connections[roomFound].forEach((userId) => {
        io.to(userId).emit("chat-message", data, sender, socket.id);
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (const [room, users] of Object.entries(connections)) {
        if (users.includes(socket.id)) {

          connections[room] = users.filter(id => id !== socket.id);

          connections[room].forEach((userId) => {
            io.to(userId).emit("user-left", socket.id);
          });

          if (connections[room].length === 0) {
            delete connections[room];
            delete messages[room];
          }
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};
