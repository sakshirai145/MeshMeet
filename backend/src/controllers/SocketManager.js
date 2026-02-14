import {Server} from "socket.io";


let connectedUsers = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-call", (path) => {
      if (connection[path] === undefined) {
        connection[path] = [];
      }
      connection[path].push(socket.id);
      timeOnline[socket.id] = new Date();
      for(let a=0; a< messages[path].length; ++a){
        io.to(socket.id).emit("chat-message", messages[path][a]['data'],
        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
         const  [matchingRoom, found] = Object.entries(connection)
         
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      delete connectedUsers[socket.id];
      delete messages[socket.id];
      delete timeOnline[connectedUsers[socket.id]];
    });
  });

  return io;
};