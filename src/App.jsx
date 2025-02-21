import React from 'react'
import Autos from './components/autos'
import './App.css'
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




const App = () => {
  useEffect(() => {
    // Mostrar el mensaje de alerta con toast
    toast.info( "Bienvenido a AutoAPP\n\n" +
      "• La oferta ganadora deberá ser abonada dentro de los 7 días del cierre de la subasta.\n\n"+
      "• Una vez abonada, se podrá retirar la unidad y las cédulas.\n" +
      "• Al vender el rodado, se deberá enviar fotocopias del DNI del/los futuro/s titular/es.\n\n" +
      "• Si el vehículo no es vendido dentro de los noventa días subastado, se procederá a transferir el mismo al ganador de la subasta.", {
      position: "top-center", // Puedes cambiar la posición
      autoClose: 3000, // Duración en milisegundos
      hideProgressBar: true, // Ocultar barra de progreso
      closeOnClick: true,
      className: "toast-custom"  // Cerrar al hacer click
    });
  }, []);
  return (
    <div className='main'>
    <Autos/>
    <ToastContainer />
    </div>
  )
}

export default App
