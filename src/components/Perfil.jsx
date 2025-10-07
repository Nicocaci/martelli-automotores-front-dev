import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import socket from "../utils/Socket";
socket.on("connect", () => {
  console.log("Socket conectado:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket desconectado");
});
const apiUrl = import.meta.env.VITE_API_URL;
const apiUrlUD = import.meta.env.VITE_API_URL_UPLOADS;

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [dataUs, setDataUs] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [fullImage, setFullImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedAutoImgs, setSelectedAutoImgs] = useState([]);
  const [peritajeModalOpen, setPeritajeModalOpen] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const token = Cookies.get("access_token");
  if (!token) {
    console.log("🚫 No hay token, redirigiendo al login");
    navigate('/login');
    return;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("🧩 Token decodificado:", decoded);
    setUsuario(decoded._id || decoded.id || decoded.userId);
  } catch (err) {
    console.error("❌ Error al decodificar token:", err);
    Cookies.remove("acces_token");
    navigate('/login');
  }
}, [navigate]);


  useEffect(() => {
    if (!usuario) return;

    const handleNuevaOferta = (data) => {
      console.log("Evento recibido en frontend:", data, "Usuario local:", usuario);
      if (data.usuarioId?.toString() === usuario?.toString()) {
        console.log("🔁 El usuario coincide, actualizando info...");
        axios
          .get(`${apiUrl}/usuarios/${usuario}`)
          .then((res) => setDataUs(res.data))
          .catch((err) => console.error("Error al actualizar ofertas del perfil:", err));
      }
    };

    socket.on("nueva-oferta-realizada", handleNuevaOferta);

    return () => {
      socket.off("nueva-oferta-realizada", handleNuevaOferta);
    };
  }, [usuario]);


  useEffect(() => {
    if (usuario) {
      const fetchUsuario = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}/usuarios/${usuario}`
          );
          setDataUs(response.data);
        } catch (error) {
          console.error("Error al obtener los usuarios:", error);
        }
      };
      fetchUsuario();
    }
  }, [usuario]);

  const openModal = async (subastaId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/subasta/${subastaId}`
      );
      setModalData(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles de la subasta:", error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  const openImageModal = (imgArray) => {
    setSelectedImages(imgArray);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImages(null);
    setImageModalOpen(false);
  };

  const openPeritajeModal = (peritajes) => {
    const imgs = peritajes.map(foto => `${apiUrlUD}/uploads/${foto}`);
    setSelectedAutoImgs(imgs);
    setPeritajeModalOpen(true);
  };
  
  const closePeritajeModal = () => {
    setSelectedAutoImgs([]);
    setPeritajeModalOpen(false);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="perfil-container" key={dataUs?._id}>
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
                                  src={`${apiUrlUD}/uploads/${foto}`}
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
                            <p className='font-subasta'><strong>Monto de oferta: ${oferta.monto.toLocaleString()}</strong></p>
                            <button className='boton-detalle' onClick={() => openModal(oferta.subasta._id)}>Ver Detalle</button>
                            {(() => {
                              const ofertadores = oferta.subasta.ofertadores || [];
                              const maxOferta = ofertadores.reduce((max, curr) =>
                                curr.monto > max.monto ? curr : max,
                                ofertadores[0] || {}
                              );

                              if (!maxOferta.usuario) {
                                return <p className="font-subasta text-gray-500">No hay ofertas aún.</p>;
                              }

                              return maxOferta.usuario === usuario ? (
                                <p className="font-subasta text-green-600 font-bold">✅ ¡Tu oferta fué la mas alta!</p>
                              ) : (
                                <p className="font-subasta text-red-600 font-semibold">❌ Tu oferta fue superada.</p>
                              );
                            })()}
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
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="boton-cerrar" onClick={closeImageModal}>X</button>
            <div className="image-gallery">
              {selectedImages.map((src, i) => (
                <img
                  key={i}
                  src={`${apiUrlUD}/uploads/${src}`}
                  alt={`Thumbnail ${i + 1}`}
                  className="thumbnail"
                  onClick={() => setFullImage(`${apiUrlUD}/uploads/${src}`)}
                />

              ))}
            </div>
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

      {modalOpen && modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="boton-cerrar" onClick={closeModal}>X</button>
            <p className="font-subasta"><strong>Motor:</strong> {modalData.autos?.motor}</p>
            <p className="font-subasta"><strong>Modelo:</strong> {modalData.autos?.modelo}</p>
            <p className="font-subasta"><strong>Kilómetros:</strong> {modalData.autos?.kilometros.toLocaleString()}KM</p>
            <p className="font-subasta"><strong>Ubicación:</strong> {modalData.autos?.ubicacion}</p>
            <p className="font-subasta"><strong>Descripcion:</strong> {modalData.autos?.descripcion}</p>
            <button className="boton-peritaje" onClick={() => openPeritajeModal(modalData.autos?.peritaje)}>Peritaje</button>

          </div>
        </div>
      )}

      {peritajeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="boton-cerrar" onClick={closePeritajeModal}>X</button>
            <div className="image-gallery">
              {selectedAutoImgs.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Imagen ${i}`}
                  className="thumbnail"
                  onClick={() => setFullImage(src)}
                />
              ))}
            </div>

            {fullImage && (
              <div className="fullscreen-image" onClick={() => setFullImage(null)}>
                <img src={fullImage} alt="Vista completa" />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Perfil;

