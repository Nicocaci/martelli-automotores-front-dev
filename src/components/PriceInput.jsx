import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";

const PriceInput = ({ subastaId }) => {
  const [price, setPrice] = useState(0);
  const [highestBid, setHighestBid] = useState(0);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = Cookies.get("acces_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded._id);
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }

    const fetchHighestBid = async () => {
      try {
        const response = await axios.get(
          `https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}`
        );
        if (response.data) {
          const { ofertadores, precioInicial } = response.data;
          const maxBid = ofertadores.length > 0 
            ? Math.max(...ofertadores.map((o) => o.monto)) 
            : precioInicial;
          setHighestBid(maxBid);
          setPrice(maxBid + 10000);
        }
      } catch (error) {
        console.error("Error al obtener la oferta más alta:", error);
      }
    };

    fetchHighestBid();
  }, [subastaId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleIncrease = () => {
    setPrice((prevPrice) => prevPrice + 10000);
  };

  const handleDecrease = () => {
    setPrice((prevPrice) => prevPrice - 10000);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (/^\d*$/.test(newValue)) { 
      setPrice(Number(newValue));
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      setMessage("Error: Usuario no autenticado.");
      return;
    }

    if (price < highestBid) {
      setMessage("Error: Precio menor a la subasta más alta.");
      return;
    }

    try {
      await axios.put(
        `https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}/ofertadores`,
        {
          monto: price,
          usuario: userId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessage("Oferta enviada con éxito.");
      setHighestBid(price);
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
      <p className="text-lg">
        Oferta más alta: <span className="font-bold text-red-600">${highestBid}</span>
      </p>
      <div className="flex items-center gap-2">
        <button onClick={handleDecrease} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 focus:outline-none">-</button>
        <input
          type="text"
          id="price"
          value={price}
          onChange={handleChange}
          placeholder="Escriba un precio"
          className="border-2 border-gray-300 rounded-lg p-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleIncrease} className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 focus:outline-none">+</button>
      </div>
      <p className="text-lg">
        Oferta hecha en: <span className="font-bold text-blue-600">${price}</span>
      </p>
      <div className="flex gap-4">
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Ofertar Subasta</button>
        
      </div>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default PriceInput;
