import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [direccion, setDireccion] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(nombre, apellido, telefono, email, password, direccion);
  
    try {
      const response = await fetch("http://localhost:8080/api/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, telefono, email, password, direccion }),
        credentials: "include",
      });
  
      if (response.ok) {
        console.log("Registro exitoso");

        setNombre("");
        setApellido("");
        setTelefono("");
        setEmail("");
        setPassword("");
        setDireccion("");

        navigate("/login");

      }else {
        console.error("Error en el registro");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
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
