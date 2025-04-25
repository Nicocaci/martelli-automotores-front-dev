import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../css/FormSubasta.css';
const apiUrl = import.meta.env.VITE_API_URL;



const CrearSubasta = () => {
    const [formData, setFormData] = useState({
        autos: {
            nombre: "",
            motor: "",
            modelo: "",
            ubicacion: "",
            descripcion: "",
            img: "",
            peritaje: "",
        },
        precioInicial: "",
        fechaFin: "",
    });



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

        Swal.fire({
            title: "¿Confirmar subasta?",
            text: "¿Estás seguro de que deseas crear esta subasta?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, crear",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const formDataToSend = new FormData();

                formDataToSend.append("nombre", formData.autos.nombre);
                formDataToSend.append("motor", formData.autos.motor);
                formDataToSend.append("modelo", formData.autos.modelo);
                formDataToSend.append("ubicacion", formData.autos.ubicacion);
                formDataToSend.append("descripcion", formData.autos.descripcion);

                // 🔥 Esta parte es la clave: recorrer el array de imágenes y agregarlas una por una
                formData.autos.img.forEach((file) => {
                    formDataToSend.append("img", file); // ¡el campo debe tener el mismo nombre que espera Multer!
                });

                formData.autos.peritaje.forEach((file) => {
                    formDataToSend.append("peritaje", file);
                });
                formDataToSend.append("precioInicial", formData.precioInicial);
                formDataToSend.append("fechaFin", formData.fechaFin);


                try {
                    await axios.post(
                        `${apiUrl}/subasta`,
                        formDataToSend,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );


                    Swal.fire({
                        title: "Subasta creada",
                        text: "¡Tu subasta ha sido publicada con éxito!",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });

                    setFormData({
                        autos: {
                            nombre: "",
                            motor: "",
                            modelo: "",
                            ubicacion: "",
                            descripcion: "",
                            img: "",
                            peritaje: "",
                        },
                        precioInicial: "",
                        fechaFin: "",
                    });
                } catch (error) {
                    console.error("Error:", error);
                    Swal.fire({
                        title: "Error",
                        text: "Hubo un problema al crear la subasta",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            }
        });
    };


    return (
        <form onSubmit={handleSubmit} className="FormSubasta">
            <h2 className='titulo-admin'>Crear Subasta</h2>
            <input
                type="text"
                name="nombre"
                placeholder="Nombre del auto"
                value={formData.autos.nombre}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="motor"
                placeholder="Motor"
                value={formData.autos.motor}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="modelo"
                placeholder="Modelo"
                value={formData.autos.modelo}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="ubicacion"
                placeholder="Ubicación"
                value={formData.autos.ubicacion}
                onChange={handleChange}
                required
            />
            <input
                type="file"
                name="img"
                accept="image/*"
                multiple
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        autos: { ...formData.autos, img: Array.from(e.target.files) },
                    })
                }
                required
            />
            <input
                type="file"
                name="peritaje"
                accept="image/*"
                multiple
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        autos: { ...formData.autos, peritaje: Array.from(e.target.files) },
                    })
                }
                required
            />
            <textarea
                name="descripcion"
                placeholder="Descripción del auto (defectos, detalles, etc.)"
                value={formData.autos.descripcion}
                onChange={handleChange}
                required
                rows="4"
                cols="50"
            />
            <input
                type="number"
                name="precioInicial"
                placeholder="Precio inicial"
                value={formData.precioInicial}
                onChange={handleChange}
                required
            />
            <input
                type="datetime-local"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                required
            />
            <button type="submit">Crear Subasta</button>
        </form>

    );
};

export default CrearSubasta;
