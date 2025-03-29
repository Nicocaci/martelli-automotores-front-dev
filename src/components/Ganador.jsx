import React, { useEffect, useState } from 'react';
import socket from "../utils/Socket.js";

const Ganador = ({ subastaId }) => {
    const [ganador, setGanador] = useState(null);

    useEffect(() => {
        socket.on("subastaFinalizada", ({ subastaId: id, ganador }) => {
            console.log("Evento recibido en el frontend:", { id, ganador });
            if (id === subastaId) {
                setGanador(ganador || "Sin ganador");
            }
        });

        return () => {
            socket.off("subastaFinalizada");
        };
    }, [subastaId]);
    
    return (
        <div>
            {ganador ? (
                <p>🏆 ¡Subasta finalizada! Ganador: <strong>{ganador}</strong></p>
            ) : (
                <p>Esperando ganador...</p>
            )}
        </div>
    );
};

export default Ganador;
