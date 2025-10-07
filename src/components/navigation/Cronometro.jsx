import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from "../../utils/Socket.js";
const apiUrl = import.meta.env.VITE_API_URL;

const Cronometro = ({ subastaId }) => {
    const [subasta, setSubasta] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [tiempoExtra, setTiempoExtra] = useState(null);
    const [subastaFinalizada, setSubastaFinalizada] = useState(false);

    useEffect(() => {
        // Obtener los datos de la subasta cuando se carga el componente
        const fetchSubasta = async () => {
            try {
                const response = await axios.get(
                    `${apiUrl}/subasta/${subastaId}`
                )
                const data = response.data;
                setSubasta(data);

                if (data.finalizada) {
                    setSubastaFinalizada(true);
                    return;
                }

                if (data.tiempoExtraRestante !== null) {
                    setTiempoExtra(data.tiempoExtraRestante);
                } else {
                    calcularTiempoRestante(data);
                }
            } catch (error) {
                console.error("Error al obtener la subasta: ", error);
            }
        };

        fetchSubasta();
        const intervalo = setInterval(fetchSubasta, 1000); // 🔄 Actualiza la subasta cada segundo

        return () => clearInterval(intervalo);
    }, [subastaId]);

    const calcularTiempoRestante = (subasta) => {
        const ahora = Date.now() - 3 * 60 * 60 * 1000; // Resta 3 horas
        const fin = new Date(subasta.fechaFin).getTime(); // fecha de fin
        const inicio = new Date(subasta.fechaInicio).getTime(); // fecha de inicio

        // Si la subasta todavía no empezó, no muestres el cronómetro
        if (ahora < inicio) {
            setTiempoRestante(null);
            return;
        }

        // Si ya terminó
        if (ahora >= fin) {
            setTiempoRestante(null);
            if (subasta.tiempoExtraRestante === null) {
                axios.put(`${apiUrl}/subasta/${subastaId}/activar-tiempo-extra`);
                setTiempoExtra(60); // Inicia el tiempo extra en 60 segundos
            }
            return;
        }

        const tiempo = fin - ahora;
        const dias = Math.floor(tiempo / (1000 * 60 * 60 * 24));
        const horas = Math.floor((tiempo % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((tiempo % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tiempo % (1000 * 60)) / 1000);

        setTiempoRestante({ dias, horas, minutos, segundos });
    };

    useEffect(() => {
        if (tiempoExtra !== null && tiempoExtra > 0) {
            const intervalo = setInterval(() => {
                setTiempoExtra((prev) => {
                    if (prev === 1) {
                        clearInterval(intervalo);
                        setSubastaFinalizada(true);
                        // Finaliza la subasta después de que el tiempo extra llega a 0
                        axios.put(
                            `${apiUrl}/subasta/${subastaId}/reducir-tiempo-extra`
                        )
                        return null;
                    }
                    axios.put(
                        `${apiUrl}/subasta/${subastaId}/reducir-tiempo-extra`
                    );
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(intervalo);
        }
    }, [tiempoExtra, subastaId]);

    useEffect(() => {
        if (subastaFinalizada) {
            axios.put(
                `${apiUrl}/subasta/finalizar/${subastaId}`
                , {
                    finalizada: true
                });
        }
    }, [subastaFinalizada, subastaId]);

    // Aquí es donde manejas las actualizaciones en tiempo real
    useEffect(() => {
        socket.on("subastaFinalizada", (data) => {
            if (data.subastaId === subastaId) {
                setSubastaFinalizada(true);
            }
        });

        return () => {
            socket.off("subastaFinalizada");
        };
    }, [subastaId]);

    if (subastaFinalizada) {
        return <div className='sub-fin'>¡Subasta Finalizada!</div>;
    }

    return (
        <div>
            {tiempoRestante ? (
                <div>
                    ⏳ {tiempoRestante.dias || 0}d {tiempoRestante.horas || 0}h {tiempoRestante.minutos || 0}m {tiempoRestante.segundos || 0}s
                </div>
            ) : (
                <div style={{ color: "red", fontWeight: "bold" }}>
                    ⏳ Tiempo Extra: {tiempoExtra}s
                </div>
            )}
        </div>
    );
};

export default Cronometro;
