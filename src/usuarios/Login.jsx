import React from 'react';
import '../css/Login.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';
import pic from '/pic.jpg';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // VERIFICAMOS TOKEN

  useEffect(() => {
    const token = Cookies.get("acces_token");
    if (token) {
      navigate('/subasta');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, ingrese el email y la contraseña.");
      return;
    }
    try {
      const response = await axios.post(
        "https://martelli-automotes-back-production.up.railway.app/api/usuarios/login"
        //"http://localhost:3000/api/usuarios/login"
        ,
        { email, password },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      console.log("Headers recibidos:", response.headers); // 🔍 Ver cookies en la respuesta
      console.log("Cookies actuales:", document.cookie); // 🔍
      Swal.fire({
        title: "¡Inicio de sesión exitoso!",
        text: "Bienvenido a la subasta",
        icon: "success",
        confirmButtonText: "Continuar",
        customClass: {
          confirmButton: "custom-swal-button" // Clase personalizada
        }
      }).then(() => {
        navigate('/subasta'); // Navegamos después de que el usuario cierre el alerta
      });
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Error en el inicio de sesión");
         // 🔥 Mostrar SweetAlert en caso de error
        Swal.fire({
          title: "Error",
          text: error.response.data.message || "Error en el inicio de sesión",
          icon: "error",
          confirmButtonText: "Intentar nuevamente",
          customClass: {
            confirmButton: "boton-swal-error" // Clase personalizada
          }
        });
      } else {
        setError("Error de conexión con el servidor");
        Swal.fire({
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor",
          icon: "warning",
          confirmButtonText: "Reintentar",
          customClass: {
            confirmButton: "boton-swal-error" // Clase personalizada
          }
        });
      }
    };
  };

  return (
    <div className='mainform'>
    <form className='form' onSubmit={handleLogin}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <label htmlFor="">Email:</label>
      <input type="text" name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="">Contraseña:</label>
      <input type="password" name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className='' type='submit'>Iniciar sesión</button>
      <Link to="/signup">
        <button className='' type="button">Registrarse</button>
      </Link>
    </form>
    </div>
  )
}

export default Login;
