import React, { useEffect, useState } from "react";
import axios from "axios";
import PriceInput from "./PriceInput";
import Cronometro from "./navigation/Cronometro";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../css/Autos.css";
import socket from "../utils/Socket.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Subasta = () => {
    const [subasta, setSubasta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSubasta, setActiveSubasta] = useState(null);
    const [highestBids, setHighestBids] = useState({}); // Estado para guardar los precios más altos
    const navigate = useNavigate();

    useEffect(() => {
        const info = localStorage.getItem("info")
        if(!info){
        // Mostrar el mensaje de alerta con toast
        toast.info("Bienvenido a AutoAPP\n\n" +
            "• La oferta ganadora deberá ser abonada dentro de los 7 días del cierre de la subasta.\n\n" +
            "• Una vez abonada, se podrá retirar la unidad y las cédulas.\n" +
            "• Al vender el rodado, se deberá enviar fotocopias del DNI del/los futuro/s titular/es.\n\n" +
            "• Si el vehículo no es vendido dentro de los noventa días subastado, se procederá a transferir el mismo al ganador de la subasta.", {
            position: "top-center", // Puedes cambiar la posición
            autoClose: 100000, // Duración en milisegundos
            hideProgressBar: false, // Ocultar barra de progreso
            closeOnClick: true,
            className: "toast-custom"  // Cerrar al hacer click
        });
        localStorage.setItem("info", "true");
    }
    }, []);
    // Fetch de las subastas
    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get(
                    // "https://martelli-automotes-back-production.up.railway.app/api/subasta"
                    "http://localhost:3000/api/subasta"
                );
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
            const response = await axios.get(
                `https://martelli-automotes-back-production.up.railway.app/api/subasta/${sub._id}`
                //`http://localhost:3000/api/subasta/${sub._id}`
            );
            if (response.data) {
                const { ofertadores, precioInicial } = response.data;
                const highestBid = ofertadores.length > 0
                    ? Math.max(...ofertadores.map((o) => o.monto))
                    : precioInicial;

                // Formatear el número con separadores de miles
                bids[sub._id] = highestBid.toLocaleString('es-AR');
            }
        } catch (error) {
            console.error(`Error al obtener la oferta más alta para la subasta ${sub._id}:`, error);
            bids[sub._id] = sub.precioInicial.toLocaleString('es-AR'); // Formatear el precio inicial
        }
    }

    setHighestBids(bids);
};

    // WebSocket: Escuchar las actualizaciones de subasta
    useEffect(() => {
        socket.on("subastaActualizada", (data) => {
            console.log("subasta actualizada:", data);

            axios.get(
                `https://martelli-automotes-back-production.up.railway.app/api/subasta/${data.subastaId}`
                //`http://localhost:3000/api/subasta/${data.subastaId}`
            )
                .then((response) => {
                    const { ofertadores, precioInicial } = response.data;
                    const maxBid = ofertadores.length > 0
                        ? Math.max(...ofertadores.map((o) => o.monto))
                        : precioInicial;

                    setHighestBids((prevBids) => ({
                        ...prevBids,
                        [data.subastaId]: maxBid.toLocaleString('es-AR'),
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
            <ToastContainer />
            <div className="contenedor">
                {subasta.length > 0 ? (
                    subasta.map((sub) => (
                        <div key={sub._id} className="borde">
                            <h1 className="titulo">{sub.autos?.nombre}</h1>
                            <img src={sub.autos?.img} alt={sub.autos?.nombre} className="img-card" />
                            {/* <h4>{sub.autos?.motor}</h4> */}
                            {/* <h4>{sub.autos?.modelo}</h4> */}
                            {/* <h4>{sub.autos?.ubicacion}</h4> */}
                            <h4 className="font-precio">Precio más alto: ${highestBids[sub._id] || sub.precioInicial}</h4>
                            <Cronometro subastaId={sub._id} />
                            <PriceInput className="price" subastaId={sub._id}/>
                            {/* <Ganador subastaId={sub._id} /> */}
                            {/* <button className="btn-ofertar" onClick={() => toggleModal(sub)}>
                                Ofertar Subasta
                            </button> */}

                            
                        </div>
                    ))
                ) : (
                    <p>No hay autos disponibles.</p>
                )}
            </div>

            {/* Modal */}
            {/* {activeSubasta && (
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
            )} */}
        </div>
    );
};

export default Subasta;
