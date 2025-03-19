import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [dataUs, setDataUs] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    const token = Cookies.get("acces_token");
    if(!token){
      navigate('/login')
    }
  },[navigate]);

  useEffect(() => {
    const token = Cookies.get("acces_token");
    if (token) {
      const decoded = jwtDecode(token);
      setUsuario(decoded._id);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      const fetchUsuario = async () => {
        try {
          const response = await axios.get(`https://martelli-automotes-back-production.up.railway.app/api/usuarios/${usuario}`);
          setDataUs(response.data); // Aquí guardamos todo el objeto de usuario
        } catch (error) {
          console.error("Error al obtener los usuarios:", error);
        }
      };
      fetchUsuario();
    }
  }, [usuario]);

  return (
    <div>
      <h1>Perfil</h1>
      {dataUs ? (
        <div>
          <p>Nombre: {dataUs.nombre}</p>
          <p>Apellido: {dataUs.apellido}</p>
          <p>Email: {dataUs.email}</p>
          <p>Dirección: {dataUs.direccion}</p>
          <p>Teléfono: {dataUs.telefono}</p>

          {/* Aquí renderizamos las ofertas hechas en tarjetas */}
          {dataUs.ofertasHechas && dataUs.ofertasHechas.length > 0 ? (
            <div className="ofertas-cards">
              {dataUs.ofertasHechas.map((oferta, index) => (
                <div className="card" key={index} style={cardStyle}>
                  {oferta.subasta ? ( // Verifica si la subasta existe
                    <>
                      <img src={oferta.subasta.autos.img} alt={oferta.subasta.autos.nombre} style={imageStyle} />
                      <div className="card-content" style={contentStyle}>
                        <h3>{oferta.subasta.autos.nombre}</h3>
                        <p>Modelo: {oferta.subasta.autos.modelo}</p>
                        <p>Motor: {oferta.subasta.autos.motor}</p>
                        <p>Ubicación: {oferta.subasta.autos.ubicacion}</p>
                        <p><strong>Monto de oferta: ${oferta.monto}</strong></p>
                      </div>
                    </>
                  ) : (
                    <p>Esta oferta no tiene una subasta asociada.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No se han realizado ofertas.</p>
          )}
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  width: '250px',
  margin: '10px',
  padding: '15px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  display: 'inline-block',
  textAlign: 'center',
  backgroundColor: '#fff',
};

const imageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
};

const contentStyle = {
  marginTop: '10px',
};

export default Perfil;
