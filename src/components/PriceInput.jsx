import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const PriceInput = ({ subastaId }) => {
  const [price, setPrice] = useState(0); // Estado inicial del precio
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null); // Estado para almacenar el userId

  useEffect(() => {
    // Obtener el token de la cookie
    const token = Cookies.get("acces_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded._id); // Seteamos el userId
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []); // Solo se ejecuta una vez al cargar el componente

  const handleIncrease = () => {
    setPrice((prevPrice) => prevPrice + 10000); // Incrementa en 10,000
  };

  const handleDecrease = () => {
    setPrice((prevPrice) => (prevPrice >= 10000 ? prevPrice - 10000 : 0)); // Decrementa en 10,000 pero no baja de 0
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isNaN(newValue)) {
      setPrice(Number(newValue)); // Actualiza el precio directamente desde el input
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      setMessage("Error: Usuario no autenticado.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/subasta/${subastaId}/ofertadores`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monto: price,
          usuario: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      setMessage("Oferta enviada con éxito.");
    } catch (error) {
      console.error("Error al ofertar:", error);
      setMessage("Error al enviar la oferta.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <label htmlFor="price" className="text-lg font-semibold">
        Ofertar subasta:
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 focus:outline-none"
        >
          -
        </button>
        <input
          type="text"
          id="price"
          value={price}
          onChange={handleChange}
          placeholder="Escriba un precio"
          className="border-2 border-gray-300 rounded-lg p-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleIncrease}
          className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
        >
          +
        </button>
      </div>
      <p className="text-lg">
        Oferta hecha en: <span className="font-bold text-blue-600">${price}</span>
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Ofertar Subasta
        </button>
        <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
          Ver detalle
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default PriceInput;