import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../css/Usuarios.css'

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState(null);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroEmpresa, setFiltroEmpresa] = useState('');
    const [filtroDNI, setFiltroDNI] = useState('');
    const [filtroAprobado, setFiltroAprobado] = useState('todos'); // puede ser 'todos', 'aprobados' o 'desaprobados'


    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await axios.get(
                    "https://martelli-automotes-back-production.up.railway.app/api/usuarios"
                    //"http://localhost:3000/api/usuarios"
                );
                setUsuarios(response.data);
            } catch (error) {
                console.error("Error al obtener los usuarios:", error);
            }
        };

        fetchUsuarios();
    }, []);

    const handleDeleteUsuario = async (id) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará al usuario permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            customClass: {
                confirmButton: "custom-swal-confirm",
                cancelButton: "custom-swal-cancel"
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(
                        `https://martelli-automotes-back-production.up.railway.app/api/usuarios/${id}`
                        //`http://localhost:3000/api/usuarios/${id}`
                    );

                    Swal.fire("¡Eliminado!", "El usuario ha sido eliminado.", "success");

                    // Actualizar la lista local de usuarios
                    setUsuarios((prevUsuarios) =>
                        prevUsuarios.filter((user) => user._id !== id)
                    );
                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
                }
            }
        });
    };

    const toggleAprobado = async (id) => {
        try {
            await axios.patch(
                `https://martelli-automotes-back-production.up.railway.app/api/usuarios/${id}/aprobado`
                //`http://localhost:3000/api/usuarios/${id}/aprobado`
            );

            // Volver a obtener los usuarios actualizados
            const response = await axios.get(
                "https://martelli-automotes-back-production.up.railway.app/api/usuarios"
                //"http://localhost:3000/api/usuarios"
            );
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cambiar el estado de aprobado:", error);
        }
    };

    return (
        <div className='usuarios-registrados'>
            <h2 className='titulo-admin'>Usuarios Registrados</h2>
            <div className="filtros-container">
                <input
                    type="text"
                    placeholder="Filtrar por nombre"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Filtrar por empresa"
                    value={filtroEmpresa}
                    onChange={(e) => setFiltroEmpresa(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Filtrar por DNI"
                    value={filtroDNI}
                    onChange={(e) => setFiltroDNI(e.target.value)}
                />
                <select value={filtroAprobado} onChange={(e) => setFiltroAprobado(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="aprobados">Aprobados</option>
                    <option value="desaprobados">Desaprobados</option>
                </select>
            </div>

            {usuarios ? (
                usuarios.length > 0 ? (
                    (() => {
                        const usuariosFiltrados = usuarios.filter((usuario) => {
                            const coincideNombre = (usuario.nombre || '').toLowerCase().includes(filtroNombre.toLowerCase());
                            const coincideEmpresa = (usuario.agencia || '').toLowerCase().includes(filtroEmpresa.toLowerCase());
                            const coincideDNI = String(usuario.dni || '').includes(filtroDNI);

                            const coincideAprobado =
                                filtroAprobado === 'todos' ||
                                (filtroAprobado === 'aprobados' && usuario.aprobado) ||
                                (filtroAprobado === 'desaprobados' && !usuario.aprobado);

                            return coincideNombre && coincideEmpresa && coincideDNI && coincideAprobado;
                        });


                        return usuariosFiltrados.length > 0 ? (
                            <div className="usuarios-grid">
                                {usuariosFiltrados.map((usuario) => (
                                    <div key={usuario._id} className="usuario-card">
                                        <h3 className="usuario-nombre">{usuario.nombre}</h3>
                                        <p><strong>Empresa:</strong> {usuario.agencia}</p>
                                        <p><strong>Razón Social:</strong> {usuario.razonSocial}</p>
                                        <p><strong>DNI:</strong> {usuario.dni}</p>
                                        <p><strong>Teléfono:</strong> {usuario.telefono}</p>
                                        <p><strong>Dirección:</strong> {usuario.direccion}</p>
                                        <p><strong>Email:</strong> {usuario.email}</p>
                                        <p><strong>Rol:</strong> {usuario.rol}</p>
                                        <p><strong>Aprobado:</strong> {usuario.aprobado ? "Sí" : "No"}</p>

                                        <div className="usuario-buttons">
                                            <button
                                                className={`btn-aprobar ${usuario.aprobado ? "desaprobar" : ""}`}
                                                onClick={() => toggleAprobado(usuario._id)}
                                            >
                                                {usuario.aprobado ? "Desaprobar" : "Aprobar"}
                                            </button>
                                            <button className="btn-eliminar" onClick={() => handleDeleteUsuario(usuario._id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No hay usuarios que coincidan con los filtros.</p>
                        );
                    })()
                ) : (
                    <p>No hay usuarios registrados.</p>
                )
            ) : (
                <p>Cargando usuarios...</p>
            )}

        </div>
    );
};

export default Usuarios;
