import React, { useEffect, useState } from "react";

const ContadorSubasta = ({ fechaFin }) => {
    const calcularTiempoRestante = () => {
        const ahora = new Date().getTime();
        const fin = new Date(fechaFin).getTime();
        const diferencia = fin - ahora;

        if (diferencia <= 0) {
            return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
        }

        return {
            dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
            horas: Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutos: Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)),
            segundos: Math.floor((diferencia % (1000 * 60)) / 1000)
        };
    };

    const [tiempoRestante, setTiempoRestante] = useState(calcularTiempoRestante());

    useEffect(() => {
        const intervalo = setInterval(() => {
            setTiempoRestante(calcularTiempoRestante());
        }, 1000);

        return () => clearInterval(intervalo);
    }, [fechaFin]);

    return (
        <div>
            {tiempoRestante.dias === 0 && tiempoRestante.horas === 0 && tiempoRestante.minutos === 0 && tiempoRestante.segundos === 0 ? (
                <p>⏳ Subasta finalizada</p>
            ) : (
                <p>
                    ⏳ {tiempoRestante.dias}d : {tiempoRestante.horas}h : {tiempoRestante.minutos}m : {tiempoRestante.segundos}s
                </p>
            )}
        </div>
    );
};

export default ContadorSubasta;
