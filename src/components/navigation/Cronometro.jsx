import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cronometro = ({ subastaId }) => {
    const [subasta, setSubasta] = useState(null);
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [tiempoExtra, setTiempoExtra] = useState(null);
    const [subastaFinalizada, setSubastaFinalizada] = useState(false);

    useEffect(() => {
        const fetchSubasta = async () => {
            try {
                const response = await axios.get(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}`);
                const data = response.data;

                setSubasta(data);

                if (response.data.finalizada) {
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
        const ahora = new Date().getTime();
        const fin = new Date(subasta.fechaFin).getTime();
        
        if (ahora >= fin) {
            setTiempoRestante(null);
            setTiempoExtra(60);
            axios.put(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}/activar-tiempo-extra`);
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
                        axios.put(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}/reducir-tiempo-extra`);
                        return null;
                    }
                    axios.put(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}/reducir-tiempo-extra`);
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(intervalo);
        }
    }, [tiempoExtra, subastaId]);
    if(tiempoExtra === 0){
        axios.put(`https://martelli-automotes-back-production.up.railway.app/api/subasta/finalizar/${subastaId}`,{
            finalizada : true
        });
        
    }
    if (subastaFinalizada) {
        return <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "red" }}>¡Subasta Finalizada!</div>;
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
