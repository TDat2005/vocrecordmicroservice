import { useState, useEffect } from 'react';
import { API } from '../config/api';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Menu,
  Trash2,
  Edit,
  Search,
  PenTool,
  Tag
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { AdminEmployees } from '../components/AdminEmployees';
import { AdminDiscounts } from '../components/AdminDiscounts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type MenuSection = 'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'blog' | 'employees' | 'discounts';

export function Admin() {
  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({ todayRevenue: 0, todayOrders: 0, totalProducts: 0, totalCustomers: 0, topProducts: [] as any[]});
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  
  // Dashboard Chart Data
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // States cho Search và Edit Prod
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // States cho Blog
  const [blogs, setBlogs] = useState<any[]>([]);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // User
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'products' as MenuSection, label: 'THÊM SẢN PHẨM', icon: Package },
    { id: 'inventory' as MenuSection, label: 'KHO HÀNG', icon: Warehouse },
    { id: 'orders' as MenuSection, label: 'ĐƠN HÀNG', icon: ShoppingCart },
    { id: 'customers' as MenuSection, label: 'KHÁCH HÀNG', icon: Users },
    { id: 'blog' as MenuSection, label: 'QUẢN LÝ BLOG', icon: PenTool },
    { id: 'discounts' as MenuSection, label: 'MÃ GIẢM GIÁ', icon: Tag },
  ];

  if (user && user.role === 'admin') {
      menuItems.push({ id: 'employees' as MenuSection, label: 'NHÂN SỰ', icon: Users });
  }

  const fetchDashboard = () => {
      fetch(API.orders.dashboard)
      .then(res => res.json())
      .then(data => { if(data.success) setStats(data.data); })
      .catch(console.error);

      // Fetch Revenue Report cho 30 ngày
      fetch(API.orders.revenue)
      .then(res => res.json())
      .then(data => {
          if(data.success) {
              setRevenueData(data.data);
          }
      }).catch(console.error);
  };

  const fetchOrders = () => {
    fetch(API.orders.list)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
           const formatted = data.data.map((o: any) => ({
              id: o.MaDH,
              order_code: 'ORD-' + o.MaDH.toString().padStart(3, '0'),
              customer: o.HoTen || o.MaKH || 'Khách vãng lai',
              total: parseFloat(o.TongTien),
              status: o.TrangThai,
              date: o.NgayDat
           }));
           setOrders(formatted);
        }
      })
      .catch(console.error);
  };

  const fetchCustomers = () => {
      fetch(API.users.getCustomers)
      .then(res => res.json())
      .then(data => { if(data.success) setCustomers(data.data); })
      .catch(console.error);
  };

  const fetchInventory = () => {
      fetch(API.products.inventory)
      .then(res => res.json())
      .then(data => { if(data.success) setInventory(data.data); })
      .catch(console.error);
  };

  useEffect(() => {
     if(activeSection === 'dashboard') fetchDashboard();
     else if(activeSection === 'orders') fetchOrders();
     else if(activeSection === 'customers') fetchCustomers();
     else if(activeSection === 'inventory') { fetchInventory(); setEditingProduct(null); setSearchQuery(''); }
  }, [activeSection]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
      try {
          const res = await fetch(API.orders.updateStatus, {
              method: 'POST', body: JSON.stringify({order_id: orderId, status: status}), headers: {'Content-Type': 'application/json'}
          });
          const d = await res.json();
          if(d.success) {
              alert('Cập nhật trạng thái thành công!');
              fetchOrders();
          } else alert(d.message);
      } catch(e) { console.error(e); }
  };

  const handleDeleteProduct = async (productId: number) => {
      if(!window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA SẢN PHẨM NÀY KHỎI KHO? HÀNH ĐỘNG KHÔNG THỂ HOÀN TÁC!")) return;
      try {
          const res = await fetch(API.products.remove(productId), {
              method: 'DELETE', headers: {'Content-Type': 'application/json'}
          });
          const d = await res.json();
          if(d.success) {
              alert('Đã xóa thành công!');
              fetchInventory();
          } else alert(d.message);
      } catch(e) { console.error(e); }
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.id = editingProduct.id; // Push ID
    
    try {
        const res = await fetch(API.products.update(editingProduct.id), {
            method: 'PUT', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'}
        });
        const d = await res.json();
        if(d.success) { 
            alert('Cập nhật sản phẩm thành công!'); 
            setEditingProduct(null);
            fetchInventory();
        }
        else alert('Lỗi: ' + d.message);
    } catch(err) { alert('Lỗi kết nối!'); }
  };

  const filteredInventory = inventory.filter(sp => 
     sp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     sp.id.toString().includes(searchQuery)
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-yellow-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                <div className="text-black font-bold uppercase mb-2">DOANH THU HÔM NAY</div>
                <div className="text-3xl font-bold bg-white border-2 border-black px-4 py-2 inline-block">
                  {stats.todayRevenue.toLocaleString('vi-VN')}đ
                </div>
              </div>
              <div className="bg-pink-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                <div className="text-black font-bold uppercase mb-2">ĐƠN HÀNG HÔM NAY</div>
                <div className="text-3xl font-bold bg-white border-2 border-black px-4 py-2 inline-block">{stats.todayOrders}</div>
              </div>
              <div className="bg-blue-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                <div className="text-black font-bold uppercase mb-2">TỔNG SẢN PHẨM</div>
                <div className="text-3xl font-bold bg-white border-2 border-black px-4 py-2 inline-block">{stats.totalProducts}</div>
              </div>
              <div className="bg-emerald-400 border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                <div className="text-black font-bold uppercase mb-2">TỔNG KHÁCH HÀNG</div>
                <div className="text-3xl font-bold bg-white border-2 border-black px-4 py-2 inline-block">{stats.totalCustomers}</div>
              </div>
            </div>

            {/* Biểu đồ Doanh Thu */}
            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-bold uppercase mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Biểu đồ Doanh Thu (30 Ngày Trước)</h3>
                <div className="w-full h-[400px]">
                    <Bar 
                        data={{
                            labels: revenueData.map(r => r.date),
                            datasets: [{
                                label: 'Doanh thu (VNĐ)',
                                data: revenueData.map(r => r.revenue),
                                backgroundColor: '#facc15', // yellow-400
                                borderColor: '#000',
                                borderWidth: 2,
                            }]
                        }} 
                        options={{ responsive: true, maintainAspectRatio: false }} 
                    />
                </div>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-bold">
              <h3 className="text-2xl uppercase border-b-2 border-black pb-2 mb-4">SẢN PHẨM BÁN CHẠY</h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-black text-white">
                          <th className="p-3 border-2 border-black">TÊN SP</th>
                          <th className="p-3 border-2 border-black">ĐÃ BÁN</th>
                          <th className="p-3 border-2 border-black">DOANH THU</th>
                       </tr>
                    </thead>
                    <tbody>
                       {stats.topProducts.map((p, i) => (
                           <tr key={i} className="hover:bg-gray-100">
                               <td className="p-3 border-2 border-black uppercase">{p.name} <span className="text-xs text-gray-500">({p.artist})</span></td>
                               <td className="p-3 border-2 border-black">{p.sales}</td>
                               <td className="p-3 border-2 border-black text-green-700">{Number(p.revenue).toLocaleString('vi-VN')}đ</td>
                           </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Thêm Sản Phẩm Mới</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = Object.fromEntries(formData.entries());
                try {
                    const res = await fetch(API.products.create, {
                        method: 'POST', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'}
                    });
                    const d = await res.json();
                    if(d.success) { alert('Thêm sản phẩm thành công!'); e.currentTarget.reset(); }
                    else alert('Lỗi: ' + d.message);
                } catch(err) { alert('Lỗi kết nối!'); }
            }} className="space-y-4">
               <div>
                  <label className="block text-sm font-bold uppercase mb-2">Tên sản phẩm *</label>
                  <input name="title" required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold uppercase mb-2">Nghệ sĩ *</label>
                    <input name="artist" required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold uppercase mb-2">Thể loại *</label>
                    <select name="genre" required className="w-full px-4 py-3 border-2 border-black focus:outline-none">
                       <option value="Đĩa Than (Vinyl)">Đĩa Than (Vinyl)</option>
                       <option value="Cassette">Cassette</option>
                       <option value="Máy Quay Đĩa (Turntable)">Máy Thu Âm (Turntable)</option>
                       <option value="Phụ Kiện">Phụ Kiện</option>
                    </select>
                 </div>
               </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold uppercase mb-2">Giá bán (VNĐ) *</label>
                      <input type="number" name="price" required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold uppercase mb-2">Số lượng *</label>
                      <input type="number" name="stock" required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold uppercase mb-2">Năm phát hành</label>
                      <input type="number" name="year" defaultValue={2024} required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold uppercase mb-2">Tình trạng</label>
                      <select name="status" required className="w-full px-4 py-3 border-2 border-black focus:outline-none">
                         <option value="conhang">Còn hàng</option>
                         <option value="saphethang">Sắp hết hàng</option>
                         <option value="hethang">Hết hàng</option>
                         <option value="preorder">Pre-order</option>
                         <option value="ngungkinhdoanh">Ngừng kinh doanh</option>
                      </select>
                   </div>
                 </div>
               <div>
                  <label className="block text-sm font-bold uppercase mb-2">URL Hình ảnh *</label>
                  <input name="image" required defaultValue="https://images.unsplash.com/photo-1603048588665-791ca8aea617" className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
               </div>
               <button type="submit" className="bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors w-full mt-4">LƯU CƠ SỞ DỮ LIỆU</button>
            </form>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-bold mb-6 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Quản Lý Đơn Hàng</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-bold">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-3 border-2 border-black">MÃ ĐH</th>
                            <th className="p-3 border-2 border-black">KHÁCH HÀNG</th>
                            <th className="p-3 border-2 border-black">THỜI GIAN</th>
                            <th className="p-3 border-2 border-black">TỔNG TIỀN</th>
                            <th className="p-3 border-2 border-black">TRẠNG THÁI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 && <tr><td colSpan={5} className="p-4 border-2 border-black text-center">TRỐNG</td></tr>}
                        {orders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50">
                                <td className="p-3 border-2 border-black">{o.order_code}</td>
                                <td className="p-3 border-2 border-black">{o.customer}</td>
                                <td className="p-3 border-2 border-black">{new Date(o.date).toLocaleString('vi-VN')}</td>
                                <td className="p-3 border-2 border-black">{o.total.toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 border-2 border-black">
                                    <select 
                                        value={o.status} 
                                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                        className="border-2 border-black bg-white p-1 focus:outline-none cursor-pointer uppercase text-xs"
                                    >
                                        <option value="choxacnhan">CHỜ X.NHẬN</option>
                                        <option value="daxacnhan">ĐÃ XÁC NHẬN</option>
                                        <option value="danggiaohang">ĐANG GIAO</option>
                                        <option value="hoanthanh">HOÀN THÀNH</option>
                                        <option value="dahuy">ĐÃ HỦY</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-bold mb-6 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Danh Sách Khách Hàng</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-bold">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-3 border-2 border-black">ID</th>
                            <th className="p-3 border-2 border-black">HỌ TÊN</th>
                            <th className="p-3 border-2 border-black">EMAIL</th>
                            <th className="p-3 border-2 border-black">ĐƠN ĐÃ ĐẶT</th>
                            <th className="p-3 border-2 border-black">TỔNG CHI TIÊU</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 && <tr><td colSpan={5} className="p-4 border-2 border-black text-center">TRỐNG</td></tr>}
                        {customers.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="p-3 border-2 border-black">KH-{c.id}</td>
                                <td className="p-3 border-2 border-black">{c.name}</td>
                                <td className="p-3 border-2 border-black">{c.email}</td>
                                <td className="p-3 border-2 border-black">{c.totalOrders} đơn</td>
                                <td className="p-3 border-2 border-black">{Number(c.totalSpent).toLocaleString('vi-VN')}đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        );

      case 'inventory':
        if(editingProduct) {
            return (
              <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Sửa Sản Phẩm #{editingProduct.id}</h2>
                    <button onClick={() => setEditingProduct(null)} className="px-4 py-2 border-2 border-black font-bold uppercase hover:bg-black hover:text-white">HUỶ BỎ</button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                   <div>
                      <label className="block text-sm font-bold uppercase mb-2">Tên sản phẩm *</label>
                      <input name="title" defaultValue={editingProduct.name} required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold uppercase mb-2">Nghệ sĩ *</label>
                        <input name="artist" defaultValue={editingProduct.artist} className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold uppercase mb-2">Thể loại *</label>
                        <select name="genre" defaultValue={editingProduct.genre} required className="w-full px-4 py-3 border-2 border-black focus:outline-none">
                           <option value="Đĩa Than (Vinyl)">Đĩa Than (Vinyl)</option>
                           <option value="Cassette">Cassette</option>
                           <option value="Máy Quay Đĩa (Turntable)">Máy Quy Đĩa (Turntable)</option>
                           <option value="Phụ Kiện">Phụ Kiện</option>
                        </select>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold uppercase mb-2">Giá bán (VNĐ) *</label>
                        <input type="number" name="price" defaultValue={editingProduct.price} required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold uppercase mb-2">Số lượng *</label>
                        <input type="number" name="stock" defaultValue={editingProduct.stock} required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold uppercase mb-2">Năm phát hành</label>
                        <input type="number" name="year" defaultValue={editingProduct.year || 2024} required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold uppercase mb-2">Tình trạng</label>
                        <select name="status" defaultValue={editingProduct.status || 'conhang'} required className="w-full px-4 py-3 border-2 border-black focus:outline-none">
                           <option value="conhang">Còn hàng</option>
                           <option value="saphethang">Sắp hết hàng</option>
                           <option value="hethang">Hết hàng</option>
                           <option value="preorder">Pre-order</option>
                           <option value="ngungkinhdoanh">Ngừng kinh doanh</option>
                        </select>
                     </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold uppercase mb-2">URL Hình ảnh *</label>
                      <input name="image" defaultValue={editingProduct.image} className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                   </div>
                   <button type="submit" className="bg-yellow-400 text-black px-8 py-4 font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-colors w-full mt-4">CẬP NHẬT THAY ĐỔI</button>
                </form>
              </div>
            );
        }

        return (
          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Quản Lý Kho Hàng</h2>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button onClick={() => {
                        const ids = prompt("Nhập danh sách mã sản phẩm và số lượng (VD: 1:10, 2:5):");
                        if(!ids) return;
                        const parsed = ids.split(',').map(s => { const [id, qty] = s.split(':'); return {id: parseInt(id), qty: parseInt(qty), price: 0}; });
                        if(parsed.length === 0) return;
                        
                        const note = prompt("Nhập ghi chú phiếu nhập:");
                        
                        fetch(API.products.importStock, {
                            method: 'POST',
                            body: JSON.stringify({admin_id: user.customer_id, items: parsed, note}),
                            headers: {'Content-Type': 'application/json'}
                        }).then(r => r.json()).then(d => {
                            if(d.success) { alert('Nhập kho thành công!'); fetchInventory(); }
                            else alert('Lỗi: ' + d.message);
                        });
                    }} className="bg-black text-white px-4 py-2 border-2 border-black font-bold uppercase hover:bg-yellow-400 hover:text-black">
                        + Nhập kho
                    </button>
                    <div className="flex items-center border-2 border-black p-2 w-full md:w-auto">
                        <Search className="w-5 h-5 mx-2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="TÌM KIẾM THEO TÊN / ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="focus:outline-none font-bold uppercase placeholder-gray-400 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-bold">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-3 border-2 border-black">MÃ SP</th>
                            <th className="p-3 border-2 border-black">SẢN PHẨM</th>
                            <th className="p-3 border-2 border-black">PHÂN LOẠI</th>
                            <th className="p-3 border-2 border-black">GIÁ BÁN</th>
                            <th className="p-3 border-2 border-black">TỒN KHO</th>
                            <th className="p-3 border-2 border-black text-center">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.length === 0 && <tr><td colSpan={6} className="p-4 border-2 border-black text-center">KHÔNG TÌM THẤY SẢN PHẨM</td></tr>}
                        {filteredInventory.map(sp => (
                            <tr key={sp.id} className="hover:bg-gray-50">
                                <td className="p-3 border-2 border-black">SP-{sp.id}</td>
                                <td className="p-3 border-2 border-black uppercase truncate max-w-xs">{sp.name}</td>
                                <td className="p-3 border-2 border-black uppercase text-xs">{sp.genre}</td>
                                <td className="p-3 border-2 border-black">{Number(sp.price).toLocaleString('vi-VN')}đ</td>
                                <td className="p-3 border-2 border-black">
                                    <span className={`px-2 py-1 border-2 border-black ${sp.stock > 0 ? 'bg-green-400' : 'bg-red-500 text-white'}`}>
                                        {sp.stock > 0 ? sp.stock : 'HẾT HÀNG'}
                                    </span>
                                </td>
                                <td className="p-1 border-2 border-black text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => {
                                            // Fetch detail before edit
                                            fetch(API.products.detail(sp.id))
                                            .then(res => res.json())
                                            .then(data => {
                                                if(data.success) {
                                                    setEditingProduct({
                                                        id: sp.id,
                                                        name: data.data.title,
                                                        artist: data.data.artist,
                                                        genre: data.data.genre,
                                                        price: data.data.price,
                                                        stock: data.data.stock,
                                                        image: data.data.image,
                                                        description: data.data.description
                                                    });
                                                }
                                            });
                                        }} className="bg-blue-400 text-black p-2 border-2 border-black hover:bg-white transition-colors">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(sp.id)} className="bg-red-600 text-white p-2 border-2 border-black hover:bg-white hover:text-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        );

      case 'blog':
        return (
          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>Quản Lý Blog & Hướng Dẫn</h2>
             </div>
             
             <form onSubmit={(e) => {
                 e.preventDefault();
                 const fd = new FormData(e.currentTarget);
                 const payload = Object.fromEntries(fd.entries());
                 payload.account_id = user.customer_id; // giả định
                 fetch(API.content.createPost, {
                     method: 'POST', body: JSON.stringify(payload), headers:{'Content-Type': 'application/json'}
                 }).then(r => r.json()).then(d => {
                     if(d.success) { alert('Thêm bài viết thành công!'); e.currentTarget.reset(); }
                     else alert('Lỗi: ' + d.message);
                 });
             }} className="border-2 border-black p-6 mb-8 bg-gray-50">
                 <h3 className="font-bold uppercase mb-4 text-xl">Thêm bài viết mới</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-bold uppercase mb-2">Tiêu đề *</label>
                         <input name="title" required className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-bold uppercase mb-2">Loại bài viết</label>
                             <select name="type" className="w-full px-4 py-3 border-2 border-black focus:outline-none">
                                <option value="blog">Blog / Tin tức</option>
                                <option value="huongdan">Hướng dẫn (Tips)</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-sm font-bold uppercase mb-2">Trạng thái</label>
                             <select name="status" className="w-full px-4 py-3 border-2 border-black focus:outline-none">
                                <option value="daxuatban">Xuất bản</option>
                                <option value="nhap">Bản nháp</option>
                             </select>
                         </div>
                     </div>
                     <div>
                         <label className="block text-sm font-bold uppercase mb-2">Nội dung * (HTML hỗ trợ)</label>
                         <textarea name="content" rows={6} required className="w-full px-4 py-3 border-2 border-black focus:outline-none resize-y" />
                     </div>
                     <div>
                         <label className="block text-sm font-bold uppercase mb-2">Link Ảnh Cover</label>
                         <input name="image" className="w-full px-4 py-3 border-2 border-black focus:outline-none" />
                     </div>
                     <button type="submit" className="bg-black text-white px-8 py-4 font-bold uppercase border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors w-full">LƯU BÀI VIẾT</button>
                 </div>
             </form>
          </div>
        );
      case 'discounts':
        return <AdminDiscounts />;
      case 'employees':
        return <AdminEmployees />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-body">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-yellow-400 border-r-4 border-black">
        <div className="p-6 border-b-4 border-black bg-black text-white text-center">
          <h1 className="font-bold text-2xl uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
            VỌC PANEL
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase transition-all border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b-4 border-black px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 border-2 border-black"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                  {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
            </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{renderContent()}</main>
      </div>
    </div>
  );
}
