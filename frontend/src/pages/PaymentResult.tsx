import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, XCircle } from 'lucide-react';

export function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'success' | 'cancel' | 'loading'>('loading');

  useEffect(() => {
    const cancelParam = searchParams.get('cancel');
    const statusParam = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');
    if (cancelParam === 'true' || statusParam === 'CANCELLED') setStatus('cancel');
    else if (orderCode) setStatus('success');
    else setStatus('cancel');
  }, [searchParams]);

  return (
    <div className="page page-gray" style={{padding:'4rem 0'}}>
      <div className="container" style={{display:'flex',justifyContent:'center'}}>
        <div style={{background:'#fff',border:'4px solid #000',padding:'2.5rem',maxWidth:'32rem',width:'100%',textAlign:'center',boxShadow:'12px 12px 0 0 rgba(0,0,0,1)'}}>
          {status === 'loading' && <h2 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase'}}>Đang xử lý kết quả...</h2>}
          {status === 'success' && (
            <>
              <CheckCircle2 style={{width:96,height:96,color:'#22c55e',margin:'0 auto 1.5rem'}} />
              <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem'}}>Thanh Toán Thành Công!</h2>
              <p style={{fontSize:'1.125rem',fontWeight:700,color:'#374151',marginBottom:'2rem',borderTop:'2px solid #000',borderBottom:'2px solid #000',padding:'1rem 0'}}>Cảm ơn bạn đã mua sắm tại Vọc Records. Đơn hàng của bạn sẽ sớm được xử lý.</p>
              <Link to="/account" className="btn btn-primary btn-full">QUẢN LÝ ĐƠN HÀNG</Link>
            </>
          )}
          {status === 'cancel' && (
            <>
              <XCircle style={{width:96,height:96,color:'#dc2626',margin:'0 auto 1.5rem'}} />
              <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem'}}>Thanh Toán Thất Bại</h2>
              <p style={{fontSize:'1.125rem',fontWeight:700,color:'#374151',marginBottom:'2rem',borderTop:'2px solid #000',borderBottom:'2px solid #000',padding:'1rem 0'}}>Giao dịch đã bị huỷ hoặc có lỗi xảy ra. Hãy thử lại sau nhé.</p>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <Link to="/checkout" className="btn btn-yellow btn-full">THỬ LẠI</Link>
                <Link to="/shop" className="btn btn-secondary btn-full">QUAY LẠI CỬA HÀNG</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
