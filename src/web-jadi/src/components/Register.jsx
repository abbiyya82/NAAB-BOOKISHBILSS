// components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nama_petugas: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validasi sederhana: Cek apakah password cocok
    if (formData.password !== formData.confirmPassword) {
      return alert("Password dan Konfirmasi Password tidak cocok!");
    }

    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_petugas: formData.nama_petugas,
          username: formData.username,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registrasi Berhasil! Selamat bertugas.");
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
        
      } else {
        alert(data.message || "Gagal mendaftarkan akun");
      }
    } catch (err) {
      console.error(err);
      alert("Koneksi ke server terputus.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <div className="register-header">
          <h2>Buat Akun</h2>
          <p>Daftarkan diri Anda sebagai pengguna baru</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label>Nama Lengkap</label>
            <input 
              type="text" 
              name="nama_petugas" 
              placeholder="Contoh: Budi Santoso"
              required 
              value={formData.nama_petugas}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              name="username" 
              placeholder="Gunakan huruf & angka"
              required 
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Min. 6 karakter"
              required 
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>KONFIRMASI PASSWORD</label>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Ulangi password"
              required 
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-submit">Daftar Sekarang</button>
        </form>

        <div className="register-footer">
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;