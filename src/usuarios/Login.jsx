
  import React from 'react';
  import '../App.css'
  import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Cookies from 'js-cookie';

  const Login = () => {
      const [email,setEmail] = useState("");
      const [password,setPassword] = useState("");
      const [error,setError] = useState("");
      const navigate = useNavigate();

      //VERIFICAMOS TOKEN

      useEffect(()=>{
        const token = Cookies.get("acces_token");
        console.log("Token desde cookie:", token);
        if(token){
          navigate('/subasta')
        }
      },[navigate]);

      const handleLogin = async (e) =>{
        e.preventDefault();
        if (!email || !password) {
          setError("Por favor, ingrese el email y la contraseña.");
          return;
        }
        try {
          const response = await fetch('http://localhost:8080/api/usuarios/login', {
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({ email,password}),
            credentials: "include"
          });

          const data = await response.json();
          if(!response.ok){
            throw new Error(data.message);
          }

          alert('Inicio de sesion exitoso');
          navigate('/subasta');
        } catch (error) {
          setError(error.message);
        }
      };


    return (
      <form className='form' onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <label htmlFor="">Email:</label>
        <input type="text" name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="">Contraseña:</label>
        <input type="password" name='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
        <button type='submit'>Iniciar sesion</button>
      </form>
    )
  }

  export default Login;