// utils/socket.js
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL);

// const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
//     transports: ['websocket'],         // 👈 force WebSocket
//     withCredentials: true             // 👈 ensures CORS cookies work (if needed)
//   });

export default socket;