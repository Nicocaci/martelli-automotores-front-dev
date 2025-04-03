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
  const location = useLocation();
  const hideNavRoutes = ["/login"];

  return (
    <div className='main'>
      {!hideNavRoutes.includes(location.pathname) && <NavBar />}
      
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
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
