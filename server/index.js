const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const setupDrawingHandlers = require("./socket/drawingHandlers");
const setupEditorHandlers = require("./socket/editorHandlers");
const whiteboardRoutes = require('./routes/whiteboardRoutes');
const userRoutes = require("./routes/userRoutes");
const HttpError = require('./models/http_error');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Load allowed origins from .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(origin => origin.trim());

// Middleware: CORS setup for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); // Parse JSON body
app.use(morgan('tiny'));

// Routes
app.use('/api/whiteboard', whiteboardRoutes);
app.use('/api/user', userRoutes);

// Create a raw HTTP server
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  setupDrawingHandlers(socket, io);
  setupEditorHandlers(socket, io);

  socket.on("disconnect", () => {
    console.log("❎ User disconnected:", socket.id);
  });
});

// Catch-all route not found handler
app.use((req, res, next) => {
  const error = new HttpError('Invalid route! Could not find this route.', 404);
  return next(error);
});

// Global error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || 'An unknown error occurred!' });
});

// Start server
const HOST = process.env.ENV === 'local' ? process.env.LOCAL_IP : '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});
