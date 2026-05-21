import React from "react";
import "../css/Login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const apiUrl = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        await axios.get(`${apiUrl}/usuarios/verify`, {
          withCredentials: true,
        });

        navigate("/subasta");
      } catch (error) {
        console.log("Usuario no autenticado");
      }
    };

    verificarSesion();
  }, [navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, ingrese el email y la contraseña.");
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await axios.post(
        `${apiUrl}/usuarios/login`,
        { email: normalizedEmail, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      Swal.fire({
        title: "¡Inicio de sesión exitoso!",
        text: "Bienvenido a AutoSmart",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        navigate("/subasta");
      });
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Error en el inicio de sesión");
        Swal.fire({
          title: "Error",
          text: error.response.data.message || "Error en el inicio de sesión",
          icon: "error",
          confirmButtonText: "Intentar nuevamente",
          customClass: { confirmButton: "boton-swal-error" },
        });
      } else {
        setError("Error de conexión con el servidor");
        Swal.fire({
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor",
          icon: "warning",
          confirmButtonText: "Reintentar",
          customClass: { confirmButton: "boton-swal-error" },
        });
      }
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("El usuario aceptó la instalación");
      } else {
        console.log("El usuario rechazó la instalación");
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <div className="mainform">
      <form className="form" onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <label htmlFor="">Email:</label>
        <input
          type="text"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="">Contraseña:</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="" type="submit">
          Iniciar sesión
        </button>
        {showInstallButton && (
          <button className="boton-menu" onClick={handleInstallClick}>
            Instalar App
          </button>
        )}
        <Link to="/signup">
          <button className="" type="button">
            Registrarse
          </button>
        </Link>
      </form>
    </div>
  );
};

export default Login;
