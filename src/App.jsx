import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Subasta from './components/Subasta';
import NavBar from './components/navigation/NavBar';
import Perfil from './components/Perfil';
import Login from './usuarios/Login';
import Signup from './usuarios/Signup';
import PerfilAdmin from './components/PerfilAdmin';
import Footer from './components/Footer';

const AppContent = () => {
  return (
    <div className='main'>
      
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/perfil" element={<Perfil />} />
        <Route exact path="/perfilAdmin" element={<PerfilAdmin />} />
        <Route exact path="/subasta" element={<Subasta />} />
        <Route exact path="/logout" />
      </Routes>
    </div>
  );
};

const App = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.error("Error registrando service worker:", err);
      });
    });
  }
  
  return (
    <BrowserRouter>
      <NavBar/>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
