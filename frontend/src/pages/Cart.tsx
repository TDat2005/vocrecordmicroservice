import { useState } from 'react';
import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API } from '../config/api';


export function Cart() {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart, appliedDiscount, setAppliedDiscount } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    setLoading(true);
    fetch(API.products.checkDiscount, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput, cartTotal: getCartTotal() }) })
    .then(res => res.json())
    .then(data => { setLoading(false); if (data.success) { setAppliedDiscount({ code: data.data.code, amount: data.data.discountAmount }); alert(data.message); } else { alert(data.message); } })
    .catch(() => { setLoading(false); alert('Có lỗi xảy ra khi áp dụng mã!'); });
  };

  if (items.length === 0) {
    return (
      <div className="page page-gray" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'4rem 0'}}>
        <div style={{textAlign:'center',width:'90%',maxWidth:'32rem',border:'2px solid #000',padding:'3rem',background:'#fff'}}>
          <ShoppingBag style={{width:96,height:96,margin:'0 auto 1.5rem'}} />
          <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Giỏ hàng trống</h2>
          <p style={{fontWeight:500,marginBottom:'2rem'}}>Bạn chưa thêm Sản phẩm nào vào giỏ hàng.</p>
          <Link to="/shop" className="btn btn-primary">Quay Về Cửa Hàng</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-gray">
      <div className="container" style={{padding:'2rem 1rem'}}>
        <div style={{marginBottom:'2rem',borderBottom:'2px solid #000',paddingBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h1 className="section-title" style={{fontSize:'2.5rem'}}>GIỎ HÀNG</h1>
          <button onClick={clearCart} className="btn btn-danger btn-sm">Xóa Tất Cả</button>
        </div>

        <div className="cart-grid">
          <div>
            <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
              {items.map((item) => (
                <div key={item.id} className="cart-item" style={{marginBottom:'-2px'}}>
                  <div className="cart-item-img">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="cart-item-details">
                    <Link to={`/product/${item.id}`} className="cart-item-title line-clamp-2">{item.title}</Link>
                    <p style={{color:'#4b5563',fontWeight:700,textTransform:'uppercase',marginTop:'0.25rem',fontSize:'0.875rem'}}>{item.artist}</p>
                    <p style={{fontWeight:700,marginTop:'0.5rem'}}>{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="cart-qty-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cart-qty-btn"><Minus style={{width:16,height:16}} /></button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="cart-qty-btn"><Plus style={{width:16,height:16}} /></button>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                    <div style={{fontWeight:700,fontSize:'1.25rem'}}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                    <button onClick={() => removeFromCart(item.id)} style={{width:40,height:40,border:'2px solid #000',display:'flex',alignItems:'center',justifyContent:'center',background:'none',cursor:'pointer',transition:'all 0.2s'}} title="Xóa"><Trash2 style={{width:20,height:20}} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="neo-card" style={{position:'sticky',top:'6rem'}}>
              <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem',fontFamily:'var(--font-heading)'}}>CỘNG GIỎ HÀNG</h2>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.5rem',fontWeight:700,fontSize:'0.875rem',textTransform:'uppercase'}}>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #000',paddingBottom:'1rem'}}><span style={{color:'#4b5563'}}>Tạm tính</span><span>{getCartTotal().toLocaleString('vi-VN')}đ</span></div>
                <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px solid #000',paddingBottom:'1rem'}}><span style={{color:'#4b5563'}}>Phí vận chuyển</span><span>MIỄN PHÍ</span></div>
                {appliedDiscount && (
                  <div style={{display:'flex',justifyContent:'space-between',borderBottom:'2px dashed #000',paddingBottom:'1rem',color:'#dc2626'}}><span>GIẢM GIÁ ({appliedDiscount.code})</span><span>-{appliedDiscount.amount.toLocaleString('vi-VN')}đ</span></div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.5rem'}}><span style={{fontSize:'1.125rem'}}>Tổng</span><span style={{fontSize:'1.5rem',fontWeight:900}}>{(getCartTotal() - (appliedDiscount?.amount || 0)).toLocaleString('vi-VN')}đ</span></div>
              </div>
              <div style={{marginBottom:'1.5rem'}}>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:900,textTransform:'uppercase',marginBottom:'0.5rem'}}>Mã Giảm Giá</label>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} placeholder="NHẬP MÃ TẠI ĐÂY" className="form-input" style={{flex:1,fontSize:'0.875rem',fontWeight:700,textTransform:'uppercase'}} />
                  <button onClick={handleApplyCoupon} disabled={loading} className="btn btn-primary btn-sm">{loading ? '...' : 'ÁP DỤNG'}</button>
                </div>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-full" style={{fontSize:'1.125rem'}}>Tiến Hành Thanh Toán</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}