import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Filter, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API } from '../config/api';

const genres = [
  "Tất cả", "Đĩa Than (Vinyl)", "Cassette", "Máy Quay Đĩa (Turntable)", "Phụ Kiện",
  "ROCK", "ELECTRONIC", "POP", "JAZZ", "BLUES", "REGGAE", "LATIN", "CLASSICAL", 
  "SOUNDTRACK", "HIP HOP", "FUNK / SOUL", "FOLK", "WORLD", "CHILDREN'S", "CITY POP", 
  "STAGE & SCREEN", "VIỆT NAM", "CHRISTMAS", "SMOOTH JAZZ", "CLASSIC ROCK", 
  "BRASS & MILITARY", "JAPANESE JAZZ", "VOCAL JAZZ"
];

export function Shop() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleQuickAddCart = (e: React.MouseEvent, record: any) => {
    e.preventDefault(); e.stopPropagation();
    if (record.stock <= 0) return;
    addToCart({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image, stock: record.stock });
  };

  const handleQuickWishlist = (e: React.MouseEvent, record: any) => {
    e.preventDefault(); e.stopPropagation();
    const userStr = localStorage.getItem('user');
    if (!userStr) { alert('Vui lòng đăng nhập để sử dụng tính năng yêu thích!'); return; }
    const user = JSON.parse(userStr);
    const customerId = user.customer_id;
    if (!customerId) return;
    if (isInWishlist(record.id)) {
      fetch(API.users.removeWishlist, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ customer_id: customerId, product_id: record.id }) }).then(r => r.json()).then(d => { if (d.success) removeFromWishlist(record.id); });
    } else {
      fetch(API.users.addWishlist, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ customer_id: customerId, product_id: record.id }) }).then(r => r.json()).then(d => {
        if (d.success) addToWishlist({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image, genre: record.genre, year: record.year });
        else alert(d.message);
      });
    }
  };

  useEffect(() => {
    fetch(API.products.list).then(res => res.json()).then(data => { if(data.success && data.data) setRecords(data.data); }).catch(err => console.error(err));
  }, []);

  const removeAccents = (str: string) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const filteredRecords = records
    .filter((record) => {
      const matchesGenre = selectedGenre === 'Tất cả' || record.genre === selectedGenre;
      const searchVal = removeAccents(searchQuery);
      const titleVal = removeAccents(record.title || '');
      const artistVal = removeAccents(record.artist || '');
      
      const matchesSearch = searchQuery === '' || 
        titleVal.includes(searchVal) || 
        artistVal.includes(searchVal);

      return matchesGenre && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'year': return b.year - a.year;
        default: return a.title.localeCompare(b.title);
      }
    });

  useEffect(() => { if (searchQuery) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [searchQuery]);

  const formatPrice = (price: number) => Number(price).toLocaleString('vi-VN') + 'đ';

  return (
    <div className="page page-gray">
      <div className="container" style={{padding:'2rem 1rem'}}>
        <div className="section-border">
          <h1 className="section-title" style={{fontSize:'2.5rem',marginBottom:'1rem'}}>CỬA HÀNG</h1>
          {searchQuery ? (
            <p style={{fontWeight:700,textTransform:'uppercase'}}>Kết quả tìm kiếm cho: "{searchQuery}" ({filteredRecords.length} đĩa than)</p>
          ) : (
            <p style={{fontWeight:700,textTransform:'uppercase'}}>Khám phá bộ sưu tập đầy đủ với {records.length} sản phẩm</p>
          )}
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <div className="shop-sidebar-inner">
              <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle">
                <span style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Filter style={{width:20,height:20}} /> BỘ LỌC</span>
                <span>{showFilters ? '-' : '+'}</span>
              </button>
              <div className={`filter-content ${showFilters ? 'show' : ''}`}>
                <div style={{marginBottom:'2rem'}}>
                  <h3 className="filter-title">THỂ LOẠI</h3>
                  <div className="filter-list custom-scrollbar">
                    {genres.map((genre) => (
                      <label key={genre} className="filter-radio">
                        <input type="radio" name="genre" checked={selectedGenre === genre} onChange={() => setSelectedGenre(genre)} />
                        <span>{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="filter-title">SẮP XẾP THEO</h3>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select">
                    <option value="name">Tên (A-Z)</option>
                    <option value="price-low">Giá (Thấp đến Cao)</option>
                    <option value="price-high">Giá (Cao đến Thấp)</option>
                    <option value="year">Năm (Mới nhất)</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="shop-main">
            {filteredRecords.length === 0 ? (
              <div className="empty-state"><p>Không tìm thấy sản phẩm phù hợp.</p></div>
            ) : (
              <div className="grid-3">
                {filteredRecords.map((record) => (
                  <Link key={record.id} to={`/product/${record.id}`} className="product-card">
                    <div className="product-card-img">
                      <img src={record.image} alt={record.title} />
                      <div className="product-card-badge">{record.genre}</div>
                      <div className="quick-actions">
                        <button onClick={(e) => handleQuickWishlist(e, record)} className="quick-action-btn" style={{background: isInWishlist(record.id) ? '#ef4444' : '#fff', color: isInWishlist(record.id) ? '#fff' : '#000'}} title="Yêu thích">
                          <Heart style={{width:20,height:20}} fill={isInWishlist(record.id) ? 'currentColor' : 'none'} />
                        </button>
                        {record.stock > 0 && (
                          <button onClick={(e) => handleQuickAddCart(e, record)} className="quick-action-btn" style={{background:'#000',color:'#fff'}} title="Thêm vào giỏ hàng">
                            <ShoppingCart style={{width:20,height:20}} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="product-card-info">
                      <h3 className="product-card-title line-clamp-1">{record.title}</h3>
                      <p className="product-card-artist line-clamp-1">{record.artist}</p>
                      <div style={{marginTop:'auto'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                          <span className="product-card-price">{formatPrice(record.price)}</span>
                          <span className="product-card-year">{record.year}</span>
                        </div>
                        <div style={{marginTop:'0.25rem'}}>
                          {record.stock > 0 ? (
                            <span className="badge-stock badge-in-stock">Còn hàng</span>
                          ) : (
                            <span className="badge-stock badge-out-stock">Hết hàng</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}