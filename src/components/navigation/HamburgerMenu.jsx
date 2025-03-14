import { useState } from "react";
import { motion } from "framer-motion";
import {Menu, X } from "lucide-react";
import "../../css/NavBar.css";
import { Link } from "react-router-dom";

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const handleLogout = async () =>{
        try {
            const response = await fetch("http://localhost:8080/api/usuarios/logout",{
                method: 'POST',
                credentials: "include",
            });

            if(response.ok){
                console.log("Session cerrada con exito");
                document.cookie = "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
                window.location.href = '/login';
            }else {
                console.error("Error al cerrar session", response.statusText);
            }

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
                        <li className="menu-item"><button onClick={handleLogout}>LogOut</button></li>
                    </ul>
                </motion.div>
            )}
        </div>
    );
};  

export default HamburgerMenu;