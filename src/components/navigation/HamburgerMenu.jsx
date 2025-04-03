import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import "../../css/NavBar.css";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rol, setRol] = useState(null);

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
                            <li className="menu-item"><Link to="/signup">Registro Usuario</Link></li>
                        )}

                        <li className="menu-item"><Link to="/subasta">Inicio</Link></li>
                        <li className="menu-item"><Link to={rol === "admin" ? "/perfilAdmin" : "/perfil"}>Perfil</Link></li>
                        <li className="menu-item"><button className="logout" onClick={handleLogout}>Cerrar Sesión</button></li>
                    </ul>
                </motion.div>
            )}
        </div>
    );
};

export default HamburgerMenu;
