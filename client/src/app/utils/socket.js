// utils/socket.js
import { io } from "socket.io-client";

const socket = io(`http://${process.env.NEXT_PUBLIC_LOCAL_IP}:5001`);

export default socket;