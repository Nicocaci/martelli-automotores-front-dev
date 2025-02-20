import React from 'react';
import { useEffect, useState } from 'react';

const CuentaRegresiva = ({ finSubasta }) => {
  const [tiempoRestante, setTiempoRestante] = useState({});

  useEffect(() => {
    const calcularTiempoRestante = () => {
      const ahora = new Date();
      const tiempo = new Date(finSubasta) - ahora;

      if (tiempo <= 0) {
        setTiempoRestante({ finalizado: true });
        return;
      }
      const dias = Math.floor(tiempo / (1000 * 60 * 60 * 24));
      const horas = Math.floor((tiempo % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((tiempo % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((tiempo % (1000 * 60)) / 1000);

      setTiempoRestante({ dias, horas, minutos, segundos });
    };
    const intervalo = setInterval(calcularTiempoRestante, 1000);
    return () => clearInterval(intervalo);
  }, [finSubasta]);

  if (tiempoRestante.finalizado) {
    return <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>¡Subasta finalizada!</div>;
  }
  return (
    <div>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        {tiempoRestante.dias || 0}d {tiempoRestante.horas || 0}h {tiempoRestante.minutos || 0}m{" "}
        {tiempoRestante.segundos || 0}s
      </div>
    </div>
  )
}

export default CuentaRegresiva
