import { io } from "socket.io-client";

const socket = io("https://martelli-automotes-back-production.up.railway.app");

export default socket;