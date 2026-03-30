import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
       onLoginSuccess(data.user);
    } else {
        setError(data.message || "Username atau Password salah.");
      }
    } catch (err) {
      setError("Server Backend belum dijalankan!");
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-visual-panel">
        <div className="visual-content">
          <div className="giant-book-icon">📚</div>
          <h1 className="brand-name">--AYYA<br/>Book<br/>Digital</h1>
          <p className="brand-tagline">Akses koleksi buku terbaik dalam satu sistem terpadu.</p>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="form-content-wrapper">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Gunakan akun administrator anda.</p>
          </div>

          {error && <div className="modern-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="modern-input-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="Masukkan username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>

            <div className="modern-input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="modern-login-btn">
              Masuk Sekarang
            </button>
            
            {/* Tambahkan ini di bawah tombol */}
            <div className="auth-footer"><p>Belum punya akun? <Link to="/register">Daftar Akun Pengguna Baru</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;