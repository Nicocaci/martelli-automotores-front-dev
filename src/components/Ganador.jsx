import React, { useEffect, useState } from 'react';
import socket from "../utils/Socket.js";

const Ganador = ({ subastaId }) => {
    const [ganador, setGanador] = useState(null);

    useEffect(() => {
        const handleSubastaFinalizada = ({ subastaId: id, ganador }) => {
            console.log("Evento recibido en el frontend:", { id, ganador });
            if (id === subastaId) {
                setGanador(ganador || "Sin ganador");
            }
        };

        // Asegurarse de limpiar eventos previos
        socket.off("subastaFinalizada", handleSubastaFinalizada);
        socket.on("subastaFinalizada", handleSubastaFinalizada);

        return () => {
            socket.off("subastaFinalizada", handleSubastaFinalizada);
        };
    }, [subastaId]);

    return (
        <div>
            {ganador ? (
                <p className='font-subastas'>🏆 ¡Subasta finalizada! Ganador: <strong>{ganador}</strong></p>
            ) : (
                <p className='font-subasta'>Esperando ganador...</p>
            )}
        </div>
    );
};

export default Ganador;
