import React, { useEffect, useState } from 'react';
import '../../css/NavBar.css';
import logo from '/logo.svg';
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

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
                const interval = setInterval(checkToken,2000);
        
                return () => clearInterval(interval); // Limpiar intervalo cuando el componente se desmonta
    }, []);
    
    
    const handleLogout = async () => {
        try {
            await axios.post(
                "https://martelli-automotes-back-production.up.railway.app/api/usuarios/logout",
                //"http://localhost:3000/api/usuarios/logout",
                {},
                { withCredentials: true }
            );
            alert("Sesión cerrada con éxito");
            localStorage.removeItem("info");
            window.location.href = "/login";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
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
                <img className='logo' src={logo} alt="logo" />
            </div>
            
            {/* Botón Hamburguesa */}
            <button className='menu-btn' onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            
            {/* Menú */}
            <div className={`menu ${menuOpen ? 'show' : ''}`}>
                <ul className="menu2">
                    <li className="menu3"><Link to="/login">Iniciar Sesión</Link></li>
                    {rol === "admin" && (
                        <li className="menu3"><Link to="/signup">Registrarse</Link></li>
                    )}
                    <li className="menu3"><Link to="/subasta">Inicio</Link></li>
                    <li className="menu3"><Link to={rol === "admin" ? "/perfilAdmin" : "/perfil"}>Perfil</Link></li>
                    <li className="menu3"><button className='boton-menu' onClick={handleLogout}>Cerrar Sesión</button></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
