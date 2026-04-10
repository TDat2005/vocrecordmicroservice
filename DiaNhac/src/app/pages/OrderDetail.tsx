import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Package, Truck, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';
import { API_BASE } from '../config/api';

export function OrderDetail() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    const user = loggedInUser ? JSON.parse(loggedInUser) : null;
    const url = `${API_BASE}/orders.php?action=order_detail&order_id=${id}${user && user.customer_id ? `&customer_id=${user.customer_id}` : ''}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
           setOrderData(data.data);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen pt-24 text-center font-bold">ĐANG TẢI...</div>;

  if (!orderData || !orderData.info) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h2 className="text-3xl font-bold uppercase mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Không tìm thấy đơn hàng</h2>
        <Link to="/account" className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black uppercase">Quay lại</Link>
      </div>
    );
  }

  const { info, items } = orderData;

  const statuses = [
    { id: 'choxacnhan', label: 'CHỜ XÁC NHẬN', icon: Clock },
    { id: 'dangchuanbihang', label: 'ĐANG CHUẨN BỊ', icon: Package },
    { id: 'danggiaohang', label: 'ĐANG GIAO', icon: Truck },
    { id: 'hoanthanh', label: 'HOÀN THÀNH', icon: CheckCircle2 }
  ];

  let currentStatusIndex = statuses.findIndex(s => s.id === info.TrangThai);
  const isCanceled = info.TrangThai === 'dahuy';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
            <Link to="/account" className="text-black font-bold uppercase hover:underline mb-4 inline-block">← QUAY LẠI TÀI KHOẢN</Link>
            <h1 className="text-4xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>CHI TIẾT ĐƠN HÀNG #{info.MaDH}</h1>
            <p className="text-gray-600 font-bold uppercase mt-2">ĐẶT NGÀY: {new Date(info.NgayDat).toLocaleString('vi-VN')}</p>
        </div>

        {/* Timeline */}
        <div className="bg-white border-2 border-black p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <h2 className="text-2xl font-bold mb-8 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>TRẠNG THÁI ĐƠN HÀNG</h2>
           
           {isCanceled ? (
              <div className="flex items-center gap-4 text-red-600 border-2 border-red-600 p-4 font-bold bg-red-50">
                  <XCircle className="w-8 h-8" />
                  <span className="text-xl uppercase">ĐƠN HÀNG ĐÃ BỊ HỦY</span>
              </div>
           ) : (
                <div className="relative flex justify-between items-center w-full">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-black z-0 transition-all duration-500" 
                         style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}></div>
                    
                    {statuses.map((s, idx) => {
                        const Icon = s.icon;
                        const isCompleted = idx <= currentStatusIndex;
                        const isActive = idx === currentStatusIndex;
                        return (
                            <div key={s.id} className="relative z-10 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center mb-2 transition-colors duration-300
                                    ${isCompleted ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className={`text-xs md:text-sm font-bold uppercase ${isActive ? 'text-black' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5"/> THÔNG TIN GIAO HÀNG
                </h3>
                <div className="space-y-2 font-bold text-sm uppercase">
                    <p><span className="text-gray-500">Người nhận:</span> {info.NguoiNhan || 'N/A'}</p>
                    <p><span className="text-gray-500">Số điện thoại:</span> {info.SDTNhan || 'N/A'}</p>
                    <p><span className="text-gray-500">Địa chỉ:</span> {info.DiaChiGiao}</p>
                    <p><span className="text-gray-500">Ghi chú:</span> {info.GhiChu || 'Không có'}</p>
                </div>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5"/> THÔNG TIN THANH TOÁN
                </h3>
                <div className="space-y-2 font-bold text-sm uppercase">
                    <p><span className="text-gray-500">Phương thức:</span> {info.ThanhToanHinhThuc?.toUpperCase() || 'COD'}</p>
                    <p><span className="text-gray-500">Trạng thái:</span> 
                        <span className={`ml-2 px-2 py-1 border-2 border-black ${info.TrangThaiTT === 'dathanhtoan' ? 'bg-green-400' : 'bg-yellow-400'}`}>
                            {info.TrangThaiTT === 'dathanhtoan' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                        </span>
                    </p>
                    {info.MaGiaoDich && (
                        <p><span className="text-gray-500">Mã giao dịch:</span> {info.MaGiaoDich}</p>
                    )}
                </div>
            </div>
        </div>

        {/* Sản phẩm */}
        <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold uppercase mb-6 border-b-2 border-black pb-2">SẢN PHẨM ĐÃ ĐẶT</h3>
            <div className="space-y-4 mb-6">
                {items.map((item: any) => (
                    <div key={item.MaCTDH} className="flex gap-4 border-2 border-black p-4 items-center">
                        <div className="w-20 h-20 bg-gray-100 border-2 border-black shrink-0">
                            <img src={item.HinhAnh} alt={item.TenSP} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold uppercase text-lg line-clamp-1">{item.TenSP}</h4>
                            <p className="text-sm font-bold text-gray-600 line-clamp-1">{item.NgheSi}</p>
                        </div>
                        <div className="text-right shrink-0 font-bold">
                            <p className="text-sm text-gray-600">SL: {item.SoLuong}</p>
                            <p className="text-lg">{Number(item.DonGia).toLocaleString('vi-VN')}đ</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="border-t-2 border-black mt-4 pt-4 text-right">
                <span className="font-bold text-gray-500 uppercase mr-4">TỔNG TIỀN PHẢI TRẢ:</span>
                <span className="text-3xl font-black">{Number(info.TongTien).toLocaleString('vi-VN')}đ</span>
            </div>
        </div>

      </div>
    </div>
  );
}
