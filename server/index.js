const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const setupDrawingHandlers = require("./socket/drawingHandlers");
const setupEditorHandlers = require("./socket/editorHandlers");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors()); // Allow frontend to connect from a different port (like 3000)

app.get("/create-canvas", (req, res) => {
  const newCanvasId = uuidv4(); // generate a new session ID
  res.json({ canvasId: newCanvasId });
});

const server = http.createServer(app); // Create a raw HTTP server

// load allowed origin from .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(origin => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  // let currentCanvas = null;
  // Debug all events received from this client
  // socket.onAny((event, ...args) => {
  //   console.log(`[Server] Socket ${socket.id} sent event: ${event}`, args);
  // });

  setupDrawingHandlers(socket, io);
  setupEditorHandlers(socket, io);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


const HOST = process.env.ENV === 'local' ? process.env.LOCAL_IP : '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});