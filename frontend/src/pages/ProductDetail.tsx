import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Check, Plus, Minus, Heart, Youtube } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect } from 'react';
import { API } from '../config/api';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [record, setRecord] = useState<any>(null);
  const [relatedRecords, setRelatedRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0); setLoading(true);
    fetch(API.products.detail(id!)).then(res => res.json()).then(data => {
      if (data.success && data.data) {
        setRecord(data.data);
        fetch(`${API.products.list}?category=${data.data.genre}`).then(r => r.json()).then(d => { if (d.success && d.data) setRelatedRecords(d.data.filter((i: any) => i.id != id).slice(0, 4)); });
      }
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  const formatPrice = (price: number) => Number(price).toLocaleString('vi-VN') + 'đ';

  if (loading) return <div className="page page-gray" style={{display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.25rem',textTransform:'uppercase'}}>Đang tải...</div>;
  if (!record) return (<div className="page page-gray" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase'}}>Không tìm thấy sản phẩm</h2><Link to="/shop" className="btn btn-primary">Quay lại cửa hàng</Link></div></div>);

  const handleAddToCart = () => { if (record) { addToCart({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image, stock: record.stock }, quantity); setAdded(true); setTimeout(() => setAdded(false), 2000); } };
  const handleBuyNow = () => { if (record) { addToCart({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image, stock: record.stock }, quantity); navigate('/checkout'); } };
  const handleWishlistToggle = () => {
    const userStr = localStorage.getItem('user'); if (!userStr) { alert('Vui lòng đăng nhập!'); return; }
    const user = JSON.parse(userStr); const customerId = user.customer_id; if (!customerId) return;
    if (isInWishlist(record.id)) { fetch(API.users.removeWishlist, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ customer_id: customerId, product_id: record.id }) }).then(res => res.json()).then(data => { if (data.success) removeFromWishlist(record.id); }); }
    else { fetch(API.users.addWishlist, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ customer_id: customerId, product_id: record.id }) }).then(res => res.json()).then(data => { if (data.success) addToWishlist({ id: record.id, title: record.title, artist: record.artist, price: record.price, image: record.image, genre: record.genre, year: record.year }); else alert(data.message); }); }
  };
  const incrementQuantity = () => { if (quantity < record.stock) setQuantity(quantity + 1); };
  const decrementQuantity = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= record.stock) setQuantity(v); };

  return (
    <div className="page page-white">
      <div className="container" style={{padding:'2rem 1rem'}}>
        <button onClick={() => navigate(-1)} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem',background:'none',border:'none',cursor:'pointer',fontSize:'1rem'}}><ArrowLeft style={{width:20,height:20}} /> QUAY LẠI</button>

        <div className="pd-grid">
          {/* Left: Image */}
          <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
            <div className="pd-image-box"><div className="pd-image-inner"><img src={record.image} alt={record.title} /></div></div>
            <div className="pd-notice">
              <h3><ShoppingCart style={{width:24,height:24}} /> LƯU Ý KHI MUA HÀNG</h3>
              <ul>
                <li>Vui lòng thanh toán 100% đơn hàng có <strong>sản phẩm PRE-ORDER</strong>.</li>
                <li>Giá sản phẩm <strong>PRE-ORDER</strong> cập nhật hàng tuần.</li>
                <li>Vận chuyển: <strong>CÒN HÀNG 1-5 ngày</strong>, <strong>PRE-ORDER 2-5 tuần</strong>.</li>
                <li>Sản phẩm giá <strong>0 đ</strong> vui lòng <strong style={{textDecoration:'underline'}}>LIÊN HỆ</strong>.</li>
                <li><strong>KHÔNG HUỶ/ HOÀN TIỀN</strong> sản phẩm PRE-ORDER.</li>
                <li>Khách có thể <strong>HỦY ĐƠN HÀNG</strong> nếu chưa gửi vận chuyển.</li>
              </ul>
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <div style={{marginBottom:'0.5rem'}}><span style={{display:'inline-block',background:'#000',color:'#fff',padding:'0.25rem 0.75rem',fontSize:'0.875rem',fontWeight:700,textTransform:'uppercase'}}>{record.genre}</span></div>
            <h1 style={{fontSize:'2.5rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>{record.title}</h1>
            <p style={{fontSize:'1.5rem',color:'#1f2937',marginBottom:'1rem',fontWeight:700,textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'1rem'}}>{record.artist}</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'1rem',marginBottom:'1.5rem'}}><span style={{fontSize:'0.875rem',fontWeight:700,background:'#facc15',padding:'0.25rem 0.75rem',border:'2px solid #000',textTransform:'uppercase'}}>NĂM PHÁT HÀNH: {record.year || 'N/A'}</span></div>
            <div style={{fontSize:'2.5rem',fontWeight:700,marginBottom:'1.5rem'}}>{formatPrice(record.price)}</div>
            <div style={{marginBottom:'1.5rem'}}>
              {record.stock > 0 ? (
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#dcfce7',border:'2px solid #000',padding:'0.5rem 1rem',width:'max-content'}}><Check style={{width:20,height:20}} /><span style={{fontWeight:700,textTransform:'uppercase'}}>CÒN HÀNG ({record.stock} SP)</span></div>
              ) : (<span style={{color:'#fff',background:'#dc2626',padding:'0.5rem 1rem',border:'2px solid #000',fontWeight:700,textTransform:'uppercase'}}>HẾT HÀNG</span>)}
            </div>
            <div style={{marginBottom:'2rem',padding:'1rem',border:'2px solid #000',background:'#f9fafb'}}><h3 style={{fontWeight:700,marginBottom:'0.5rem',textTransform:'uppercase'}}>MÔ TẢ SẢN PHẨM</h3><p style={{fontWeight:500,lineHeight:1.7}}>{record.description}</p></div>

            {/* Quantity */}
            {record.stock > 0 && (
              <div style={{marginBottom:'1.5rem'}}>
                <h3 style={{fontWeight:700,marginBottom:'0.75rem',textTransform:'uppercase'}}>SỐ LƯỢNG</h3>
                <div className="cart-qty-control">
                  <button onClick={decrementQuantity} disabled={quantity <= 1} className="cart-qty-btn"><Minus style={{width:16,height:16}} /></button>
                  <input type="number" value={quantity} onChange={handleQuantityChange} min="1" max={record.stock} style={{width:64,height:40,textAlign:'center',borderLeft:'2px solid #000',borderRight:'2px solid #000',fontWeight:700,outline:'none',border:'none',borderInline:'2px solid #000'}} />
                  <button onClick={incrementQuantity} disabled={quantity >= record.stock} className="cart-qty-btn"><Plus style={{width:16,height:16}} /></button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
                <button onClick={handleBuyNow} disabled={record.stock == 0} className="btn btn-primary" style={{flex:1,fontSize:'1.125rem'}}><ShoppingCart style={{width:24,height:24}} /> ĐẶT HÀNG NGAY</button>
                <Link to="/cart" className="btn btn-secondary" style={{whiteSpace:'nowrap'}}>TỚI GIỎ HÀNG</Link>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
                <button onClick={handleAddToCart} disabled={record.stock == 0 || added} className="btn btn-secondary" style={{flex:1}}>{added ? <><Check style={{width:20,height:20}} /> ĐÃ THÊM</> : <><ShoppingCart style={{width:20,height:20}} /> THÊM VÀO GIỎ</>}</button>
                <button onClick={handleWishlistToggle} className="btn" style={{flex:1,background: isInWishlist(record.id) ? '#ec4899' : '#fff',color: isInWishlist(record.id) ? '#fff' : '#000',borderColor: isInWishlist(record.id) ? '#ec4899' : '#000'}}><Heart style={{width:20,height:20}} fill={isInWishlist(record.id) ? '#fff' : 'none'} />{isInWishlist(record.id) ? 'ĐÃ LƯU' : 'YÊU THÍCH'}</button>
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(record.artist + ' ' + record.title + ' full album')}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" title="Nghe thử"><Youtube style={{width:24,height:24}} /> NGHE THỬ</a>
              </div>
            </div>

            {/* Info Table */}
            <div style={{marginTop:'3rem'}}>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem',marginBottom:'1.5rem',fontFamily:'var(--font-heading)'}}>THÔNG TIN ĐĨA</h3>
              <table className="pd-info-table">
                <tbody>
                  <tr><td>Thể Loại</td><td>{record.genre}</td></tr>
                  <tr><td>Định Dạng</td><td>{record.genre.includes('Vinyl') ? 'Vinyl (LP)' : record.genre.includes('Cassette') ? 'Cassette' : 'Thiết bị'}</td></tr>
                  <tr><td>Tình Trạng</td><td style={{fontWeight:700}}>{record.stock > 0 ? 'Brand New (SS)' : 'N/A'}</td></tr>
                  <tr><td>Số Lượng</td><td>1 x {record.genre.includes('Vinyl') ? 'Vinyl' : 'Album'}</td></tr>
                  <tr><td>Năm Sản Xuất</td><td>{record.year || 'Đang cập nhật'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Tracklist */}
            <div style={{marginTop:'3rem'}}>
              <h3 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem',marginBottom:'1.5rem',fontFamily:'var(--font-heading)'}}>TRACKLIST</h3>
              <ul style={{display:'flex',flexDirection:'column',gap:'0.5rem',fontSize:'0.875rem',fontWeight:500}}>
                <li>1. Intro / Title Track</li><li>2. Popular Song 1</li><li>3. Popular Song 2</li><li>4. Interlude</li><li>5. Hidden Gem</li><li>6. Acoustic Version</li><li>7. Extended Mix</li><li>8. Outro</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedRecords.length > 0 && (
          <section style={{marginTop:'4rem'}}>
            <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem',fontFamily:'var(--font-heading)'}}>Sản phẩm cùng thể loại ({record.genre})</h2>
            <div className="grid-4">
              {relatedRecords.map((r) => (
                <Link key={r.id} to={`/product/${r.id}`} className="product-card">
                  <div className="product-card-img"><img src={r.image} alt={r.title} /></div>
                  <div className="product-card-info"><h3 className="product-card-title line-clamp-1">{r.title}</h3><p className="product-card-artist line-clamp-1">{r.artist}</p><div style={{marginTop:'auto'}}><span className="product-card-price">{formatPrice(r.price)}</span></div></div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bar */}
      <div className="mobile-sticky-bar">
        <div style={{display:'flex',flexDirection:'column'}}><span style={{fontSize:10,fontWeight:900,color:'#6b7280',textTransform:'uppercase'}}>Tổng cộng</span><span style={{fontSize:'1.25rem',fontWeight:900,lineHeight:1}}>{formatPrice(record.price * quantity)}</span></div>
        <button onClick={handleBuyNow} disabled={record.stock == 0} className="btn btn-primary btn-sm" style={{flex:1}}>ĐẶT HÀNG NGAY</button>
      </div>
    </div>
  );
}