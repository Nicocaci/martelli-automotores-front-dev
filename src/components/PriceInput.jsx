import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";
import socket from "../utils/Socket";
import "../css/Autos.css";

const PriceInput = ({ subastaId }) => {
  const [price, setPrice] = useState(0);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
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
          `https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}`)
          //`http://localhost:3000/api/subasta/${subastaId}`)
          ;
        if (response.data) {
          const { ofertadores, precioInicial } = response.data;
    
          if (ofertadores.length > 0) {
            const highestOffer = ofertadores.reduce((max, o) => (o.monto > max.monto ? o : max), ofertadores[0]);
            setHighestBid(highestOffer.monto);
            setHighestBidder(highestOffer.usuario);
            setPrice(highestOffer.monto + 10000);
          } else {
            setHighestBid(precioInicial);
            setHighestBidder(null);
            setPrice(precioInicial + 10000);
          }
        }
      } catch (error) {
        console.error("Error al obtener la oferta más alta:", error);
      }
    };
    
    fetchHighestBid();

    const handleSubastaActualizada = (data) => {
      if (data.subastaId === subastaId && data.highestBid && data.highestBidder) {
        setHighestBid(data.highestBid);
        setHighestBidder(data.highestBidder);
      }
    };

    socket.on("subastaActualizada", handleSubastaActualizada);

    return () => {
      socket.off("subastaActualizada", handleSubastaActualizada);
    };
  }, [subastaId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleIncrease = () => setPrice((prev) => prev + 10000);
  const handleDecrease = () => setPrice((prev) => Math.max(0, prev - 10000));

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    setPrice(rawValue ? Number(rawValue) : 0);
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
        //`http://localhost:3000/api/subasta/${subastaId}/ofertadores`,
        { monto: price, usuario: userId },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("Oferta enviada con éxito.");
    } catch (error) {
      console.error("Error al ofertar:", error);
      setMessage("Error al enviar la oferta.");
    }
  };

  const formatPrice = (value) => value.toLocaleString('es-AR');

  return (
    <div className="price">
      <label htmlFor="price" className="text-lg font-semibold">
        Ofertar subasta:
      </label>
      <p className="text-lg">
        {userId && highestBidder && userId === highestBidder._id ? (
          <span className="font-bold text-green-600">¡Tu subasta es la más alta!</span>
        ) : (
          <>Oferta más alta: <span className="font-bold text-red-600">${formatPrice(highestBid)}</span></>
        )}
      </p>
      <div className="input-price">
        <button onClick={handleDecrease} className="boton-mas">-</button>
        <input
          type="text"
          id="price"
          value={price > 0 ? formatPrice(price) : ""}
          onChange={handleChange}
          placeholder="Escriba un precio"
          className="border-2 border-gray-300 rounded-lg p-2 w-32 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onFocus={(e) => e.target.select()} // Para que seleccione todo el texto al hacer clic
        />
        <button onClick={handleIncrease} className="boton-mas">+</button>
      </div>
      <p className="text-lg">
        Ofertar en: <span className="font-bold text-blue-600">${formatPrice(price)}</span>
      </p>
      <div className="flex gap-4">
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Ofertar Subasta</button>
      </div>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
      <button className="btn-detalle">Ver detalle</button>
    </div>
  );
};

export default PriceInput;