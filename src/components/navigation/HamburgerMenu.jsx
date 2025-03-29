import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import "../../css/NavBar.css";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rol, setRol] = useState(null);

    const handleLogout = async () => {
        try {
            await axios.post(
            "https://martelli-automotes-back-production.up.railway.app/api/usuarios/logout",
                {},
                { withCredentials: true }
            );

            alert("Sesión cerrada con éxito");
            document.cookie = "connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
            window.location.href = "/login";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        const checkToken = () => {
            const token = Cookies.get('acces_token');
            if (token) {
                const decoded = jwtDecode(token);
                setRol(decoded.rol);
            } else {
                setRol(null); // Si no hay token, limpiar el rol
            }
        };

        checkToken();

        // Verificar cada 2 segundos si el token cambia (opcional)
        const interval = setInterval(checkToken, 2000);
        
        return () => clearInterval(interval); // Limpiar intervalo cuando el componente se desmonta
    }, []);

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
                        <li className="menu-item"><Link to="/login">Iniciar Sesión</Link></li>
                        
                        {/* Mostrar "Registrarse" solo si el rol es "admin" */}
                        {rol === "admin" && (
                            <li className="menu-item"><Link to="/signup">Registrarse</Link></li>
                        )}

                        <li className="menu-item"><Link to="/subasta">Inicio</Link></li>
                        <li className="menu-item"><Link to={ rol === "admin" ? "/perfilAdmin" : "/perfil"}>Perfil</Link></li>
                        <li className="menu-item"><button onClick={handleLogout}>Cerrar Sesión</button></li>
                    </ul>
                </motion.div>
            )}
        </div>
    );
};

export default HamburgerMenu;
