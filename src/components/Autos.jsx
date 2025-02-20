import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import '../css/Autos.css';
import CuentaRegresiva from './CuentaRegresiva';
import PriceInput from './PriceInput';

const Autos = () => {
    const [cars,setCars] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(false);

    useEffect(() =>{
        const fetchCars = async () =>{
            try {
                const response = await axios.get("http://localhost:8080/api/cars");
                console.log(response.data);
                setCars(response.data.payload);
                setLoading(false);
            } catch (error) {
                setError("Error al obtener los autos");
                setLoading(false);
            }
        };
        fetchCars();
    }, []);
    if(loading) return <p>Cargando autos...</p>
    if(error) return <p>{error}</p>
    return (
    <div className="cardContainer">
      {cars.map(car=>(
        <div key={car.id} className="borde">
            <h1 className="text-xl font-bold">{car.name}</h1>
            <img src={car.img} alt={car.name} className='img-card' />
            <h4>{car.motor}</h4>
            <h4>{car.model}</h4>
            <h4>{car.ubicacion}</h4>
            <CuentaRegresiva finSubasta="2025-02-20T17:00:00"/>
            <PriceInput/>
            <button>Ver detalle</button>
        </div>
      ))}
    </div>
  ) 
}

export default Autos
