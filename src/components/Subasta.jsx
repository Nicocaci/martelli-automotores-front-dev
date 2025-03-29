import React, { useEffect, useState } from "react";
import axios from "axios";
import PriceInput from "./PriceInput";
import Cronometro from "./navigation/Cronometro";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../css/Autos.css";
import socket from "../utils/Socket.js";
import Ganador from "./Ganador.jsx";

const Subasta = () => {
    const [subasta, setSubasta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSubasta, setActiveSubasta] = useState(null);
    const [highestBids, setHighestBids] = useState({}); // Estado para guardar los precios más altos
    const navigate = useNavigate();

    // Fetch de las subastas
    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get("https://martelli-automotes-back-production.up.railway.app/api/subasta");
                if (Array.isArray(response.data)) {
                    setSubasta(response.data);
                    fetchHighestBids(response.data); // Llamar aquí para obtener las ofertas
                } else {
                    console.error("La API no devolvió un array:", response.data);
                    setSubasta([]);
                }
            } catch (error) {
                console.error("Error al obtener los autos:", error);
                setError("Error al obtener los autos");
            } finally {
                setLoading(false);
            }
        };

        fetchSubastas();
    }, []);

    // Obtener las ofertas más altas
    const fetchHighestBids = async (subastas) => {
        const bids = {};
        for (const sub of subastas) {
            try {
                const response = await axios.get(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${sub._id}`);
                if (response.data) {
                    const { ofertadores, precioInicial } = response.data;
                    bids[sub._id] = ofertadores.length > 0
                        ? Math.max(...ofertadores.map((o) => o.monto))
                        : precioInicial;
                }
            } catch (error) {
                console.error(`Error al obtener la oferta más alta para la subasta ${sub._id}:`, error);
                bids[sub._id] = sub.precioInicial; // En caso de error, usa el precio inicial
            }
        }

        setHighestBids(bids);
    };

    // WebSocket: Escuchar las actualizaciones de subasta
    useEffect(() => {
        socket.on("subastaActualizada", (data) => {
            console.log("subasta actualizada:", data);

            axios.get(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${data.subastaId}`)
                .then((response) => {
                    const { ofertadores, precioInicial } = response.data;
                    const maxBid = ofertadores.length > 0
                        ? Math.max(...ofertadores.map((o) => o.monto))
                        : precioInicial;

                    setHighestBids((prevBids) => ({
                        ...prevBids,
                        [data.subastaId]: maxBid,
                    }));
                })
                .catch((error) => {
                    console.error(`Error al actualizar la oferta de subasta ${data.subastaId}:`, error);
                });
        });

        // Cleanup para el socket cuando el componente se desmonte
        return () => {
            socket.off("subastaActualizada");
        };
    }, []); // Solo se ejecuta una vez al montar el componente

    // Verificación de sesión
    useEffect(() => {
        const token = Cookies.get("acces_token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    // Función para abrir/cerrar el modal
    const toggleModal = (subasta) => {
        setActiveSubasta(subasta);
    };

    // Mostrar loading o error
    if (loading) return <p>Cargando autos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="box">
            <div className="contenedor">
                {subasta.length > 0 ? (
                    subasta.map((sub) => (
                        <div key={sub._id} className="borde">
                            <h1 className="text-xl font-bold">{sub.autos?.nombre}</h1>
                            <img src={sub.autos?.img} alt={sub.autos?.nombre} className="img-card" />
                            <h4>{sub.autos?.motor}</h4>
                            <h4>{sub.autos?.modelo}</h4>
                            <h4>{sub.autos?.ubicacion}</h4>
                            <h4>Precio más alto: ${highestBids[sub._id] || sub.precioInicial}</h4>
                            <Cronometro subastaId={sub._id} />
                            {/* <Ganador subastaId={sub._id} /> */}
                            <button className="btn-ofertar" onClick={() => toggleModal(sub)}>
                                Ofertar Subasta
                            </button>

                            <button className="btn-detalle">Ver detalle</button>
                        </div>
                    ))
                ) : (
                    <p>No hay autos disponibles.</p>
                )}
            </div>

            {/* Modal */}
            {activeSubasta && (
                <div className="tu">
                    <div className="wa">
                        <h2 className="text-xl font-bold">Ofertar por {activeSubasta.autos?.nombre}</h2>
                        <h3 className="text-lg">
                            Oferta más alta: ${highestBids[activeSubasta._id] || activeSubasta.precioInicial}
                        </h3>

                        <PriceInput subastaId={activeSubasta._id} />

                        <button className="btn-cerrar" onClick={() => setActiveSubasta(null)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subasta;
