import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [dataUs, setDataUs] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("acces_token");
    if (!token) {
      navigate('/login');
    } else {
      const decoded = jwtDecode(token);
      setUsuario(decoded._id);
    }
  }, [navigate]);

  useEffect(() => {
    if (usuario) {
      const fetchUsuario = async () => {
        try {
          const response = await axios.get(
            `https://martelli-automotes-back-production.up.railway.app/api/usuarios/${usuario}`
            //`http://localhost:3000/api/usuarios/${usuario}`
          );
          setDataUs(response.data);
        } catch (error) {
          console.error("Error al obtener los usuarios:", error);
        }
      };
      fetchUsuario();
    }
  }, [usuario]);



  const openImageModal = (imgArray) => {
    setSelectedImages(imgArray);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImages(null);
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
    <div className="perfil-container">
      {dataUs ? (
        <>
          {/* Sección de información del usuario */}
          <div className='box'>
            <h1 className='titulo-admin'>Perfil</h1>
            <p className='font-subasta'><strong>Agencia:</strong> {dataUs.agencia}</p>
            <p className='font-subasta'><strong>DNI:</strong> {dataUs.dni}</p>
            <p className='font-subasta'><strong>Email:</strong> {dataUs.email}</p>
            <p className='font-subasta'><strong>Dirección:</strong> {dataUs.direccion}</p>
            <p className='font-subasta'><strong>Teléfono:</strong> {dataUs.telefono}</p>
          </div>

          {/* Sección de ofertas hechas */}
          <div className="box">
            <h1 className='titulo-admin'>Ofertas Hechas</h1>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-busqueda"
            />
            {dataUs.ofertasHechas && dataUs.ofertasHechas.length > 0 ? (
              <div className="contenedor">
                {dataUs.ofertasHechas
                  .filter((oferta) =>
                    oferta.subasta?.autos?.nombre
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((oferta, index) => (
                    <div className="borde" key={index}>
                      {oferta.subasta ? (
                        <>
                          <Slider {...sliderSettings}>
                            {oferta.subasta.autos?.img?.map((foto, i) => (
                              <div key={i}>
                                <img
                                  src={
                                    `https://martelli-automotes-back-production.up.railway.app/uploads/${foto}`
                                    //`http://localhost:3000/uploads/${foto}`
                                  }
                                  alt={`Foto ${i + 1} de ${oferta.subasta.autos?.nombre}`}
                                  className="img-card"
                                  onClick={() => openImageModal(oferta.subasta.autos?.img)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </div>
                            ))}
                          </Slider>
                          <div className="oferta-content">
                            <h3>{oferta.subasta.autos.nombre}</h3>
                            <p className='font-subasta'>Modelo: {oferta.subasta.autos.modelo}</p>
                            <p className='font-subasta'>Motor: {oferta.subasta.autos.motor}</p>
                            <p className='font-subasta'>Ubicación: {oferta.subasta.autos.ubicacion}</p>
                            <p className='font-subasta'><strong>Monto de oferta: ${oferta.monto.toLocaleString()}</strong></p>
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
        </>
      ) : (
        <p>Cargando...</p>
      )}

{imageModalOpen && selectedImages.length > 0 && (
  <div className="modal-overlay-imagen" onClick={closeImageModal}>
    <div className="modal-image-content" onClick={(e) => e.stopPropagation()}>
      <Slider {...sliderSettings}>
        {selectedImages.map((img, index) => (
          <div key={index}>
            <img
              src={
                `https://martelli-automotes-back-production.up.railway.app/uploads/${img}`
                //`http://localhost:3000/uploads/${img}`
              }
              alt={`Imagen ${index + 1}`}
              className="img-grande"
            />
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

export default Perfil;

