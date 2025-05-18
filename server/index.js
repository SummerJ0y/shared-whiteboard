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
.then(() => console.log("Successfully connected to MongoDB, server is running..."))
.catch(err => console.error("MongoDB connection error: ", err));

// Middlewares
app.use(cors()); // Allow frontend to connect from a different port (like 3000)
app.use(express.json()); // Parse JSON body
app.use(morgan('tiny'));


app.use('/api/whiteboard', whiteboardRoutes); // whiteboard routes
app.use('/api/user', userRoutes); // user routes


// Create a raw HTTP server
const server = http.createServer(app); 

// load allowed origin from .env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(origin => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// setup socket.io handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  setupDrawingHandlers(socket, io);
  setupEditorHandlers(socket, io);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// this is not a 'error handling middleware', but its used to catch routes-not-found error
app.use((req, res, next) => {
    const error = new HttpError(
        'Invalid route! Could not find this route', 404
    );
    return next(error);
});

// error handling middleware function that will only be executed
// if any above middleware function yield an error
app.use((error, req, res, next) => {
    if (res.headerSent) {        
        // if the header is sent, then we shouldn't send res anymore
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});
});


// Start server
const HOST = process.env.ENV === 'local' ? process.env.LOCAL_IP : '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});