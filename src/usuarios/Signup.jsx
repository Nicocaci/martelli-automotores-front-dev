import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import '../css/Signup.css';
import Swal from 'sweetalert2';

const Signup = () => {
  const [agencia, setAgencia] = useState("");
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState(""); // Nuevo campo
  const [direccion, setDireccion] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== repeatPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
      });
      return;
    }

    Swal.fire({
      title: 'Solicitud de registro enviada...',
      text: 'Estamos procesando tu solicitud.',
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
    });

    try {
      const response = await axios.post(
        "https://martelli-automotes-back-production.up.railway.app/api/usuarios/register",
        //"http://localhost:3000/api/usuarios/register",
        { nombre, razonSocial, agencia, dni, telefono, email, password, direccion },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      console.log("Registro exitoso");
      setNombre("");
      setRazonSocial("");
      setAgencia("");
      setDni("");
      setTelefono("");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      setDireccion("");

      navigate("/login");
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message;

        if (errorMessage === "El email ya está registrado") {
          Swal.fire({
            title: 'Error',
            text: 'El correo ya se encuentra registrado.',
            icon: 'error',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: errorMessage || 'Error desconocido durante el registro.',
            icon: 'error',
          });
        }

        console.error("Error en el registro:", errorMessage);
      } else {
        console.error("Error en la solicitud:", error.message);
        Swal.fire({
          title: 'Error de red',
          text: 'No se pudo conectar con el servidor.',
          icon: 'error',
        });
      }
    }

  }

  return (
    <div className='main-registro'>
      <form className='form' onSubmit={handleSubmit}>
        <h1>Registro de Usuario</h1>
        <label>Nombre Completo:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <label>Empresa:</label>
        <input type="text" value={agencia} onChange={(e) => setAgencia(e.target.value)} required />
        <label>Razón Social:</label>
        <input type="text" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} required />
        <label>DNI/CUIT:</label>
        <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required />
        <label>Dirección:</label>
        <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
        <label>Teléfono:</label>
        <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label>Repetir Contraseña:</label>
        <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
        <button type="submit">Registrarse</button>
        <Link to="/login">
          <button type="button">Iniciar Sesión</button>
        </Link>
      </form>
    </div>
  );
};

export default Signup;
