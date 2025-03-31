
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend to connect from a different port (like 3000)

const server = http.createServer(app); // Create a raw HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://10.0.0.230:3000"],// React app runs here
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  let currentCanvas = null;
  // Debug all events received from this client
  socket.onAny((event, ...args) => {
    console.log(`[Server] Socket ${socket.id} sent event: ${event}`, args);
  });

  socket.on("join-canvas", (canvasId) => {
    // if already in a canvas room, leave it first to avoid being in multiple rooms
    // can be changed later for more advanced features.
    if (currentCanvas) {
      socket.leave(currentCanvas);
    }
    socket.join(canvasId);
    currentCanvas = canvasId;
    console.log(`Socket ${socket.id} joined canvas ${canvasId}`);
  });

  socket.on("draw", (data) => {
    if (currentCanvas) {
      // Send to all others in the same canvas
      socket.to(currentCanvas).emit("draw", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5001, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5001");
});