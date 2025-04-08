const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors()); // Allow frontend to connect from a different port (like 3000)

app.get("/create-canvas", (req, res) => {
  const newCanvasId = uuidv4(); // generate a new session ID
  res.json({ canvasId: newCanvasId });
});

const server = http.createServer(app); // Create a raw HTTP server

const LOCAL_FRONTEND1 = 'http://192.168.4.92:3000';
const LOCAL_FRONTEND2 = 'http://10.0.0.230:3000';

const allowedOrigins = [
  LOCAL_FRONTEND1,
  LOCAL_FRONTEND2,
  'https://shared-whiteboard.vercel.app',
];

// const LOCAL_IP = process.env.LOCAL_IP;

// const allowedOrigins = process.env.ENV === 'local'
//   ? [`http://${LOCAL_IP}:3000`]
//   : ['https://shared-whiteboard.vercel.app', ``,];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  let currentCanvas = null;
  // Debug all events received from this client
  socket.onAny((event, ...args) => {
    // console.log(`[Server] Socket ${socket.id} sent event: ${event}`, args);
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

  socket.on("add-text", (data) => {
    if (currentCanvas) {
      socket.to(currentCanvas).emit("add-text", data);
      console.log(`[Server] add-text from ${socket.id}:`, data);
    }
  });  

  socket.on("update-text", (data) => {
    if (currentCanvas) {
      socket.to(currentCanvas).emit("update-text", data);
      console.log(`[Server] update-text from ${socket.id}:`, data);
    }
  });
  
  socket.on("delete-text", ({ id }) => {
    if (currentCanvas) {
      socket.to(currentCanvas).emit("delete-text", { id });
      console.log(`[Server] delete-text from ${socket.id}:`, id);
    }
  });  

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


const HOST = process.env.ENV === 'local' ? process.env.LOCAL_IP : '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});