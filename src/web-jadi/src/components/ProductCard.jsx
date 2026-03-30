import React from 'react';

const ProductCard = ({ book, onAddToCart }) => {
  return (
    <div className="book-card">
      {/* AREA GAMBAR */}
      <div className="book-image">
        <img 
          src={book.image_url} 
          alt={book.judul} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800?text=Cover+Tidak+Ada'; }}
        />
      </div>

      {/* AREA DETAIL */}
      <div className="book-details">
        <span className="book-badge">{book.kategori || 'UMUM'}</span>

        <h2 className="book-title">{book.judul}</h2>
        
        <p className="book-isbn">ISBN: {book.isbn_unik}</p>

        <div className="book-info-row">
          <span className="book-price">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(book.harga_jual)}
          </span>
          <span className="price-separator">|</span>
          <span className="book-stock">Stok: <b>{book.stok_saat_ini}</b></span>
        </div>

        <button className="order-button" onClick={onAddToCart}>
          + KERANJANG
        </button>
      </div>
    </div>
  );
};

export default ProductCard;