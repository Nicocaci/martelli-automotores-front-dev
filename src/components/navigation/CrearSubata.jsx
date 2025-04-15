import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../css/FormSubasta.css';

const CrearSubasta = () => {
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
            customClass: {
                confirmButton: "custom-swal-confirm",
                cancelButton: "custom-swal-cancel"
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const auctionData = {
                    ...formData,
                    precioInicial: Number(formData.precioInicial),
                    ofertadores: []
                };

                try {
                    await axios.post(
                        "https://martelli-automotes-back-production.up.railway.app/api/subasta",
                        //"http://localhost:3000/api/subasta",
                        auctionData,
                        { headers: { "Content-Type": "application/json" } }
                    );

                    Swal.fire({
                        title: "Subasta creada",
                        text: "¡Tu subasta ha sido publicada con éxito!",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });

                    setFormData({
                        autos: { nombre: "", motor: "", modelo: "", ubicacion: "", img: "" },
                        precioInicial: "",
                        fechaFin: "",
                    });

                } catch (error) {
                    console.error("Error:", error);

                    Swal.fire({
                        title: "Error",
                        text: "Hubo un problema al crear la subasta",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="FormSubasta">
            <h2 className='titulo-admin'>Crear Subasta</h2>
            <input type="text" name="nombre" placeholder="Nombre del auto" value={formData.autos.nombre} onChange={handleChange} required />
            <input type="text" name="motor" placeholder="Motor" value={formData.autos.motor} onChange={handleChange} required />
            <input type="text" name="modelo" placeholder="Modelo" value={formData.autos.modelo} onChange={handleChange} required />
            <input type="text" name="ubicacion" placeholder="Ubicación" value={formData.autos.ubicacion} onChange={handleChange} required />
            <input type="text" name="img" placeholder="URL de la imagen" value={formData.autos.img} onChange={handleChange} required />
            <input type="number" name="precioInicial" placeholder="Precio inicial" value={formData.precioInicial} onChange={handleChange} required />
            <input type="datetime-local" name="fechaFin" value={formData.fechaFin} onChange={handleChange} required />
            <button type="submit">Crear Subasta</button>
        </form>
    );
};

export default CrearSubasta;
