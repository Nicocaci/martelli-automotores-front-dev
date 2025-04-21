import React, { useState, useEffect } from 'react';
import Ganador from '../Ganador.jsx';
import Swal from 'sweetalert2';
import Cronometro from './Cronometro.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/CardSubasta.css';
import Slider from 'react-slick';
import '../../css/Autos.css'



const RegistroSubasta = () => {
    const [subastas, setSubastas] = useState([]);
    const [ofertadores, setOfertadores] = useState([]);
    const [subastaSeleccionada, setSubastaSeleccionada] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [modeloTerm, setModeloTerm] = useState("");
    const [ubicacionTerm, setUbicacionTerm] = useState("");
    const [mostrarFinalizadas, setMostrarFinalizadas] = useState("todas"); // opciones: "todas", "finalizadas", "activas"
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImageArray, setSelectedImageArray] = useState([]);



    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get(
                    "https://martelli-automotes-back-production.up.railway.app/api/subasta"
                    //"http://localhost:3000/api/subasta"
                );

                if (Array.isArray(response.data)) {
                    setSubastas(response.data);
                } else {
                    console.error("La API no devolvió un array:", response.data);
                }
            } catch (error) {
                console.error("Error al obtener las subastas:", error);
                // setError("Error al obtener los autos"); // Solo si manejás error
            }
        };

        fetchSubastas();
    }, []);

    const handleDelete = async (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la subasta permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(
                        `https://martelli-automotes-back-production.up.railway.app/api/subasta/${id}`
                        //`http://localhost:3000/api/subasta/${id}`
                    );
                    Swal.fire("¡Eliminado!", "La subasta fue eliminada correctamente", "success");
                    setSubastas(subastas.filter((sub) => sub._id !== id));
                } catch (error) {
                    console.error("Error al eliminar la subasta:", error);
                    Swal.fire("Error", "No se pudo eliminar la subasta", "error");
                }
            }
        });
    };

    const handleShowOfertadores = (subasta) => {
        setSubastaSeleccionada(subasta);
        setOfertadores(subasta.ofertadores || []);
        console.log("Ofertadores de la subasta seleccionada:", subasta.ofertadores);
    };


    const openImageModal = (imgArray) => {
        setSelectedImageArray(imgArray);
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImageArray(null);
        setImageModalOpen(false);
    };

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };


    return (
        <div>

            <div className='box'>
                <h1 className='titulo-admin'>Registro de Subastas</h1>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-busqueda"
                />

                <input
                    type="text"
                    placeholder="Buscar por modelo..."
                    value={modeloTerm}
                    onChange={(e) => setModeloTerm(e.target.value)}
                    className="input-busqueda"
                />

                <input
                    type="text"
                    placeholder="Buscar por ubicación..."
                    value={ubicacionTerm}
                    onChange={(e) => setUbicacionTerm(e.target.value)}
                    className="input-busqueda"
                />

                <select
                    value={mostrarFinalizadas}
                    onChange={(e) => setMostrarFinalizadas(e.target.value)}
                    className="input-busqueda"
                >
                    <option value="todas">Todas</option>
                    <option value="activas">Activas</option>
                    <option value="finalizadas">Finalizadas</option>
                </select>
                <div className='contenedor'>
                    {subastas.length > 0 ? (
                        subastas
                            .filter((sub) => {
                                const nombreMatch = sub.autos?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
                                const modeloMatch = sub.autos?.modelo?.toLowerCase().includes(modeloTerm.toLowerCase());
                                const ubicacionMatch = sub.autos?.ubicacion?.toLowerCase().includes(ubicacionTerm.toLowerCase());

                                const estadoMatch =
                                    mostrarFinalizadas === "todas"
                                        ? true
                                        : mostrarFinalizadas === "finalizadas"
                                            ? sub.finalizada
                                            : !sub.finalizada;

                                return nombreMatch && modeloMatch && ubicacionMatch && estadoMatch;
                            })
                            .map(sub => {
                                const maxOferta = sub.ofertadores.length > 0
                                    ? Math.max(...sub.ofertadores.map(o => o.monto))
                                    : sub.precioInicial;

                                return (
                                    <div key={sub._id} className='borde'>
                                        <h1 className='titulo'>{sub.autos?.nombre}</h1>
                                        <Slider {...sliderSettings}>
                                            {sub.autos?.img?.map((foto, i) => (
                                                <div key={i}>
                                                    <img
                                                        src={
                                                            `https://martelli-automotes-back-production.up.railway.app/uploads/${foto}`
                                                            //`http://localhost:3000/uploads/${foto}`
                                                        }
                                                        alt={`Foto ${i + 1} de ${sub.autos?.nombre}`}
                                                        className="img-card"
                                                        onClick={() => openImageModal(
                                                            sub.autos?.img.map(foto =>
                                                                `https://martelli-automotes-back-production.up.railway.app/uploads/${foto}`
                                                                //`http://localhost:3000/uploads/${foto}`
                                                            )
                                                        )}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </div>
                                            ))}
                                        </Slider>
                                        <h4 className='font-subasta'>Precio Inicial: ${sub.precioInicial.toLocaleString()}</h4>
                                        <h4 className='font-subasta'>Oferta más alta: ${maxOferta.toLocaleString()}</h4>
                                        <Cronometro subastaId={sub._id} />
                                        <Ganador subastaId={sub._id} />
                                        <button onClick={() => handleShowOfertadores(sub)}>Detalles de Subastadores</button>
                                        <button onClick={() => handleDelete(sub._id)}>Eliminar Subasta</button>
                                    </div>
                                );
                            })
                    ) : (
                        <p>No hay autos disponibles.</p>
                    )}
                </div>
            </div>

            {/* Modal de ofertadores */}
            {subastaSeleccionada && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className='font-subasta'>Ofertadores para {subastaSeleccionada.autos.nombre}</h2>
                        {ofertadores.length > 0 ? (
                            <ul>
                                {ofertadores
                                    .sort((a, b) => b.monto - a.monto)
                                    .map((ofertador, index) => {
                                        const agencia = ofertador?.usuario?.agencia || "Desconocido";
                                        return (
                                            <li key={index}>
                                                <strong className='font-subasta'>{agencia}</strong> - ${ofertador.monto.toLocaleString()}
                                            </li>
                                        );
                                    })}
                            </ul>
                        ) : (
                            <p>No hay ofertadores en esta subasta.</p>
                        )}
                        <button onClick={() => setSubastaSeleccionada(null)}>Cerrar</button>
                    </div>
                </div>
            )}

            {imageModalOpen && selectedImageArray.length > 0 && (
                <div className="modal-overlay-imagen" onClick={closeImageModal}>
                    <div className="modal-image-content" onClick={(e) => e.stopPropagation()}>
                        <Slider {...sliderSettings}>
                            {selectedImageArray.map((img, index) => (
                                <div key={index}>
                                    <img src={img} alt={`Imagen ${index + 1}`} className="img-grande" />
                                </div>
                            ))}
                        </Slider>
                        <button className="close-button" onClick={closeImageModal}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistroSubasta;
