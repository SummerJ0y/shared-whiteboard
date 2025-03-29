// utils/socket.js
import { io } from "socket.io-client";

// Only connect once (on first import)
const socket = io("http://localhost:3001");

export default socket;