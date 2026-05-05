import { Link } from 'react-router';
import { Music, Disc3, Headphones, TrendingUp, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API } from '../config/api';


export function Home() {
  const [featuredRecords, setFeaturedRecords] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);

  useEffect(() => {
    fetch(API.products.list)
      .then(res => res.json())
      .then(data => {
        if(data.success && data.data) {
          setFeaturedRecords(data.data.slice(0, 4));
          setNewReleases(data.data.slice(4, 8));
        }
      })
      .catch(err => console.error("Error fetching records: ", err));
  }, []);

  return (
    <div className="page page-white">
      {/* Hero */}
      <section style={{borderBottom:'2px solid #000'}}>
        <div className="container" style={{padding:'2rem 1rem'}}>
          <div className="hero-grid">
            <div className="hero-card" style={{background:'#facc15'}}>
              <div className="hero-card-bg" style={{backgroundImage:`url(${API.images}/Photo-New-disc.png)`}}></div>
              <div className="hero-card-content">
                <h1>ĐĨA MỚI</h1>
                <p style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'2rem'}}>Trải nghiệm âm nhạc cực đỉnh với chất lượng hoàn thiện tuyệt đối.</p>
                <Link to="/shop" className="btn btn-primary" style={{width:'max-content',fontSize:'1.25rem'}}>
                  Săn Ngay <ArrowRight style={{width:24,height:24}} />
                </Link>
              </div>
            </div>
            <div className="hero-card" style={{background:'#dc2626',color:'#fff'}}>
              <div className="hero-card-bg" style={{backgroundImage:`url(${API.images}/Photo-Vintage-disc.png)`,opacity:0.5}}></div>
              <div className="hero-card-content">
                <h1 style={{color:'#000'}}>ĐĨA VINTAGE</h1>
                <p style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'2rem',color:'#000'}}>Hơn 5000+ đĩa qua sử dụng được kiểm tra và lọc kĩ lưỡng.</p>
                <Link to="/shop" className="btn btn-secondary" style={{width:'max-content',fontSize:'1.25rem'}}>
                  Khám Phá <ArrowRight style={{width:24,height:24}} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo */}
      <section className="promo-banner">
        <img src={`${API.images}/DEMO_PROMO-1.jpg`} alt="Promo" />
        <div className="promo-overlay">
          <div className="promo-card">
            <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem',color:'#000',fontFamily:'var(--font-heading)'}}>BIG SALE MÙA HÈ ☀️</h2>
            <p style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem',color:'#000'}}>Giảm đến 30% cho tất cả đĩa than Pop & Rock</p>
            <Link to="/shop" className="btn btn-yellow" style={{display:'inline-block'}}>Mua ngay kẻo lỡ</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{padding:'4rem 0',background:'#f9fafb',borderBottom:'2px solid #000'}}>
        <div className="container">
          <div className="grid-3">
            <div className="feature-card">
              <div className="feature-icon" style={{background:'#facc15'}}><Disc3 style={{width:32,height:32}} /></div>
              <h3 style={{fontWeight:700,fontSize:'1.25rem',marginBottom:'0.5rem',textTransform:'uppercase'}}>Chất Lượng Cao Cấp</h3>
              <p style={{color:'#1f2937',fontWeight:500}}>Tuyển chọn tỉ mỉ các đĩa than trong tình trạng hoàn hảo.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{background:'#f472b6'}}><Headphones style={{width:32,height:32}} /></div>
              <h3 style={{fontWeight:700,fontSize:'1.25rem',marginBottom:'0.5rem',textTransform:'uppercase'}}>Tuyển Chọn Chuyên Gia</h3>
              <p style={{color:'#1f2937',fontWeight:500}}>Bởi những người am hiểu nghệ thuật đĩa than.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{background:'#60a5fa'}}><Music style={{width:32,height:32}} /></div>
              <h3 style={{fontWeight:700,fontSize:'1.25rem',marginBottom:'0.5rem',textTransform:'uppercase'}}>Đa Dạng Thể Loại</h3>
              <p style={{color:'#1f2937',fontWeight:500}}>Từ jazz, rock đến soul và electronic - chúng tôi có tất cả.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Records */}
      <section style={{padding:'4rem 0',borderBottom:'2px solid #000'}}>
        <div className="container">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem',paddingBottom:'1rem',borderBottom:'4px solid #000'}}>
            <h2 className="section-title">Featured Records</h2>
            <Link to="/shop" className="btn btn-secondary btn-sm">XEM TẤT CẢ →</Link>
          </div>
          <div className="grid-4">
            {featuredRecords.map((record) => (
              <Link key={record.id} to={`/product/${record.id}`} className="product-card">
                <div className="product-card-img">
                  <img src={record.image} alt={record.title} />
                  <div className="product-card-badge">{record.genre}</div>
                </div>
                <div className="product-card-info">
                  <h3 className="product-card-title line-clamp-1">{record.title}</h3>
                  <p className="product-card-artist line-clamp-1">{record.artist}</p>
                  <div className="product-card-price">{Number(record.price).toLocaleString('vi-VN')}đ</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{padding:'4rem 0',background:'#f9fafb',borderBottom:'2px solid #000'}}>
        <div className="container">
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'2rem',paddingBottom:'1rem',borderBottom:'4px solid #000'}}>
            <div style={{background:'#dc2626',padding:'0.5rem',border:'2px solid #000'}}><TrendingUp style={{width:32,height:32,color:'#fff'}} /></div>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <div className="grid-4">
            {newReleases.map((record) => (
              <Link key={record.id} to={`/product/${record.id}`} className="product-card">
                <div className="product-card-img">
                  <img src={record.image} alt={record.title} />
                  <div className="product-card-badge" style={{background:'#000',color:'#fff',left:'0.5rem',right:'auto'}}>NEW</div>
                </div>
                <div className="product-card-info">
                  <h3 className="product-card-title line-clamp-1">{record.title}</h3>
                  <p className="product-card-artist line-clamp-1">{record.artist}</p>
                  <div className="product-card-price">{Number(record.price).toLocaleString('vi-VN')}đ</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}