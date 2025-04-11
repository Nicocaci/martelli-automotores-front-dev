import React, { useEffect, useState } from 'react';
import '../../css/NavBar.css';
import logo from '/logo.svg';
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Swal from 'sweetalert2';

const NavBar = () => {
    const [rol, setRol] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
        const checkToken = () => {
            const token = Cookies.get('acces_token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    //console.log("Token decodificado:", decoded);
                    setRol(decoded.rol);
                } catch (error) {
                    console.error("Error al decodificar el token:", error);
                    setRol(null);
                }
            } else {
                setRol(null);
            }
        };

        checkToken();
        // Verificar cada 2 segundos si el token cambia (opcional)
        const interval = setInterval(checkToken, 2000);

        return () => clearInterval(interval); // Limpiar intervalo cuando el componente se desmonta
    }, []);


    const handleLogout = async () => {
        Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Estás seguro de que deseas salir?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
            customClass: {
                confirmButton: "custom-swal-confirm",
                cancelButton: "custom-swal-cancel"
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        "https://martelli-automotes-back-production.up.railway.app/api/usuarios/logout",
                        //"http://localhost:3000/api/usuarios/logout",
                        {},
                        { withCredentials: true }
                    );

                    localStorage.removeItem("cartel");

                    // 🔥 Mensaje de cierre de sesión con temporizador
                    Swal.fire({
                        title: "Sesión cerrada",
                        text: "Redirigiendo al login...",
                        icon: "success",
                        timer: 2000, // ⏳ 2 segundos antes de redirigir
                        showConfirmButton: false
                    });

                    setTimeout(() => {
                        window.location.href = "/login"; // Redirige después del timer
                    }, 2000);

                } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
                        icon: "error",
                        confirmButtonText: "OK"
                    });
                }
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest('.menu') && !event.target.closest('.menu-btn')) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <nav className='navBar'>
            <div className='logo-container'>
                <Link to="/"><img className='logo' src={logo} alt="logo" /></Link>
            </div>



            {/* Botón Hamburguesa */}
            <button className='menu-btn' onClick={() => setMenuOpen(!menuOpen)}>☰</button>

            {/* Menú */}
            <div className={`menu ${menuOpen ? 'show' : ''}`}>
                <ul className="menu2">
                    <li className="menu3"><Link to="/subasta">Inicio</Link></li>
                    <li className="menu3"><Link to={rol === "admin" ? "/perfilAdmin" : "/perfil"}>Perfil</Link></li>
                    <li className="menu3"><button className='boton-menu' onClick={handleLogout}>Cerrar Sesión</button></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
