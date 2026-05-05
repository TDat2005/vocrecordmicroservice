import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Package, Truck, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';
import { API } from '../config/api';

export function OrderDetail() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API.orders.detail(id!)).then(res => res.json()).then(data => { if(data.success) setOrderData(data.data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="page page-gray" style={{paddingTop:'6rem',textAlign:'center',fontWeight:700}}>ĐANG TẢI...</div>;
  if (!orderData || !orderData.info) {
    return (<div className="page page-gray" style={{paddingTop:'6rem',textAlign:'center'}}><h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem',fontFamily:'var(--font-heading)'}}>Không tìm thấy đơn hàng</h2><Link to="/account" className="btn btn-primary">Quay lại</Link></div>);
  }

  const { info, items } = orderData;
  const statuses = [
    { id: 'choxacnhan', label: 'CHỜ XÁC NHẬN', icon: Clock },
    { id: 'dangchuanbihang', label: 'ĐANG CHUẨN BỊ', icon: Package },
    { id: 'danggiaohang', label: 'ĐANG GIAO', icon: Truck },
    { id: 'hoanthanh', label: 'HOÀN THÀNH', icon: CheckCircle2 }
  ];
  let currentStatusIndex = statuses.findIndex(s => s.id === info.status);
  const isCanceled = info.status === 'dahuy';

  return (
    <div className="page page-gray" style={{padding:'3rem 0'}}>
      <div className="container" style={{maxWidth:'56rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <Link to="/account" style={{fontWeight:700,textTransform:'uppercase',display:'inline-block',marginBottom:'1rem'}}>← QUAY LẠI TÀI KHOẢN</Link>
          <h1 className="section-title">CHI TIẾT ĐƠN HÀNG #{info.id}</h1>
          <p style={{color:'#4b5563',fontWeight:700,textTransform:'uppercase',marginTop:'0.5rem'}}>ĐẶT NGÀY: {new Date(info.createdAt).toLocaleString('vi-VN')}</p>
        </div>

        {/* Timeline */}
        <div className="neo-card" style={{marginBottom:'2rem'}}>
          <h2 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'2rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>TRẠNG THÁI ĐƠN HÀNG</h2>
          {isCanceled ? (
            <div style={{display:'flex',alignItems:'center',gap:'1rem',color:'#dc2626',border:'2px solid #dc2626',padding:'1rem',fontWeight:700,background:'#fef2f2'}}><XCircle style={{width:32,height:32}} /><span style={{fontSize:'1.25rem',textTransform:'uppercase'}}>ĐƠN HÀNG ĐÃ BỊ HỦY</span></div>
          ) : (
            <div style={{position:'relative',display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%'}}>
              <div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:'100%',height:4,background:'#e5e7eb',zIndex:0}}></div>
              <div style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',height:4,background:'#000',zIndex:0,transition:'width 0.5s',width:`${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%`}}></div>
              {statuses.map((s, idx) => {
                const Icon = s.icon;
                const isCompleted = idx <= currentStatusIndex;
                const isActive = idx === currentStatusIndex;
                return (
                  <div key={s.id} style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center'}}>
                    <div style={{width:48,height:48,borderRadius:'50%',border:'4px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.5rem',background: isCompleted ? '#000' : '#e5e7eb',color: isCompleted ? '#fff' : '#9ca3af'}}><Icon style={{width:24,height:24}} /></div>
                    <span style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',color: isActive ? '#000' : isCompleted ? '#374151' : '#9ca3af'}}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid-2" style={{marginBottom:'2rem'}}>
          <div className="neo-card neo-card-sm">
            <h3 style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><Truck style={{width:20,height:20}} /> THÔNG TIN GIAO HÀNG</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',fontWeight:700,fontSize:'0.875rem',textTransform:'uppercase'}}>
              <p><span style={{color:'#6b7280'}}>Người nhận:</span> {info.recipient_name || 'N/A'}</p>
              <p><span style={{color:'#6b7280'}}>Số điện thoại:</span> {info.recipient_phone || 'N/A'}</p>
              <p><span style={{color:'#6b7280'}}>Địa chỉ:</span> {info.address}</p>
              <p><span style={{color:'#6b7280'}}>Ghi chú:</span> {info.note || 'Không có'}</p>
            </div>
          </div>
          <div className="neo-card neo-card-sm">
            <h3 style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><CreditCard style={{width:20,height:20}} /> THÔNG TIN THANH TOÁN</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',fontWeight:700,fontSize:'0.875rem',textTransform:'uppercase'}}>
              <p><span style={{color:'#6b7280'}}>Phương thức:</span> {info.payment_method?.toUpperCase() || 'COD'}</p>
              <p><span style={{color:'#6b7280'}}>Trạng thái:</span> <span style={{marginLeft:'0.5rem',padding:'0.25rem 0.5rem',border:'2px solid #000',background: info.payment?.status === 'dathanhtoan' ? '#4ade80' : '#facc15'}}>{info.payment?.status === 'dathanhtoan' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}</span></p>
              {info.payment?.transaction_number && (<p><span style={{color:'#6b7280'}}>Mã giao dịch:</span> {info.payment.transaction_number}</p>)}
            </div>
          </div>
        </div>

        <div className="neo-card">
          <h3 style={{fontSize:'1.25rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem',borderBottom:'2px solid #000',paddingBottom:'0.5rem'}}>SẢN PHẨM ĐÃ ĐẶT</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.5rem'}}>
            {items.map((item: any) => (
              <div key={item.id} style={{display:'flex',gap:'1rem',border:'2px solid #000',padding:'1rem',alignItems:'center'}}>
                <div style={{width:80,height:80,background:'#f3f4f6',border:'2px solid #000',flexShrink:0,overflow:'hidden'}}><img src={item.product?.image || ''} alt={item.product?.name || ''} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>
                <div style={{flex:1,minWidth:0}}><h4 style={{fontWeight:700,textTransform:'uppercase',fontSize:'1.125rem'}} className="line-clamp-1">{item.product?.name || `Sản phẩm #${item.product_id}`}</h4><p style={{fontSize:'0.875rem',fontWeight:700,color:'#4b5563'}} className="line-clamp-1">{item.product?.artist || ''}</p></div>
                <div style={{textAlign:'right',flexShrink:0,fontWeight:700}}><p style={{fontSize:'0.875rem',color:'#4b5563'}}>SL: {item.quantity}</p><p style={{fontSize:'1.125rem'}}>{Number(item.price).toLocaleString('vi-VN')}đ</p></div>
              </div>
            ))}
          </div>
          <div style={{borderTop:'2px solid #000',marginTop:'1rem',paddingTop:'1rem',textAlign:'right'}}><span style={{fontWeight:700,color:'#6b7280',textTransform:'uppercase',marginRight:'1rem'}}>TỔNG TIỀN PHẢI TRẢ:</span><span style={{fontSize:'1.875rem',fontWeight:900}}>{Number(info.total).toLocaleString('vi-VN')}đ</span></div>
        </div>
      </div>
    </div>
  );
}
