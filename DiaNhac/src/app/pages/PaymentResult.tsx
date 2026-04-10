import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, XCircle } from 'lucide-react';

export function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'success' | 'cancel' | 'loading'>('loading');
  
  useEffect(() => {
    // PayOS thường trả về cancel=true/false hoặc status=CANCELLED...
    const cancelParam = searchParams.get('cancel');
    const statusParam = searchParams.get('status');
    const orderCode = searchParams.get('orderCode');

    if (cancelParam === 'true' || statusParam === 'CANCELLED') {
      setStatus('cancel');
    } else if (orderCode) {
      setStatus('success');
    } else {
      setStatus('cancel'); // Invalid params
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="bg-white border-4 border-black p-10 max-w-lg w-full text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
          {status === 'loading' && <h2 className="text-2xl font-bold uppercase">Đang xử lý kết quả...</h2>}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold uppercase mb-4 text-black">Thanh Toán Thành Công!</h2>
              <p className="text-lg font-bold text-gray-700 mb-8 border-t-2 border-b-2 border-black py-4">
                Cảm ơn bạn đã mua sắm tại Vọc Records. Đơn hàng của bạn sẽ sớm được xử lý.
              </p>
              <Link to="/account" className="inline-block bg-black text-white px-8 py-4 font-bold border-2 border-black uppercase hover:bg-yellow-400 hover:text-black transition-colors w-full">
                QUẢN LÝ ĐƠN HÀNG
              </Link>
            </>
          )}

          {status === 'cancel' && (
            <>
              <XCircle className="w-24 h-24 text-red-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold uppercase mb-4 text-black">Thanh Toán Thất Bại</h2>
              <p className="text-lg font-bold text-gray-700 mb-8 border-t-2 border-b-2 border-black py-4">
                Giao dịch đã bị huỷ hoặc có lỗi xảy ra. Hãy thử lại sau nhé.
              </p>
              <div className="flex flex-col gap-4">
                <Link to="/checkout" className="inline-block bg-yellow-400 text-black px-8 py-4 font-bold border-2 border-black uppercase hover:bg-black hover:text-white transition-colors w-full">
                  THỬ LẠI
                </Link>
                <Link to="/shop" className="inline-block bg-white text-black px-8 py-4 font-bold border-2 border-black uppercase hover:bg-gray-200 transition-colors w-full">
                  QUAY LẠI CỬA HÀNG
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
