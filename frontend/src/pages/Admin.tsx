import { useState, useEffect } from 'react';
import { API } from '../config/api';
import { LayoutDashboard, Package, ShoppingCart, Users, Warehouse, Menu, Edit, PenTool, Tag, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminEmployees } from '../components/AdminEmployees';
import { AdminDiscounts } from '../components/AdminDiscounts';
import { AdminProducts } from '../components/AdminProducts';
import { AdminInventory } from '../components/AdminInventory';

type MenuSection = 'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'blog' | 'employees' | 'discounts';

export function Admin() {

  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ todayRevenue: 0, todayOrders: 0, totalProducts: 0, totalCustomers: 0, topProducts: [] as any[]});
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [dateStart, setDateStart] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; });
  const [dateEnd, setDateEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'products' as MenuSection, label: 'QUẢN LÝ SẢN PHẨM', icon: Package },
    { id: 'inventory' as MenuSection, label: 'QUẢN LÝ KHO', icon: Warehouse },
    { id: 'orders' as MenuSection, label: 'ĐƠN HÀNG', icon: ShoppingCart },
    { id: 'customers' as MenuSection, label: 'KHÁCH HÀNG', icon: Users },
    { id: 'blog' as MenuSection, label: 'QUẢN LÝ BLOG', icon: PenTool },
    { id: 'discounts' as MenuSection, label: 'MÃ GIẢM GIÁ', icon: Tag },
  ];
  if (user && user.role === 'admin') menuItems.push({ id: 'employees' as MenuSection, label: 'NHÂN SỰ', icon: Users });

  const fetchDashboard = (start?: string, end?: string) => { const s = start || dateStart; const e = end || dateEnd; fetch(`${API.orders.dashboard}?start=${s}&end=${e}`).then(res => res.json()).then(data => { if(data.success) setStats(data.data); }).catch(console.error); fetch(`${API.orders.revenue}?start=${s}&end=${e}`).then(res => res.json()).then(data => { if(data.success) setRevenueData(data.data); }).catch(console.error); };
  const fetchOrders = () => { fetch(API.orders.list).then(res => res.json()).then(data => { if(data.success && data.data) { setOrders(data.data.map((o:any) => ({ id: o.id, order_code: 'ORD-' + o.id.toString().padStart(3, '0'), customer: o.recipient_name || ('KH-' + o.customer_id) || 'Khách vãng lai', total: parseFloat(o.total), status: o.status, date: o.created_at || o.createdAt }))); } }).catch(console.error); };
  const fetchCustomers = () => { fetch(API.users.getCustomers).then(res => res.json()).then(data => { if(data.success) setCustomers(data.data); }).catch(console.error); };
  const fetchPosts = () => { fetch(API.content.posts).then(res => res.json()).then(data => { if(data.success) setBlogPosts(data.data); }).catch(console.error); };

  useEffect(() => {
    if(activeSection === 'dashboard') fetchDashboard();
    else if(activeSection === 'orders') fetchOrders();
    else if(activeSection === 'customers') fetchCustomers();
    else if(activeSection === 'blog') { fetchPosts(); setEditingPost(null); }
  }, [activeSection]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => { try { const res = await fetch(API.orders.updateStatus, { method: 'POST', body: JSON.stringify({order_id: orderId, status}), headers: {'Content-Type': 'application/json'} }); const d = await res.json(); if(d.success) { alert('Cập nhật trạng thái thành công!'); fetchOrders(); } else alert(d.message); } catch(e) { console.error(e); } };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
            <div className="neo-card" style={{padding:'1rem 1.5rem'}}>
              <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'1rem'}}>
                <h3 style={{fontWeight:700,textTransform:'uppercase',margin:0,fontSize:'1rem'}}>KHOẢNG THỜI GIAN:</h3>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <label style={{fontWeight:700,fontSize:'0.875rem'}}>TỪ</label>
                  <input type="date" value={dateStart} onChange={(e)=>setDateStart(e.target.value)} className="form-input" style={{padding:'0.4rem 0.75rem',width:'auto',border:'2px solid #000'}} />
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <label style={{fontWeight:700,fontSize:'0.875rem'}}>ĐẾN</label>
                  <input type="date" value={dateEnd} onChange={(e)=>setDateEnd(e.target.value)} className="form-input" style={{padding:'0.4rem 0.75rem',width:'auto',border:'2px solid #000'}} />
                </div>
                <button onClick={()=>fetchDashboard(dateStart,dateEnd)} className="btn btn-primary btn-sm">XEM THỐNG KÊ</button>
              </div>
            </div>
            <div className="stat-grid">
              {[{label:`DOANH THU (${dateStart===dateEnd?'HÔM NAY':dateStart+' → '+dateEnd})`,value:stats.todayRevenue.toLocaleString('vi-VN')+'đ',bg:'#facc15'},{label:`ĐƠN HÀNG (${dateStart===dateEnd?'HÔM NAY':'KHOẢNG CHỌN'})`,value:stats.todayOrders,bg:'#f472b6'},{label:'TỔNG SẢN PHẨM',value:stats.totalProducts,bg:'#60a5fa'},{label:'TỔNG KHÁCH HÀNG',value:stats.totalCustomers,bg:'#34d399'}].map((s,i)=>(
                <div key={i} className="stat-card" style={{background:s.bg}}><div className="stat-card-label">{s.label}</div><div className="stat-card-value">{s.value}</div></div>
              ))}
            </div>
            <div className="neo-card">
              <h3 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1rem',fontFamily:'var(--font-heading)'}}>Biểu đồ Doanh Thu ({dateStart} → {dateEnd})</h3>
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
              <h3 style={{fontSize:'1.5rem',textTransform:'uppercase',borderBottom:'2px solid #000',paddingBottom:'0.5rem',marginBottom:'1rem'}}>SẢN PHẨM BÁN CHẠY {dateStart!==dateEnd?`(${dateStart} → ${dateEnd})`:''}</h3>
              <div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>TÊN SP</th><th>ĐÃ BÁN</th><th>DOANH THU</th></tr></thead><tbody>{stats.topProducts.map((p,i)=>(<tr key={i}><td style={{textTransform:'uppercase'}}>{p.name} <span style={{fontSize:'0.75rem',color:'#6b7280'}}>({p.artist})</span></td><td>{p.sales}</td><td style={{color:'#15803d'}}>{Number(p.revenue).toLocaleString('vi-VN')}đ</td></tr>))}</tbody></table></div>
            </div>
          </div>
        );
      case 'products': return <AdminProducts />;
      case 'inventory': return <AdminInventory />;
      case 'orders':
        return (<div className="neo-card"><h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Quản Lý Đơn Hàng</h2><div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>MÃ ĐH</th><th>KHÁCH HÀNG</th><th>THỜI GIAN</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th></tr></thead><tbody>{orders.length===0&&<tr><td colSpan={5} style={{textAlign:'center'}}>TRỐNG</td></tr>}{orders.map(o=>(<tr key={o.id}><td>{o.order_code}</td><td>{o.customer}</td><td>{new Date(o.date).toLocaleString('vi-VN')}</td><td>{o.total.toLocaleString('vi-VN')}đ</td><td><select value={o.status} onChange={(e)=>handleUpdateOrderStatus(o.id,e.target.value)} className="form-select" style={{width:'auto',padding:'0.25rem 0.5rem',fontSize:'0.75rem'}}><option value="choxacnhan">CHỜ X.NHẬN</option><option value="daxacnhan">ĐÃ XÁC NHẬN</option><option value="danggiaohang">ĐANG GIAO</option><option value="hoanthanh">HOÀN THÀNH</option><option value="dahuy">ĐÃ HỦY</option></select></td></tr>))}</tbody></table></div></div>);
      case 'customers':
        return (<div className="neo-card"><h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Danh Sách Khách Hàng</h2><div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>ID</th><th>HỌ TÊN</th><th>EMAIL</th><th>ĐƠN ĐÃ ĐẶT</th><th>TỔNG CHI TIÊU</th></tr></thead><tbody>{customers.length===0&&<tr><td colSpan={5} style={{textAlign:'center'}}>TRỐNG</td></tr>}{customers.map(c=>(<tr key={c.id}><td>KH-{c.id}</td><td>{c.full_name || c.name}</td><td>{c.email}</td><td>{c.totalOrders || 0} đơn</td><td>{Number(c.totalSpent || 0).toLocaleString('vi-VN')}đ</td></tr>))}</tbody></table></div></div>);
      case 'blog':
        if (editingPost) {
          return (
            <div className="neo-card" style={{maxWidth:'56rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}><h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Sửa Bài Viết #{editingPost.id}</h2><button onClick={()=>setEditingPost(null)} className="btn btn-secondary btn-sm">HUỶ BỎ</button></div>
              <form onSubmit={async(e)=>{e.preventDefault();const fd=new FormData(e.currentTarget);const payload:any=Object.fromEntries(fd.entries());payload.account_id=user.customer_id;try{const r=await fetch(API.content.updatePost(editingPost.id),{method:'PUT',body:JSON.stringify(payload),headers:{'Content-Type':'application/json'}});const d=await r.json();if(d.success){alert('Cập nhật bài viết thành công!');setEditingPost(null);fetchPosts();}else alert('Lỗi: '+d.message);}catch{alert('Lỗi kết nối!');}}} style={{border:'2px solid #000',padding:'1.5rem',background:'#f9fafb',display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div><label className="form-label">Tiêu đề *</label><input name="title" defaultValue={editingPost.title} required className="form-input" /></div>
                <div className="grid-2"><div><label className="form-label">Loại bài viết</label><select name="type" defaultValue={editingPost.type} className="form-select"><option value="blog">Blog / Tin tức</option><option value="guide">Hướng dẫn (Tips)</option></select></div><div><label className="form-label">Trạng thái</label><select name="status" defaultValue={editingPost.status} className="form-select"><option value="published">Xuất bản</option><option value="draft">Bản nháp</option></select></div></div>
                <div><label className="form-label">Nội dung * (HTML hỗ trợ)</label><textarea name="content" rows={6} defaultValue={editingPost.content} required className="form-textarea" style={{border:'2px solid #000'}} /></div>
                <div><label className="form-label">Link Ảnh Cover</label><input name="image" defaultValue={editingPost.image} className="form-input" /></div>
                <button type="submit" className="btn btn-yellow btn-full">CẬP NHẬT BÀI VIẾT</button>
              </form>
            </div>
          );
        }
        return (
          <div className="neo-card" style={{maxWidth:'56rem'}}>
            <h2 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'1.5rem',textTransform:'uppercase',fontFamily:'var(--font-heading)'}}>Quản Lý Blog & Hướng Dẫn</h2>
            <form onSubmit={(e)=>{e.preventDefault();const fd=new FormData(e.currentTarget);const payload:any=Object.fromEntries(fd.entries());payload.account_id=user.customer_id;fetch(API.content.createPost,{method:'POST',body:JSON.stringify(payload),headers:{'Content-Type':'application/json'}}).then(r=>r.json()).then(d=>{if(d.success){alert('Thêm bài viết thành công!');(e.target as HTMLFormElement).reset();fetchPosts();}else alert('Lỗi: '+d.message);});}} style={{border:'2px solid #000',padding:'1.5rem',background:'#f9fafb',display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'2rem'}}>
              <h3 style={{fontWeight:700,textTransform:'uppercase',fontSize:'1.25rem',marginBottom:'0.5rem'}}>Thêm bài viết mới</h3>
              <div><label className="form-label">Tiêu đề *</label><input name="title" required className="form-input" /></div>
              <div className="grid-2"><div><label className="form-label">Loại bài viết</label><select name="type" className="form-select"><option value="blog">Blog / Tin tức</option><option value="guide">Hướng dẫn (Tips)</option></select></div><div><label className="form-label">Trạng thái</label><select name="status" className="form-select"><option value="published">Xuất bản</option><option value="draft">Bản nháp</option></select></div></div>
              <div><label className="form-label">Nội dung * (HTML hỗ trợ)</label><textarea name="content" rows={6} required className="form-textarea" style={{border:'2px solid #000'}} /></div>
              <div><label className="form-label">Link Ảnh Cover</label><input name="image" className="form-input" /></div>
              <button type="submit" className="btn btn-primary btn-full">LƯU BÀI VIẾT</button>
            </form>
            <h3 style={{fontWeight:700,textTransform:'uppercase',fontSize:'1.25rem',marginBottom:'1rem',borderTop:'2px solid #000',paddingTop:'1.5rem'}}>Danh sách bài viết ({blogPosts.length})</h3>
            <div style={{overflowX:'auto'}}><table className="neo-table"><thead><tr><th>ID</th><th>TIÊU ĐỀ</th><th>LOẠI</th><th>TRẠNG THÁI</th><th>NGÀY TẠO</th><th style={{textAlign:'center'}}>THAO TÁC</th></tr></thead><tbody>{blogPosts.length===0&&<tr><td colSpan={6} style={{textAlign:'center'}}>CHƯA CÓ BÀI VIẾT NÀO</td></tr>}{blogPosts.map(p=>{const d=new Date(p.created_at||p.createdAt);const dateStr=isNaN(d.getTime())?'--':d.toLocaleDateString('vi-VN');return(<tr key={p.id}><td>{p.id}</td><td style={{textTransform:'uppercase',maxWidth:250,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</td><td><span style={{padding:'0.25rem 0.5rem',border:'2px solid #000',background:p.type==='blog'?'#60a5fa':'#a78bfa',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>{p.type==='blog'?'BLOG':'GUIDE'}</span></td><td><span style={{padding:'0.25rem 0.5rem',border:'2px solid #000',background:p.status==='published'?'#4ade80':'#fbbf24',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase'}}>{p.status==='published'?'XUẤT BẢN':'NHÁP'}</span></td><td style={{fontSize:'0.875rem'}}>{dateStr}</td><td style={{textAlign:'center'}}><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}><button onClick={()=>setEditingPost(p)} style={{background:'#60a5fa',padding:'0.5rem',border:'2px solid #000',cursor:'pointer'}}><Edit style={{width:20,height:20}} /></button><button onClick={async()=>{if(!window.confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA BÀI VIẾT NÀY?'))return;try{const r=await fetch(API.content.deletePost(p.id),{method:'DELETE',headers:{'Content-Type':'application/json'}});const d=await r.json();if(d.success){alert('Đã xóa bài viết!');fetchPosts();}else alert('Lỗi: '+d.message);}catch{alert('Lỗi kết nối!');}}} style={{background:'#dc2626',color:'#fff',padding:'0.5rem',border:'2px solid #000',cursor:'pointer'}}><Trash2 style={{width:20,height:20}} /></button></div></td></tr>);})}</tbody></table></div>
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
