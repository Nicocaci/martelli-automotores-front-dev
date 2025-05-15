import React, { useState, useEffect } from 'react';
import Ganador from '../Ganador.jsx';
import Swal from 'sweetalert2';
import Cronometro from './Cronometro.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/CardSubasta.css';
import Slider from 'react-slick';
import '../../css/Autos.css';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
const apiUrl = import.meta.env.VITE_API_URL;
const apiUrlUD = import.meta.env.VITE_API_URL_UPLOADS;



const RegistroSubasta = () => {
    const [subastas, setSubastas] = useState([]);
    const [ofertadores, setOfertadores] = useState([]);
    const [subastaSeleccionada, setSubastaSeleccionada] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [modeloTerm, setModeloTerm] = useState("");
    const [ubicacionTerm, setUbicacionTerm] = useState("");
    const [mostrarFinalizadas, setMostrarFinalizadas] = useState("activas"); // opciones: "todas", "finalizadas", "activas"
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImageArray, setSelectedImageArray] = useState([]);
    const [subastaEditando, setSubastaEditando] = useState(null);
    const [fullImage, setFullImage] = useState(null);
    const [formEditData, setFormEditData] = useState({
        nombre: '',
        modelo: '',
        motor: '',
        kilometros: "",
        ubicacion: '',
        descripcion: '',
        precioInicial: '',
        fechaFin: '',
    });




    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get(
                    `${apiUrl}/subasta`
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
                        `${apiUrl}/subasta/${id}`
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

    const handleEditClick = (subasta) => {
        if (subasta.finalizada) {
            Swal.fire("Subasta finalizada", "No se puede editar una subasta ya finalizada.", "warning");
            return;
        }
        setSubastaEditando(subasta);
        setFormEditData({
            nombre: subasta.autos.nombre,
            motor: subasta.autos.motor,
            modelo: subasta.autos.modelo,
            kilometros: subasta.autos.kilometros,
            ubicacion: subasta.autos.ubicacion,
            descripcion: subasta.autos.descripcion,
            precioInicial: subasta.precioInicial,
            fechaFin: subasta.fechaFin.slice(0, 16), // Para input type="datetime-local"
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            const updatedData = {
                autos: {
                    nombre: formEditData.nombre,
                    motor: formEditData.motor,
                    modelo: formEditData.modelo,
                    kilometros: formEditData.kilometros,
                    ubicacion: formEditData.ubicacion,
                    descripcion: formEditData.descripcion,
                    img: subastaEditando.autos.img
                },
                precioInicial: parseFloat(formEditData.precioInicial),
                fechaFin: new Date(formEditData.fechaFin)
            };

            await axios.put(`${apiUrl}/subasta/${subastaEditando._id}`, updatedData);

            setSubastas(prev =>
                prev.map(s => s._id === subastaEditando._id ? { ...s, ...updatedData } : s)
            );

            setSubastaEditando(null);
            Swal.fire("Actualizado", "La subasta se editó correctamente", "success");
        } catch (error) {
            console.error("Error al actualizar la subasta:", error);
            Swal.fire("Error", "No se pudo actualizar la subasta", "error");
        }
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
                                        <Slider {...sliderSettings}>
                                            {sub.autos?.img?.map((foto, i) => (
                                                <div key={i}>
                                                    <img
                                                        src={
                                                            //`${apiUrlUP}/uploads/${foto}`
                                                            `${apiUrlUD}/uploads/${foto}`
                                                        }
                                                        alt={`Foto ${i + 1} de ${sub.autos?.nombre}`}
                                                        className="img-card"
                                                        onClick={() => openImageModal(
                                                            sub.autos?.img.map(foto =>
                                                                `${apiUrlUD}/uploads/${foto}`
                                                            )
                                                        )}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </div>
                                            ))}
                                        </Slider>
                                        <h1 className='titulo'>{sub.autos?.nombre}</h1>
                                        <h4 className='font-subasta'>Precio Inicial: ${sub.precioInicial.toLocaleString()}</h4>
                                        <h4 className='font-subasta'>Oferta más alta: ${maxOferta.toLocaleString()}</h4>
                                        <Cronometro subastaId={sub._id} />
                                        <Ganador subastaId={sub._id} />
                                        <div className='botones-registro'>
                                            <button className='botones-registro-subastadores' onClick={() => handleShowOfertadores(sub)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
                                                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z" />
                                                </svg>
                                            </button>
                                            <button className='botones-registro-eliminar' onClick={() => handleDelete(sub._id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                </svg>
                                            </button>
                                            <button className='botones-registro-editar' onClick={() => handleEditClick(sub)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                                </svg>
                                            </button>
                                        </div>
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
                <div className="modal-overlay" onClick={closeImageModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="boton-cerrar" onClick={closeImageModal}>X</button>

                        {/* Galería de miniaturas */}
                        <div className="image-gallery">
                            {selectedImageArray.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`Thumbnail ${i + 1}`}
                                    className="thumbnail"
                                    onClick={() => setFullImage(src)}
                                />
                            ))}
                        </div>

                        {/* Imagen ampliada con zoom */}
                        {fullImage && (
                            <div className="fullscreen-image" onClick={() => setFullImage(null)}>
                                <Zoom>
                                    <img src={fullImage} alt="Vista completa" className="img-grande" />
                                </Zoom>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {subastaEditando && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className='font-subasta'>Editar Subasta</h2>
                        <input name="nombre" value={formEditData.nombre} onChange={handleInputChange} placeholder="Nombre" />
                        <input name="motor" value={formEditData.motor} onChange={handleInputChange} placeholder="Motor" />
                        <input name="modelo" value={formEditData.modelo} onChange={handleInputChange} placeholder="Modelo" />
                        <input name="kilometros" value={formEditData.kilometros} onChange={handleInputChange} placeholder="kilometross" />
                        <input name="ubicacion" value={formEditData.ubicacion} onChange={handleInputChange} placeholder="Ubicación" />
                        <textarea name="descripcion" value={formEditData.descripcion} onChange={handleInputChange} placeholder="Descripción" />
                        <input name="precioInicial" type="number" value={formEditData.precioInicial} onChange={handleInputChange} placeholder="Precio Inicial" />
                        <input name="fechaFin" type="datetime-local" value={formEditData.fechaFin} onChange={handleInputChange} />
                        <div className="usuario-buttons">
                            <button className="btn-aprobar" onClick={handleSaveEdit}>Guardar</button>
                            <button className="btn-eliminar" onClick={() => setSubastaEditando(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistroSubasta;
