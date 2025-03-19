import { useState } from "react";
import { motion } from "framer-motion";
import {Menu, X } from "lucide-react";
import "../../css/NavBar.css";
import { Link } from "react-router-dom";
import axios from "axios";

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const handleLogout = async () =>{
        try {
            const response = await axios.post(
                "https://martelli-automotes-back-production.up.railway.app/api/usuarios/logout",
                {},
                { withCredentials: true }
            );
    
            alert("Session cerrada con exito");
            document.cookie = "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
            window.location.href = "/login";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    }


    return (
        <div className="menu-container">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="menu-button"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="menu-dropdown"
                >
                    <ul className="menu-list">
                        <li className="menu-item"><Link to={"/login"}>Iniciar Sesion</Link></li>
                        <li className="menu-item"><Link to={"/signup"}>Registrarse</Link></li>
                        <li className="menu-item"><Link to={"/subasta"}>Inicio</Link></li>
                        <li className="menu-item"><Link to={`/perfil`}>Perfil</Link></li>
                        <li className="menu-item"><Link to={`/perfilAdmin`}>Perfil Admin</Link></li>
                        <li className="menu-item"><button onClick={handleLogout}>LogOut</button></li>
                    </ul>
                </motion.div>
            )}
        </div>
    );
};  

export default HamburgerMenu;