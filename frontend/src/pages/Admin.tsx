import { useState, useEffect } from 'react';
import { API } from '../config/api';
import { LayoutDashboard, Package, ShoppingCart, Users, Warehouse, Menu, Trash2, Edit, Search, PenTool, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminEmployees } from '../components/AdminEmployees';
import { AdminDiscounts } from '../components/AdminDiscounts';

type MenuSection = 'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'blog' | 'employees' | 'discounts';

export function Admin() {

  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ todayRevenue: 0, todayOrders: 0, totalProducts: 0, totalCustomers: 0, topProducts: [] as any[]});
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
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
  if (user && user.role === 'admin') menuItems.push({ id: 'employees' as MenuSection, label: 'NHÂN SỰ', icon: Users });

  const fetchDashboard = () => { fetch(API.orders.dashboard).then(res => res.json()).then(data => { if(data.success) setStats(data.data); }).catch(console.error); fetch(API.orders.revenue).then(res => res.json()).then(data => { if(data.success) setRevenueData(data.data); }).catch(console.error); };
  const fetchOrders = () => { fetch(API.orders.list).then(res => res.json()).then(data => { if(data.success && data.data) { setOrders(data.data.map((o:any) => ({ id: o.id, order_code: 'ORD-' + o.id.toString().padStart(3, '0'), customer: o.recipient_name || ('KH-' + o.customer_id) || 'Khách vãng lai', total: parseFloat(o.total), status: o.status, date: o.created_at || o.createdAt }))); } }).catch(console.error); };
  const fetchCustomers = () => { fetch(API.users.getCustomers).then(res => res.json()).then(data => { if(data.success) setCustomers(data.data); }).catch(console.error); };
  const fetchInventory = () => { fetch(API.products.inventory).then(res => res.json()).then(data => { if(data.success) setInventory(data.data); }).catch(console.error); };

  useEffect(() => {
    if(activeSection === 'dashboard') fetchDashboard();
    else if(activeSection === 'orders') fetchOrders();
    else if(activeSection === 'customers') fetchCustomers();
    else if(activeSection === 'inventory') { fetchInventory(); setEditingProduct(null); setSearchQuery(''); }
  }, [activeSection]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => { try { const res = await fetch(API.orders.updateStatus, { method: 'POST', body: JSON.stringify({order_id: orderId, status}), headers: {'Content-Type': 'application/json'} }); const d = await res.json(); if(d.success) { alert('Cập nhật trạng thái thành công!'); fetchOrders(); } else alert(d.message); } catch(e) { console.error(e); } };
  const handleDeleteProduct = async (productId: number) => { if(!window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA SẢN PHẨM NÀY?")) return; try { const res = await fetch(API.products.remove(productId), { method: 'DELETE', headers: {'Content-Type': 'application/json'} }); const d = await res.json(); if(d.success) { alert('Đã xóa!'); fetchInventory(); } else alert(d.message); } catch(e) { console.error(e); } };
  const handleEditSubmit = async (e: any) => { e.preventDefault(); const formData = new FormData(e.currentTarget); const payload: any = Object.fromEntries(formData.entries()); payload.id = editingProduct.id; try { const res = await fetch(API.products.update(editingProduct.id), { method: 'PUT', body: JSON.stringify(payload), headers: {'Content-Type': 'application/json'} }); const d = await res.json(); if(d.success) { alert('Cập nhật thành công!'); setEditingProduct(null); fetchInventory(); } else alert('Lỗi: ' + d.message); } catch { alert('Lỗi kết nối!'); } };
  const filteredInventory = inventory.filter(sp => sp.name.toLowerCase().includes(searchQuery.toLowerCase()) || sp.id.toString().includes(searchQuery));

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
            <div className="stat-grid">
              {[{label:'DOANH THU HÔM NAY',value:stats.todayRevenue.toLocaleString('vi-VN')+'đ',bg:'#facc15'},{label:'ĐƠN HÀNG HÔM NAY',value:stats.todayOrders,bg:'#f472b6'},{label:'TỔNG SẢN PHẨM',value:stats.totalProducts,bg:'#60a5fa'},{label:'TỔNG KHÁCH HÀNG',value:stats.totalCustomers,bg:'#34d399'}].map((s,i)=>(
                <div key={i} className="stat-card" style={{background:s.bg}}><div className="stat-card-label">{s.label}</div><div className="stat-card-value">{s.value}</div></div>
              ))}
            </div>
            <div className="neo-card">
              <h3 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem',fontFamily:'var(--font-heading)'}}>Biểu đồ Doanh Thu (30 Ngày Trước)</h3>
              <div style={{width:'100%',height:400}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')}đ`} />
                    <Bar dataKey="revenue" fill="#facc15" stroke="#000" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="neo-card" style={{fontWeight:700}}>
              <h3 style={{fontSize:'1.5rem',textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem',marginBottom:'1rem'}}>SẢN PHẨM BÁN CHẠY</h3>
              <div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>TÊN SP</th><th>ĐÃ BÁN</th><th>DOANH THU</th></tr></thead><tbody>{stats.topProducts.map((p,i)=>(<tr key={i}><td style={{textTransform:'uppercase'}}>{p.name} <span style={{fontSize:'0.75rem',color:'#6b7280'}}>({p.artist})</span></td><td>{p.sales}</td><td style={{color:'#15803d'}}>{Number(p.revenue).toLocaleString('vi-VN')}đ</td></tr>))}</tbody></table></div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="neo-card" style={{maxWidth:'42rem'}}>
            <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Thêm Sản Phẩm Mới</h2>
            <form onSubmit={async(e)=>{e.preventDefault();const fd=new FormData(e.currentTarget);const p=Object.fromEntries(fd.entries());try{const r=await fetch(API.products.create,{method:'POST',body:JSON.stringify(p),headers:{'Content-Type':'application/json'}});const d=await r.json();if(d.success){alert('Thêm thành công!');(e.target as HTMLFormElement).reset();}else alert('Lỗi: '+d.message);}catch{alert('Lỗi kết nối!');}}} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div><label className="form-label">Tên sản phẩm *</label><input name="title" required className="form-input" /></div>
              <div className="grid-2"><div><label className="form-label">Nghệ sĩ *</label><input name="artist" required className="form-input" /></div><div><label className="form-label">Thể loại *</label><select name="genre" required className="form-select"><option value="Đĩa Than (Vinyl)">Đĩa Than (Vinyl)</option><option value="Cassette">Cassette</option><option value="Máy Quay Đĩa (Turntable)">Máy Quay Đĩa</option><option value="Phụ Kiện">Phụ Kiện</option></select></div></div>
              <div className="grid-2"><div><label className="form-label">Giá bán (VNĐ) *</label><input type="number" name="price" required className="form-input" /></div><div><label className="form-label">Số lượng *</label><input type="number" name="stock" required className="form-input" /></div></div>
              <div className="grid-2"><div><label className="form-label">Năm phát hành</label><input type="number" name="year" defaultValue={2024} required className="form-input" /></div><div><label className="form-label">Tình trạng</label><select name="status" required className="form-select"><option value="conhang">Còn hàng</option><option value="saphethang">Sắp hết hàng</option><option value="hethang">Hết hàng</option><option value="preorder">Pre-order</option><option value="ngungkinhdoanh">Ngừng kinh doanh</option></select></div></div>
              <div><label className="form-label">URL Hình ảnh *</label><input name="image" required defaultValue="https://images.unsplash.com/photo-1603048588665-791ca8aea617" className="form-input" /></div>
              <button type="submit" className="btn btn-primary btn-full" style={{marginTop:'1rem'}}>LƯU CƠ SỞ DỮ LIỆU</button>
            </form>
          </div>
        );
      case 'orders':
        return (<div className="neo-card"><h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Quản Lý Đơn Hàng</h2><div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>MÃ ĐH</th><th>KHÁCH HÀNG</th><th>THỜI GIAN</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th></tr></thead><tbody>{orders.length===0&&<tr><td colSpan={5} style={{textAlign:'center'}}>TRỐNG</td></tr>}{orders.map(o=>(<tr key={o.id}><td>{o.order_code}</td><td>{o.customer}</td><td>{new Date(o.date).toLocaleString('vi-VN')}</td><td>{o.total.toLocaleString('vi-VN')}đ</td><td><select value={o.status} onChange={(e)=>handleUpdateOrderStatus(o.id,e.target.value)} className="form-select" style={{width:'auto',padding:'0.25rem 0.5rem',fontSize:'0.75rem'}}><option value="choxacnhan">CHỜ X.NHẬN</option><option value="daxacnhan">ĐÃ XÁC NHẬN</option><option value="danggiaohang">ĐANG GIAO</option><option value="hoanthanh">HOÀN THÀNH</option><option value="dahuy">ĐÃ HỦY</option></select></td></tr>))}</tbody></table></div></div>);
      case 'customers':
        return (<div className="neo-card"><h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Danh Sách Khách Hàng</h2><div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>ID</th><th>HỌ TÊN</th><th>EMAIL</th><th>ĐƠN ĐÃ ĐẶT</th><th>TỔNG CHI TIÊU</th></tr></thead><tbody>{customers.length===0&&<tr><td colSpan={5} style={{textAlign:'center'}}>TRỐNG</td></tr>}{customers.map(c=>(<tr key={c.id}><td>KH-{c.id}</td><td>{c.full_name || c.name}</td><td>{c.email}</td><td>{c.totalOrders || 0} đơn</td><td>{Number(c.totalSpent || 0).toLocaleString('vi-VN')}đ</td></tr>))}</tbody></table></div></div>);
      case 'inventory':
        if(editingProduct) {
          return (
            <div className="neo-card" style={{maxWidth:'42rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}><h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Sửa Sản Phẩm #{editingProduct.id}</h2><button onClick={()=>setEditingProduct(null)} className="btn btn-secondary btn-sm">HUỶ BỎ</button></div>
              <form onSubmit={handleEditSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div><label className="form-label">Tên sản phẩm *</label><input name="title" defaultValue={editingProduct.name} required className="form-input" /></div>
                <div className="grid-2"><div><label className="form-label">Nghệ sĩ *</label><input name="artist" defaultValue={editingProduct.artist} className="form-input" /></div><div><label className="form-label">Thể loại *</label><select name="genre" defaultValue={editingProduct.genre} required className="form-select"><option value="Đĩa Than (Vinyl)">Đĩa Than (Vinyl)</option><option value="Cassette">Cassette</option><option value="Máy Quay Đĩa (Turntable)">Máy Quay Đĩa</option><option value="Phụ Kiện">Phụ Kiện</option></select></div></div>
                <div className="grid-2"><div><label className="form-label">Giá bán *</label><input type="number" name="price" defaultValue={editingProduct.price} required className="form-input" /></div><div><label className="form-label">Số lượng *</label><input type="number" name="stock" defaultValue={editingProduct.stock} required className="form-input" /></div></div>
                <div className="grid-2"><div><label className="form-label">Năm phát hành</label><input type="number" name="year" defaultValue={editingProduct.year||2024} required className="form-input" /></div><div><label className="form-label">Tình trạng</label><select name="status" defaultValue={editingProduct.status||'conhang'} required className="form-select"><option value="conhang">Còn hàng</option><option value="saphethang">Sắp hết hàng</option><option value="hethang">Hết hàng</option><option value="preorder">Pre-order</option><option value="ngungkinhdoanh">Ngừng kinh doanh</option></select></div></div>
                <div><label className="form-label">URL Hình ảnh *</label><input name="image" defaultValue={editingProduct.image} className="form-input" /></div>
                <button type="submit" className="btn btn-yellow btn-full" style={{marginTop:'1rem'}}>CẬP NHẬT THAY ĐỔI</button>
              </form>
            </div>
          );
        }
        return (
          <div className="neo-card">
            <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',gap:'1rem'}}>
              <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Quản Lý Kho Hàng</h2>
              <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                <button onClick={()=>{const ids=prompt("Nhập mã SP và số lượng (VD: 1:10, 2:5):");if(!ids)return;const parsed=ids.split(',').map(s=>{const[id,qty]=s.split(':');return{id:parseInt(id),qty:parseInt(qty),price:0};});const note=prompt("Ghi chú phiếu nhập:");fetch(API.products.importStock,{method:'POST',body:JSON.stringify({admin_id:user.customer_id,items:parsed,note}),headers:{'Content-Type':'application/json'}}).then(r=>r.json()).then(d=>{if(d.success){alert('Nhập kho thành công!');fetchInventory();}else alert('Lỗi: '+d.message);});}} className="btn btn-primary btn-sm">+ Nhập kho</button>
                <div style={{display:'flex',alignItems:'center',border:'2px solid #000',padding:'0.5rem'}}><Search style={{width:20,height:20,marginRight:'0.5rem',color:'#6b7280'}} /><input type="text" placeholder="TÌM KIẾM..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} style={{outline:'none',fontWeight:700,textTransform:'uppercase',width:'16rem',border:'none'}} /></div>
              </div>
            </div>
            <div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>MÃ SP</th><th>SẢN PHẨM</th><th>PHÂN LOẠI</th><th>GIÁ BÁN</th><th>TỒN KHO</th><th style={{textAlign:'center'}}>THAO TÁC</th></tr></thead><tbody>{filteredInventory.length===0&&<tr><td colSpan={6} style={{textAlign:'center'}}>KHÔNG TÌM THẤY</td></tr>}{filteredInventory.map(sp=>(<tr key={sp.id}><td>SP-{sp.id}</td><td style={{textTransform:'uppercase',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sp.name}</td><td style={{textTransform:'uppercase',fontSize:'0.75rem'}}>{sp.genre}</td><td>{Number(sp.price).toLocaleString('vi-VN')}đ</td><td><span style={{padding:'0.25rem 0.5rem',border:'2px solid #000',background:sp.stock>0?'#4ade80':'#ef4444',color:sp.stock>0?'#000':'#fff'}}>{sp.stock>0?sp.stock:'HẾT HÀNG'}</span></td><td style={{textAlign:'center'}}><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}><button onClick={()=>{fetch(API.products.detail(sp.id)).then(res=>res.json()).then(data=>{if(data.success)setEditingProduct({id:sp.id,name:data.data.title,artist:data.data.artist,genre:data.data.genre,price:data.data.price,stock:data.data.stock,image:data.data.image,description:data.data.description});});}} style={{background:'#60a5fa',padding:'0.5rem',border:'2px solid #000',cursor:'pointer'}}><Edit style={{width:20,height:20}} /></button><button onClick={()=>handleDeleteProduct(sp.id)} style={{background:'#dc2626',color:'#fff',padding:'0.5rem',border:'2px solid #000',cursor:'pointer'}}><Trash2 style={{width:20,height:20}} /></button></div></td></tr>))}</tbody></table></div>
          </div>
        );
      case 'blog':
        return (
          <div className="neo-card" style={{maxWidth:'56rem'}}>
            <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Quản Lý Blog & Hướng Dẫn</h2>
            <form onSubmit={(e)=>{e.preventDefault();const fd=new FormData(e.currentTarget);const payload:any=Object.fromEntries(fd.entries());payload.account_id=user.customer_id;fetch(API.content.createPost,{method:'POST',body:JSON.stringify(payload),headers:{'Content-Type':'application/json'}}).then(r=>r.json()).then(d=>{if(d.success){alert('Thêm bài viết thành công!');(e.target as HTMLFormElement).reset();}else alert('Lỗi: '+d.message);});}} style={{border:'2px solid #000',padding:'1.5rem',background:'#f9fafb',display:'flex',flexDirection:'column',gap:'1rem'}}>
              <h3 style={{fontWeight:700,textTransform:'uppercase',fontSize:'1.25rem',marginBottom:'0.5rem'}}>Thêm bài viết mới</h3>
              <div><label className="form-label">Tiêu đề *</label><input name="title" required className="form-input" /></div>
              <div className="grid-2"><div><label className="form-label">Loại bài viết</label><select name="type" className="form-select"><option value="blog">Blog / Tin tức</option><option value="huongdan">Hướng dẫn (Tips)</option></select></div><div><label className="form-label">Trạng thái</label><select name="status" className="form-select"><option value="daxuatban">Xuất bản</option><option value="nhap">Bản nháp</option></select></div></div>
              <div><label className="form-label">Nội dung * (HTML hỗ trợ)</label><textarea name="content" rows={6} required className="form-textarea" style={{border:'2px solid #000'}} /></div>
              <div><label className="form-label">Link Ảnh Cover</label><input name="image" className="form-input" /></div>
              <button type="submit" className="btn btn-primary btn-full">LƯU BÀI VIẾT</button>
            </form>
          </div>
        );
      case 'discounts': return <AdminDiscounts />;
      case 'employees': return <AdminEmployees />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header"><h1>VỌC PANEL</h1></div>
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => { const Icon = item.icon; return (<button key={item.id} onClick={() => setActiveSection(item.id)} className={`admin-nav-btn ${activeSection === item.id ? 'active' : ''}`}><Icon style={{width:20,height:20}} /><span>{item.label}</span></button>); })}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}><button onClick={()=>setSidebarOpen(true)} style={{padding:'0.5rem',border:'2px solid #000',display:'none',cursor:'pointer'}} className="mobile-menu-btn"><Menu style={{width:24,height:24}} /></button><h2>{menuItems.find(i=>i.id===activeSection)?.label}</h2></div>
        </header>
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
}
