import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminProduct from './components/AdminProduct'; 
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* HALAMAN LOGIN */}
          <Route 
            path="/" 
            element={!isLoggedIn ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} 
          />

          {/* HALAMAN REGISTER */}
        <Route path="/register" element={<Register />} />

          {/* HALAMAN DASHBOARD UTAMA */}
          <Route 
            path="/dashboard" 
            element={isLoggedIn ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />

          {/* HALAMAN KELOLA PRODUK (ADMIN) */}
          <Route 
            path="/admin-product" 
            element={isLoggedIn ? <AdminProduct user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />

          {/* Jalur Error (Jika user mengetik URL ngawur) */}
        <Route path="*" element={<h1>404 - Halaman Tidak Ditemukan</h1>} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;