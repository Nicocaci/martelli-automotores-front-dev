import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Signup = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const navigate = useNavigate();

        useEffect(()=>{
          const token = Cookies.get("acces_token"); 
          if(token){
            navigate('/login')
          }
        },[navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(nombre, apellido, telefono, email, password, direccion);

    try {
      
      const response = await axios.post(
        "https://martelli-automotes-back-production.up.railway.app/api/usuarios/register",
        { nombre, apellido, telefono, email, password, direccion },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      console.log("Registro exitoso");
      setNombre("");
      setApellido("");
      setTelefono("");
      setEmail("");
      setPassword("");
      setDireccion("");

      navigate("/login");
    } catch (error) {
      if (error.response) {
        console.error("Error en el registro:", error.response.data.message || "Error desconocido");
      } else {
        console.error("Error en la solicitud:", error.message);
      }
    }
  }


  return (
    <form className='form' onSubmit={handleSubmit}>
      <h1>Registro de Usuario</h1>
      <label>Nombre:</label>
      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <label>Apellido:</label>
      <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
      <label>Telefono:</label>
      <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <label>Direccion:</label>
      <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Signup;
