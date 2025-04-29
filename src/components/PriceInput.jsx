import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import axios from "axios";
import socket from "../utils/Socket";
import "../css/Autos.css";
const apiUrl = import.meta.env.VITE_API_URL;

const PriceInput = ({ subastaId }) => {
  const [price, setPrice] = useState(10000);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

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
          `${apiUrl}/subasta/${subastaId}`)
          ;
        if (response.data) {
          const { ofertadores, precioInicial, finalizada } = response.data;
          setIsFinished(finalizada); 
          if (ofertadores.length > 0) {
            const highestOffer = ofertadores.reduce((max, o) => (o.monto > max.monto ? o : max), ofertadores[0]);
            setHighestBid(highestOffer.monto);
            setHighestBidder(highestOffer.usuario);

          } else {
            setHighestBid(precioInicial);
            setHighestBidder(null);

          }
        }
      } catch (error) {
        console.error("Error al obtener la oferta más alta:", error);
      }
    };

    fetchHighestBid();

    const handleSubastaActualizada = (data) => {
      if (data.subastaId === subastaId) {
        if (data.highestBid) setHighestBid(data.highestBid);
        if (data.highestBidder) setHighestBidder(data.highestBidder);
        if (typeof data.finalizada !== "undefined") setIsFinished(data.finalizada);
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
      setMessage("❌ Usuario no autenticado.");
      return;
    }

    try {
      const res = await axios.get(`${apiUrl}/subasta/${subastaId}`);
      if (res.data.finalizada) {
        setIsFinished(true);
        setMessage("⚠️ La Subasta ya finalizó");
        return;
      }
    } catch (err) {
      console.error("Error verificando si la subasta finalizó:", err);
      setMessage("❌ Error al verificar el estado de la subasta.");
      return;
    }


    if (price <= 0) {
      setMessage("⚠️ Debés ingresar un monto $$");
      return;
    }

    const newOffer = highestBid + price;

    if (newOffer === highestBid) {
      setMessage("⚠️ La oferta debe ser mayor al monto actual.");
      return;
    }
    if (highestBidder && userId === highestBidder._id) {
      setMessage("❌ Ya sos el ofertante más alto.");
      return;
    }


    try {
      await axios.put(
        `${apiUrl}/subasta/${subastaId}/ofertadores`,
        { monto: newOffer, usuario: userId },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(" ✅ Oferta enviada con éxito.");
      setPrice(10000); // resetea el input después de ofertar
    } catch (error) {
      console.error("Error al ofertar:", error);
      setMessage("❌ Error al enviar la oferta.");
    }
  };

  const formatPrice = (value) => value.toLocaleString('es-AR');

  return (
    <div className="font-precio">
      <p className="font-subasta">
        {userId && highestBidder && userId === highestBidder._id ? (
          <>
            <span className="oferta-mas-alta">🏆¡Tu oferta es la más alta!🏆</span><br />
            Precio: <span className="font-subasta">${formatPrice(highestBid)}</span>
          </>
        ) : (
          <>Precio: <span className="font-subasta">${formatPrice(highestBid)}</span></>
        )}
      </p>
      <div className="input-price">
        <button onClick={handleDecrease} className="boton-mas">-</button>
        <input
          type="text"
          id="price"
          value={price > 0 ? formatPrice(price) : ""}
          onChange={handleChange}
          placeholder="$ Escriba un precio"
          className="font-subasta"
          onFocus={(e) => e.target.select()} // Para que seleccione todo el texto al hacer clic
        />
        <button onClick={handleIncrease} className="boton-mas">+</button>
      </div>
      <p className="font-subasta">
        Ofertar en: <span className="font-bold text-blue-600">${formatPrice(highestBid + price)}</span>
      </p>
      <div className="flex gap-4">
        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">OFERTAR</button>
      </div>
      {message && <p className="font-subasta">{message}</p>}
    </div>
  );
};

export default PriceInput;