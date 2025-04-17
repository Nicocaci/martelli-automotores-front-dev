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
import Slider from "react-slick";

const Subasta = () => {
    const [subasta, setSubasta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSubasta, setActiveSubasta] = useState(null);
    const [highestBids, setHighestBids] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const cartel = localStorage.getItem("cartel");

        if (!cartel) {
            toast.info(
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '10px' }}>Bienvenidos</h3>
                    <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: '400px' }}>
                        <li>Deberá ser abonada dentro de los 7 días la oferta ganadora para poder retirar la unidad.</li>
                        <li>Si el vehículo no se ha vendido dentro de los 90 días de retirado, se procederá a transferir el vehículo al ganador de la subasta.</li>
                        <li>En caso de venderse dentro de los 90 días, se deberá enviar fotocopias del DNI del/los futuro/s titular/es.</li>
                    </ul>
                    <p style={{ marginTop: '10px' }}><strong>Atte: AutoSmart</strong></p>
                </div>,
                {
                    position: "top-center",
                    autoClose: 100000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    className: "toast-custom",
                    closeButton: true,
                }
            );
            localStorage.setItem("cartel", "true");
        }
    }, []);
    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get(
                    "https://martelli-automotes-back-production.up.railway.app/api/subasta"
                    //"http://localhost:3000/api/subasta"
                );
                if (Array.isArray(response.data)) {
                    setSubasta(response.data);
                    fetchHighestBids(response.data);
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
                    bids[sub._id] = highestBid.toLocaleString('es-AR');
                }
            } catch (error) {
                console.error(`Error al obtener la oferta más alta para la subasta ${sub._id}:`, error);
                bids[sub._id] = sub.precioInicial.toLocaleString('es-AR');
            }
        }
        setHighestBids(bids);
    };

    useEffect(() => {
        socket.on("subastaActualizada", (data) => {
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

        return () => {
            socket.off("subastaActualizada");
        };
    }, []);

    useEffect(() => {
        const token = Cookies.get("acces_token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    // Función para abrir el modal con los detalles de la subasta
    const openModal = async (subastaId) => {
        try {
            const response = await axios.get(
                `https://martelli-automotes-back-production.up.railway.app/api/subasta/${subastaId}`
                //`http://localhost:3000/api/subasta/${subastaId}`
            );
            setModalData(response.data);
            setModalOpen(true);
        } catch (error) {
            console.error("Error al obtener detalles de la subasta:", error);
        }
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setModalOpen(false);
        setModalData(null);
    };

    if (loading) return <p>Cargando autos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="box">
            <ToastContainer />
            <input
                type="text"
                placeholder="Buscar auto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-busqueda"
            />
            <div className="contenedor">
                {subasta.length > 0 ? (
                    subasta
                        .filter((sub) =>
                            !sub.finalizada &&
                            sub.autos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((sub) => (
                            <div key={sub._id} className="borde">
                                <h1 className="titulo">{sub.autos?.nombre}</h1>
                                <Slider dots={true} infinite={true} speed={500} slidesToShow={1} slidesToScroll={1}>
                                    {sub.autos?.img?.map((foto, i) => (
                                        <div key={i}>
                                            <img
                                                src={
                                                    `https://martelli-automotes-back-production.up.railway.app/uploads/${foto}`    
                                                    //`http://localhost:3000/uploads/${foto}`
                                                }
                                                alt={`Foto ${i + 1} de ${sub.autos?.nombre}`}
                                                className="img-card"
                                            />
                                        </div>
                                    ))}
                                </Slider>
                                <h4 className="font-precio">Precio más alto: ${highestBids[sub._id] || sub.precioInicial}</h4>
                                <Cronometro subastaId={sub._id} />
                                <PriceInput className="price" subastaId={sub._id} />
                                <button className="button" onClick={() => openModal(sub._id)}>Ver detalle</button>
                            </div>
                        ))
                ) : (
                    <p>No hay autos disponibles.</p>
                )}
            </div>

            {/* MODAL */}
            {modalOpen && modalData && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="titulo">{modalData.autos?.nombre}</h2>
                        <p className="font-subasta"><strong>Modelo:</strong> {modalData.autos?.modelo}</p>
                        <p className="font-subasta"><strong>Motor:</strong> {modalData.autos?.motor}</p>
                        <p className="font-subasta"><strong>Ubicación:</strong> {modalData.autos?.ubicacion}</p>
                        <p className="font-subasta"><strong>Descripcion:</strong> {modalData.autos?.descripcion}</p>
                        <button className="close-button" onClick={closeModal}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subasta;
