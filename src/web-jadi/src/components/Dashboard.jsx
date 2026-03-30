import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Dashboard.css';
import ProductCard from './ProductCard';

const Dashboard = ({ onLogout }) => { // Hapus 'user' dari props agar tidak bentrok
  const navigate = useNavigate(); 
  const [books, setBooks] = useState([]);
  const [kategoriTerpilih, setKategoriTerpilih] = useState('Semua');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Ambil data user dari Local Storage
  const localData = JSON.parse(localStorage.getItem('user')); 
  const role = localData?.role;
  const username = localData?.username;

  useEffect(() => {
    // Pastikan port backend benar (5000 sesuai server.js kamu)
    fetch(`http://localhost:5000/api/data?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error("Fetch Error:", err));
  }, []);

  const addToCart = (book) => {
    setCart((prevCart) => {
      const isExist = prevCart.find(item => item.kode_buku === book.kode_buku);
      if (isExist) {
        return prevCart.map(item => 
          item.kode_buku === book.kode_buku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...book, quantity: 1 }];
    });
    alert(`📚 ${book.judul} berhasil ditambah!`);
  };

  const totalHarga = cart.reduce((total, item) => total + (item.harga_jual * item.quantity), 0);
  
  const bukuDifilter = kategoriTerpilih === 'Semua' 
    ? books 
    : books.filter(book => book.kategori?.toLowerCase() === kategoriTerpilih.toLowerCase());

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-info">
          {/* Menampilkan Nama User dari Local Storage */}
          <h1>TOKO BUKU {username?.toUpperCase() || 'PENGGUNA'}</h1>
        </div>

        <div className="header-actions">
          {/* Tombol Kelola Produk - Muncul jika role adalah 'admin' */}
          {role === 'admin' && (
            <button className="admin-nav-btn" onClick={() => navigate('/admin-product')}>
              KELOLA PRODUK
            </button>
          )}

          {/* Widget Keranjang */}
          <div className="cart-widget" onClick={() => setIsCartOpen(true)}>
            <span className="cart-icon">🛒</span>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>

          {/* Tombol Logout */}
          <button className="logout-button" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      {/* FILTER KATEGORI */}
      <div className="filter-container">
        {['Semua', 'Fiksi', 'Non-Fiksi'].map((kat) => (
          <button 
            key={kat}
            className={kategoriTerpilih.toLowerCase() === kat.toLowerCase() ? 'filter-btn active' : 'filter-btn'} 
            onClick={() => setKategoriTerpilih(kat)}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* GRID DAFTAR BUKU */}
      <div className="book-grid">
        {bukuDifilter.length > 0 ? (
          bukuDifilter.map((book) => (
            <ProductCard 
              key={book.kode_buku} 
              book={book} 
              onAddToCart={() => addToCart(book)} 
            />
          ))
        ) : (
          <div className="empty-msg">
            <p>Data buku {kategoriTerpilih} belum tersedia.</p>
          </div>
        )}
      </div>

      {/* MODAL KERANJANG */}
      {isCartOpen && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <div className="modal-header">
              <h2>Isi Keranjang 🛒</h2>
              <button className="close-modal" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <p>Keranjang kosong...</p>
              ) : (
                cart.map(item => (
                  <div key={item.kode_buku} className="cart-item">
                    <img src={item.image_url} alt={item.judul} />
                    <div className="cart-item-info">
                      <h4>{item.judul}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p>Rp {(item.harga_jual * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="modal-footer">
                <h3>Total: Rp {totalHarga.toLocaleString('id-ID')}</h3>
                <button className="checkout-btn">CHECKOUT</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;