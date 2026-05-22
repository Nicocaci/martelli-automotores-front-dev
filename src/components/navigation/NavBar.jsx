import React, { useEffect, useState } from "react";
import "../../css/NavBar.css";
import logo from "/logo.svg";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
const apiUrl = import.meta.env.VITE_API_URL;

const NavBar = () => {
  const [rol, setRol] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfilDropdownOpen, setPerfilDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await axios.get(`${apiUrl}/usuarios/verify`, {
          withCredentials: true,
        });

        console.log("ROL:", response.data.user?.rol);

        setRol(response.data.user?.rol || null);
      } catch (error) {
        setRol(null);
      }
    };
    checkToken();
  }, [location.pathname]);

  
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
        cancelButton: "custom-swal-cancel",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${apiUrl}/usuarios/logout`,
            {},
            { withCredentials: true },
          );

          localStorage.removeItem("cartel");

          // 🔥 Mensaje de cierre de sesión con temporizador
          Swal.fire({
            title: "Sesión cerrada",
            text: "Redirigiendo al login...",
            icon: "success",
            timer: 2000, // ⏳ 2 segundos antes de redirigir
            showConfirmButton: false,
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
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        !event.target.closest(".menu") &&
        !event.target.closest(".menu-btn")
      ) {
        setMenuOpen(false);
      }
      if (
        perfilDropdownOpen &&
        !event.target.closest(".perfil-dropdown") &&
        !event.target.closest(".perfil-btn")
      ) {
        setPerfilDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen, perfilDropdownOpen]);

  return (
    <nav className="navBar">
      <div className="logo-container">
        <Link to="/">
          <img className="logo" src={logo} alt="logo" />
        </Link>
      </div>

      {/* Botón Hamburguesa */}
      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Menú */}
      <div className={`menu ${menuOpen ? "show" : ""}`}>
        <ul className="menu2">
          <li className="menu3">
            <Link to="/subasta">Inicio</Link>
          </li>
          {rol === "admin" ? (
            <li
              className="menu3 perfil-btn"
              onClick={() => setPerfilDropdownOpen(!perfilDropdownOpen)}
            >
              <button className="boton-menu">Perfil ⬇</button>
              {perfilDropdownOpen && (
                <ul className="perfil-dropdown">
                  <li>
                    <Link to="/crearsubasta">Crear Subasta</Link>
                  </li>
                  <li>
                    <Link to="/registrosubasta">Registro de Subastas</Link>
                  </li>
                  <li>
                    <Link to="/usuarios">Registro de Usuarios</Link>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li className="menu3">
              <Link to="/perfil">Perfil</Link>
            </li>
          )}
          <li className="menu3">
            <button className="boton-menu" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
