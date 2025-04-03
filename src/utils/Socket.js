import { io } from "socket.io-client";

const socket = io(
                    "https://martelli-automotes-back-production.up.railway.app"
                    //"http://localhost:3000"
                );

export default socket;