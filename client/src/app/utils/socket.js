// utils/socket.js
import { io } from "socket.io-client";

// Only connect once (on first import)
// const socket = io("http://localhost:5001");
const socket = io("http://10.0.0.230:5001")

export default socket;