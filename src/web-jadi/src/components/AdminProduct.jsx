import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProduct.css'; 

const AdminProduct = ({ user }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBook, setEditingBook] = useState(null); 

  const [newBook, setNewBook] = useState({ 
  judul: '', 
  kategori: '', 
  harga_jual: '', 
  stok_saat_ini: '', 
  image_url: '', 
  isbn_unnik: '' 
});

  const loadData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal ambil data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // FUNGSI HAPUS (FRONTEND)
  const handleDelete = async (kode) => {
    if (window.confirm("Yakin ingin menghapus buku ini secara permanen?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/hapus/${kode}`, { method: 'DELETE' });
        if (res.ok) {
          setBooks(books.filter(b => b.kode_buku !== kode));
          alert("Buku berhasil dihapus!");
        }
      } catch (err) {
        alert("Gagal menghapus dari database");
      }
    }
  };

 const handleUpdate = async (e) => {
    e.preventDefault();

    // 1. Bersihkan data: Hilangkan titik ribuan dan pastikan jadi ANGKA
    // Ini supaya 65.000 tidak jadi 65 (karena titik dianggap koma desimal)
    const dataToUpdate = {
        ...editingBook,
        harga_jual: parseFloat(String(editingBook.harga_jual).replace(/\./g, '')), 
        stok_saat_ini: parseInt(editingBook.stok_saat_ini, 10)
    };

    try {
        // TETAP PAKAI PORT 5000
        const res = await fetch(`http://localhost:5000/api/update/${editingBook.kode_buku}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToUpdate) // Kirim data yang sudah bersih
        });

        if (res.ok) {
            // Update tampilan state lokal
            setBooks(books.map(b => b.kode_buku === editingBook.kode_buku ? dataToUpdate : b));
            setEditingBook(null); 
            alert("Data berhasil diperbarui permanen!");
        } else {
            const errorData = await res.json();
            alert("Gagal: " + (errorData.message || "Terjadi kesalahan server"));
        }
    } catch (err) {
        console.error("Update Error:", err);
        alert("Koneksi ke server port 5000 gagal.");
    }
};

 const handleAdd = async (e) => {
  e.preventDefault();

  // 1. Membersihkan data sebelum dikirim ke Backend
  // Penting agar PostgreSQL tidak bingung dengan tipe data (terutama harga dan stok)
  const dataToSend = {
    ...newBook,
    // Menghapus titik ribuan (misal: "50.000" jadi 50000) agar masuk sebagai angka murni
    harga_jual: parseFloat(String(newBook.harga_jual || 0).replace(/\./g, '')),
    // Memastikan stok adalah angka bulat
    stok_saat_ini: parseInt(newBook.stok_saat_ini || 0, 10),
    // ISBN dikirim sebagai teks
    isbn_unnik: newBook.isbn_unnik
  };

  try {
    const res = await fetch('http://localhost:5000/api/tambah', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(dataToSend)
    });
    
    const result = await res.json();

    if (res.ok) {
      // Jika berhasil simpan:
      alert("Buku berhasil disimpan ke database!");
      
      loadData(); // Memperbarui tabel secara otomatis
      setIsAdding(false); // Menutup form tambah buku
      
      // Reset semua field form ke kosong (Termasuk ISBN)
      setNewBook({ 
        judul: '', 
        kategori: '', 
        harga_jual: '', 
        image_url: '', 
        stok_saat_ini: '', 
        isbn_unnik: '' 
      }); 
    } else {
      // Menampilkan pesan error spesifik dari backend (misal: ISBN duplikat)
      alert("Gagal: " + (result.message || "Gagal menyimpan ke server."));
    }
  } catch (err) {
    console.error("Error Tambah:", err);
    alert("Terjadi kesalahan koneksi ke server. Pastikan Backend (port 5000) sudah jalan.");
  }
};

  return (
    <div className="admin-page-container">
      <header className="admin-nav-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ⬅️ KEMBALI
        </button>
        <h1>MANAJEMEN PRODUK</h1>
        <div className="admin-user-info">
          Admin: <span>{user?.username || 'Admin'}</span>
        </div>
      </header>

      {/* FORM TAMBAH */}
      {isAdding && (
        <div className="add-form-container">
          <h3>Tambah Buku Baru</h3>
          <form onSubmit={handleAdd} className="admin-form">
            <input placeholder="Judul" required value={newBook.judul} onChange={e => setNewBook({...newBook, judul: e.target.value})} />
            <input placeholder="Kategori" required value={newBook.kategori} onChange={e => setNewBook({...newBook, kategori: e.target.value})} />
            <input placeholder="ISBN" value={newBook.isbn_unnik} onChange={e => setNewBook({...newBook, isbn_unnik: e.target.value})} />
            <input placeholder="Harga" type="number" required value={newBook.harga_jual} onChange={e => setNewBook({...newBook, harga_jual: e.target.value})} />
            <input placeholder="Stok" type="number" value={newBook.stok_saat_ini} onChange={e => setNewBook({...newBook, stok_saat_ini: e.target.value})} />
            <input placeholder="URL Gambar" value={newBook.image_url} onChange={e => setNewBook({...newBook, image_url: e.target.value})} />
            <div className="form-actions">
                <button type="submit" className="save-btn">Simpan</button>
                <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* FORM EDIT */}
      {editingBook && (
        <div className="add-form-container">
          <h3>Edit Data: {editingBook.judul}</h3>
          <form onSubmit={handleUpdate} className="admin-form">
            <input placeholder="Judul" value={editingBook.judul} onChange={e => setEditingBook({...editingBook, judul: e.target.value})} />
            <input placeholder="Kategori" value={editingBook.kategori} onChange={e => setEditingBook({...editingBook, kategori: e.target.value})} />
            <input placeholder="ISBN" value={editingBook.isbn_unnik || ''} onChange={e => setEditingBook({...editingBook, isbn_unnik: e.target.value})} />
            <input placeholder="Harga" type="number" value={editingBook.harga_jual} onChange={e => setEditingBook({...editingBook, harga_jual: e.target.value})} />
            <input placeholder="Stok" type="number" value={editingBook.stok_saat_ini} onChange={e => setEditingBook({...editingBook, stok_saat_ini: e.target.value})} />
            <input placeholder="URL Gambar" value={editingBook.image_url} onChange={e => setEditingBook({...editingBook, image_url: e.target.value})} />
            <div className="form-actions">
                <button type="submit" className="save-btn">Simpan Perubahan Permanen</button>
                <button type="button" className="cancel-btn" onClick={() => setEditingBook(null)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrapper">
        <div className="table-header-actions">
            <button className="add-new-btn" onClick={() => setIsAdding(true)}>
            + TAMBAH BUKU BARU
            </button>
        </div>

        <table className="admin-product-table">
          <thead>
            <tr>
              <th className="col-img">Gambar</th>
              <th className="col-judul">Judul</th>
              <th className="col-kategori">Kategori</th>
              <th className="col-stok">Stok</th>
              <th className="col-harga">Harga</th>
              <th className="col-aksi">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? books.map((book) => (
              <tr key={book.kode_buku}>
                <td className="col-img">
                  <img src={book.image_url || 'https://via.placeholder.com/600x800?text=No+Image'} alt={book.judul} className="admin-table-img" />
                </td>
                <td className="col-judul">{book.judul}</td>
                <td className="col-kategori">{book.kategori}</td>
                <td className="col-stok">{book.stok_saat_ini || 0}</td>
                <td className="col-harga">Rp {Number(book.harga_jual)?.toLocaleString('id-ID')}</td>
                <td className="col-aksi">
                  <div className="action-btns">
                    <button className="edit-btn" onClick={() => setEditingBook(book)}>EDIT</button>
                    <button className="delete-btn" onClick={() => handleDelete(book.kode_buku)}>HAPUS</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  {loading ? "Memuat data..." : "Data kosong"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProduct;