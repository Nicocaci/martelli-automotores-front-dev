import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PriceInput from './PriceInput';
import CuentaRegresiva from './CuentaRegresiva';
import '../css/CardSubasta.css'
import Cronometro from './navigation/Cronometro';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Subasta = () => {
    const [subasta, setSubasta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubastas = async () => {
            try {
                const response = await axios.get("https://martelli-automotes-back-production.up.railway.app/api/subasta");

                // Si response.data ya es un array, lo asignamos
                if (Array.isArray(response.data)) {
                    setSubasta(response.data);
                } else {
                    console.error("La API no devolvió un array:", response.data);
                    setSubasta([]); // Evitamos undefined
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
        console.log("Token desde cookie:", token);
        if (!token) {
            navigate('/login')
        }
    }, [navigate]);

    if (loading) return <p>Cargando autos...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className='cardContainer'>
            {subasta?.length > 0 ? (
                subasta.map(sub => {
                    const maxOferta = sub.ofertadores.length > 0
                        ? Math.max(...sub.ofertadores.map(o => o.monto))
                        : sub.precioInicial;
    
                    return ( // ← ¡Asegúrate de devolver el div aquí!
                        <div key={sub.autos?.id || Math.random()} className='borde'>
                            <h1 className='text-xl font-bold'>{sub.autos?.nombre}</h1>
                            <img src={sub.autos?.img} alt={sub.autos?.nombre} className='img-card' />
                            <h4>{sub.autos?.motor}</h4>
                            <h4>{sub.autos?.modelo}</h4>
                            <h4>{sub.autos?.ubicacion}</h4>
                            <h4>Precio inicial en ${sub.precioInicial}</h4>
                            <h4>Subasta Más Alta en: ${maxOferta}</h4>
                            <Cronometro subastaId={sub._id} />
                            <PriceInput subastaId={sub._id} />
                        </div>
                    );
                })
            ) : (
                <p>No hay autos disponibles.</p>
            )}
        </div>
    );
}

export default Subasta;
