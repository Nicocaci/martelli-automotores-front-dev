import React from 'react';
import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Subasta from './components/Subasta';
import NavBar from './components/navigation/NavBar';
import Perfil from './components/Perfil';
import Login from './usuarios/Login';
import Signup from './usuarios/Signup';
import CrearSubata from './components/navigation/CrearSubata';
import RegistroSubasta from './components/navigation/RegistroSubasta';
import Usuarios from './components/navigation/Usuarios';

import { showAppleInstallationGuide } from './utils/pwaHelper.js';

const AppContent = () => {
  return (
    <div className='main'>

      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/perfil" element={<Perfil />} />
        <Route exact path="/perfil" element={<Perfil />} />
        <Route exact path="/crearsubasta" element={<CrearSubata />} />
        <Route exact path="/registroSubasta" element={<RegistroSubasta />} />
        <Route exact path="/usuarios" element={<Usuarios />} />
        <Route exact path="/subasta" element={<Subasta />} />
        <Route exact path="/logout" />
      </Routes>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    // Registrar el Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => {
          console.error("Error registrando service worker:", err);
        });
      });
    }

    // Mostrar guía si el dispositivo es Apple
    showAppleInstallationGuide();
  }, []);


  return (
    <BrowserRouter>
      <NavBar />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
