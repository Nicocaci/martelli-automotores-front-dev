import { io } from "socket.io-client";
const apiUrlUD = import.meta.env.VITE_API_URL_UPLOADS;  


const socket = io(
                    `${apiUrlUD}`
                );

export default socket;