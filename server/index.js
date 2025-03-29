
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend to connect from a different port (like 3000)

const server = http.createServer(app); // Create a raw HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // React app runs here
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("draw", (data) => {
    // Broadcast drawing data to all *other* clients
    socket.broadcast.emit("draw", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});