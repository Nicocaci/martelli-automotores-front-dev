import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PriceInput from './PriceInput';
import Cronometro from './navigation/Cronometro';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../css/Autos.css';

const Subasta = () => {
    const [subasta, setSubasta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSubasta, setActiveSubasta] = useState(null); // Estado para el modal
    const [loadingBid, setLoadingBid] = useState(false); // Estado para mostrar carga en oferta
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/subasta");

                if (Array.isArray(response.data)) {
                    setSubasta(response.data);
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

    useEffect(() => {
        const token = Cookies.get("acces_token");
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Función para abrir/cerrar el modal
    const toggleModal = (subasta) => {
        setActiveSubasta(subasta);
    };

    if (loading) return <p>Cargando autos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='box'>
            <div className='contenedor'>
                {subasta.length > 0 ? (
                    subasta.map((sub) => (
                        <div key={sub._id} className='borde'>
                            <h1 className='text-xl font-bold'>{sub.autos?.nombre}</h1>
                            <img src={sub.autos?.img} alt={sub.autos?.nombre} className='img-card' />
                            <h4>{sub.autos?.motor}</h4>
                            <h4>{sub.autos?.modelo}</h4>
                            <h4>{sub.autos?.ubicacion}</h4>
                            <h4>Precio inicial en ${sub.precioInicial}</h4>
                            <Cronometro subastaId={sub._id} />

                            {/* Botón para abrir el modal */}
                            <button 
                                className="btn-ofertar"
                                onClick={() => toggleModal(sub)}
                            >
                                Ofertar Subasta
                            </button>

                            <button className="btn-detalle">
                                Ver detalle
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No hay autos disponibles.</p>
                )}
            </div>

            {/* MODAL */}
            {activeSubasta && (
                <div className="tu">
                    <div className="wa">
                        <h2 className="text-xl font-bold">Ofertar por {activeSubasta.autos?.nombre}</h2>
                        <h3 className="text-lg">Oferta más alta: ${activeSubasta.ofertaMaxima || activeSubasta.precioInicial}</h3>
                        
                        <PriceInput subastaId={activeSubasta._id} />

                        <button 
                            className="btn-cerrar"
                            onClick={() => setActiveSubasta(null)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subasta;
