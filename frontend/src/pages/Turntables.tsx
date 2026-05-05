import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Filter } from 'lucide-react';
import { API } from '../config/api';

export function Turntables() {
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const categoryName = 'Máy Quay Đĩa (Turntable)';

  useEffect(() => {
    fetch(API.products.list).then(res => res.json()).then(data => { if(data.success && data.data) setRecords(data.data.filter((r:any) => r.genre === categoryName)); }).catch(err => console.error(err));
  }, []);

  const filteredRecords = [...records].sort((a, b) => { switch (sortBy) { case 'price-low': return a.price - b.price; case 'price-high': return b.price - a.price; case 'year': return b.year - a.year; default: return a.title.localeCompare(b.title); } });
  const formatPrice = (price: number) => Number(price).toLocaleString('vi-VN') + 'đ';

  return (
    <div className="page page-gray">
      <div className="category-hero" style={{background:'#2563eb',color:'#fff'}}>
        <div className="container"><h1>MÂM ĐĨA</h1><p>Khám phá bộ sưu tập mâm đĩa tiêu chuẩn. Tối ưu trải nghiệm analog.</p></div>
      </div>
      <div className="container" style={{padding:'2rem 1rem'}}>
        <div className="shop-layout">
          <aside className="shop-sidebar">
            <div className="shop-sidebar-inner">
              <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle"><span style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><Filter style={{width:20,height:20}} /> BỘ LỌC</span><span>{showFilters ? '-' : '+'}</span></button>
              <div className={`filter-content ${showFilters ? 'show' : ''}`}>
                <div><h3 className="filter-title">SẮP XẾP THEO</h3><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select"><option value="name">Tên (A-Z)</option><option value="price-low">Giá (Thấp đến Cao)</option><option value="price-high">Giá (Cao đến Thấp)</option><option value="year">Năm (Mới nhất)</option></select></div>
              </div>
            </div>
          </aside>
          <main className="shop-main">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem'}}><p style={{fontWeight:700,textTransform:'uppercase'}}>HIỂN THỊ <span style={{fontSize:'1.25rem',background:'#facc15',border:'2px solid #000',padding:'0.25rem 0.5rem'}}>{filteredRecords.length}</span> SẢN PHẨM</p></div>
            {filteredRecords.length === 0 ? (<div className="empty-state"><p>Chưa có sản phẩm Mâm đĩa nào.</p></div>) : (
              <div className="grid-3">
                {filteredRecords.map((record) => (
                  <Link key={record.id} to={`/product/${record.id}`} className="product-card">
                    <div className="product-card-img"><img src={record.image} alt={record.title} /><div className="product-card-badge">{record.genre}</div></div>
                    <div className="product-card-info"><h3 className="product-card-title line-clamp-1">{record.title}</h3><p className="product-card-artist line-clamp-1">{record.artist}</p><div style={{marginTop:'auto'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}><span className="product-card-price">{formatPrice(record.price)}</span><span className="product-card-year">{record.year}</span></div><div>{record.stock > 0 ? <span className="badge-stock badge-in-stock">Còn hàng</span> : <span className="badge-stock badge-out-stock">Hết hàng</span>}</div></div></div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
