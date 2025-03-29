import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../css/FormSubasta.css';
import Cronometro from './navigation/Cronometro.jsx';
import '../css/CardSubasta.css';
import Ganador from './Ganador.jsx';

const PerfilAdmin = () => {
    const [formData, setFormData] = useState({
        autos: {
            nombre: "",
            motor: "",
            modelo: "",
            ubicacion: "",
            img: "",
        },
        precioInicial: "",
        fechaFin: "",
    });
    const [subastas, setSubastas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [ofertadores, setOfertadores] = useState([]); // Estado para almacenar ofertadores
    const [subastaSeleccionada, setSubastaSeleccionada] = useState(null); // Estado para manejar la subasta seleccionada
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("acces_token");
        if (!token) {
            navigate('/login')
        }
    }, [navigate]);

    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get("https://martelli-automotes-back-production.up.railway.app/api/subasta");

                if (Array.isArray(response.data)) {
                    setSubastas(response.data);
                } else {
                    console.error("La API no devolvió un array :", response.data);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in formData.autos) {
            setFormData({
                ...formData,
                autos: { ...formData.autos, [name]: value },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const auctionData = { ...formData, precioInicial: Number(formData.precioInicial), ofertadores: [] };
        try {
            await axios.post("https://martelli-automotes-back-production.up.railway.app/api/subasta", auctionData, {
                headers: { "Content-Type": "application/json" },
            });

            alert("Subasta creada exitosamente");
            setFormData({
                autos: { nombre: "", motor: "", modelo: "", ubicacion: "", img: "" },
                precioInicial: "",
                fechaFin: "",
            });
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un problema al crear la subasta");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta subasta?")) {
            try {
                await axios.delete(`https://martelli-automotes-back-production.up.railway.app/api/subasta/${id}`);
                alert("Subasta eliminada exitosamente");
                setSubastas(subastas.filter(sub => sub._id !== id));
            } catch (error) {
                console.error("Error al eliminar la subasta:", error);
                alert("Hubo un problema al eliminar la subasta");
            }
        }
    };

    const handleShowOfertadores = (subasta) => {
        setSubastaSeleccionada(subasta);
        setOfertadores(subasta.ofertadores); 
        console.log("Ofertadores de la subasta seleccionada:", subasta.ofertadores);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="FormSubasta">
                <h2>Crear Subasta</h2>
                <input type="text" name="nombre" placeholder="Nombre del auto" value={formData.autos.nombre} onChange={handleChange} required />
                <input type="text" name="motor" placeholder="Motor" value={formData.autos.motor} onChange={handleChange} required />
                <input type="text" name="modelo" placeholder="Modelo" value={formData.autos.modelo} onChange={handleChange} required />
                <input type="text" name="ubicacion" placeholder="Ubicación" value={formData.autos.ubicacion} onChange={handleChange} required />
                <input type="text" name="img" placeholder="URL de la imagen" value={formData.autos.img} onChange={handleChange} required />
                <input type="number" name="precioInicial" placeholder="Precio inicial" value={formData.precioInicial} onChange={handleChange} required />
                <input type="datetime-local" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required />
                <button type="submit">Crear Subasta</button>
            </form>
            <div>
                <h1>ELIMINAR SUBASTA</h1>
                <div className='cardContainer'>
                    {subastas?.length > 0 ? (
                        subastas.map(sub => {
                            const maxOferta = sub.ofertadores.length > 0
                                ? Math.max(...sub.ofertadores.map(o => o.monto))
                                : sub.precioInicial;

                            return (
                                <div key={sub._id} className='borde'>
                                    <h1>{sub.autos?.nombre}</h1>
                                    <img src={sub.autos?.img} alt={sub.autos?.nombre} className='img-card' />
                                    <h4>{sub.autos?.motor}</h4>
                                    <h4>{sub.autos?.modelo}</h4>
                                    <h4>{sub.autos?.ubicacion}</h4>
                                    <h4>Precio Inicial en ${sub.precioInicial}</h4>
                                    <h4>Subasta más alta en: ${maxOferta}</h4>
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

            {/* Sección para mostrar los ofertadores */}            
            {subastaSeleccionada && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Ofertadores para {subastaSeleccionada.autos.nombre}</h2>
                        {ofertadores.length > 0 ? (
                            <ul>
                                {/* Ordenamos los ofertadores de mayor a menor por monto */}
                                
                                {ofertadores
                                    .sort((a, b) => b.monto - a.monto) // Ordenar de mayor a menor
                                    .map((ofertador, index) => (
                                        <li key={index}>
                                            <strong>{ofertador.usuario.agencia}</strong> - ${ofertador.monto}
                                        </li>
                                    ))}
                                    
                            </ul>
                        ) : (
                            <p>No hay ofertadores en esta subasta.</p>
                        )}
                        <button onClick={() => setSubastaSeleccionada(null)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PerfilAdmin;