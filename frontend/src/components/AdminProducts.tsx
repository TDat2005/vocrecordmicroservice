import { useState, useEffect } from 'react';
import { API } from '../config/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    fetch(API.products.list).then(res => res.json()).then(data => {
      if (data.success) setProducts(data.data);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const payload: any = Object.fromEntries(fd.entries());

    if (editingProduct) {
      try {
        const res = await fetch(API.products.update(editingProduct.id), { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
        const d = await res.json();
        if (d.success) { alert('Cập nhật thành công!'); setEditingProduct(null); setShowForm(false); fetchProducts(); }
        else alert('Lỗi: ' + d.message);
      } catch { alert('Lỗi kết nối!'); }
    } else {
      payload.stock = 0;
      try {
        const res = await fetch(API.products.create, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
        const d = await res.json();
        if (d.success) { alert('Thêm sản phẩm thành công!'); setShowForm(false); (e.target as HTMLFormElement).reset(); fetchProducts(); }
        else alert('Lỗi: ' + d.message);
      } catch { alert('Lỗi kết nối!'); }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA SẢN PHẨM NÀY?')) return;
    try {
      const res = await fetch(API.products.remove(id), { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      const d = await res.json();
      if (d.success) { alert('Đã xóa!'); fetchProducts(); } else alert(d.message);
    } catch { alert('Lỗi kết nối!'); }
  };

  const handleEdit = (p: any) => {
    fetch(API.products.detail(p.id)).then(r => r.json()).then(data => {
      if (data.success) { setEditingProduct(data.data); setShowForm(true); }
    });
  };

  const handleAdd = () => { setEditingProduct(null); setShowForm(true); };
  const handleCancel = () => { setEditingProduct(null); setShowForm(false); };

  const filtered = products.filter(p =>
    (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id?.toString().includes(searchQuery)
  );

  if (showForm) {
    const p = editingProduct;
    return (
      <div className="neo-card" style={{ maxWidth: '42rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
            {p ? `Sửa Sản Phẩm #${p.id}` : 'Thêm Sản Phẩm Mới'}
          </h2>
          <button onClick={handleCancel} className="btn btn-secondary btn-sm">HUỶ BỎ</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label className="form-label">Tên sản phẩm *</label><input name="title" defaultValue={p?.title || ''} required className="form-input" /></div>
          <div className="grid-2">
            <div><label className="form-label">Nghệ sĩ *</label><input name="artist" defaultValue={p?.artist || ''} required className="form-input" /></div>
            <div><label className="form-label">Thể loại *</label>
              <select name="genre" defaultValue={p?.genre || 'Đĩa Than (Vinyl)'} required className="form-select">
                <option value="Đĩa Than (Vinyl)">Đĩa Than (Vinyl)</option><option value="Cassette">Cassette</option>
                <option value="Máy Quay Đĩa (Turntable)">Máy Quay Đĩa</option><option value="Phụ Kiện">Phụ Kiện</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div><label className="form-label">Giá bán (VNĐ) *</label><input type="number" name="price" defaultValue={p?.price || ''} required className="form-input" /></div>
            <div><label className="form-label">Năm phát hành</label><input type="number" name="year" defaultValue={p?.year || 2024} className="form-input" /></div>
          </div>
          <div><label className="form-label">Tình trạng kinh doanh</label>
            <select name="status" defaultValue={p?.status || 'conhang'} className="form-select">
              <option value="conhang">Đang bán</option><option value="preorder">Pre-order</option><option value="ngungkinhdoanh">Ngừng kinh doanh</option>
            </select>
          </div>
          <div><label className="form-label">URL Hình ảnh *</label><input name="image" defaultValue={p?.image || 'https://images.unsplash.com/photo-1603048588665-791ca8aea617'} required className="form-input" /></div>
          <div><label className="form-label">Mô tả sản phẩm</label><textarea name="description" rows={4} defaultValue={p?.description || ''} className="form-textarea" style={{ border: '2px solid #000' }} placeholder="Nhập mô tả chi tiết..." /></div>
          {p && (
            <div style={{ padding: '0.75rem', background: '#f3f4f6', border: '2px dashed #9ca3af', fontSize: '0.875rem', fontWeight: 700, color: '#6b7280' }}>
              ⚠️ TỒN KHO HIỆN TẠI: {p.stock ?? 0} — Số lượng tồn kho chỉ thay đổi qua Phiếu Nhập Kho (Quản Lý Kho).
            </div>
          )}
          <button type="submit" className={`btn ${p ? 'btn-yellow' : 'btn-primary'} btn-full`} style={{ marginTop: '0.5rem' }}>
            {p ? 'CẬP NHẬT THAY ĐỔI' : 'LƯU SẢN PHẨM MỚI'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase' }}>Quản Lý Sản Phẩm</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleAdd} className="btn btn-primary"><Plus style={{ width: 20, height: 20 }} /> THÊM MỚI</button>
          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #000', padding: '0.5rem' }}>
            <Search style={{ width: 20, height: 20, marginRight: '0.5rem', color: '#6b7280' }} />
            <input type="text" placeholder="TÌM KIẾM..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ outline: 'none', fontWeight: 700, textTransform: 'uppercase', width: '14rem', border: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '2px solid #000', overflow: 'hidden', boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead><tr><th>MÃ SP</th><th>SẢN PHẨM</th><th>NGHỆ SĨ</th><th>PHÂN LOẠI</th><th>GIÁ BÁN</th><th>TRẠNG THÁI</th><th style={{ textAlign: 'center' }}>THAO TÁC</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>KHÔNG TÌM THẤY</td></tr>}
              {filtered.map(sp => (
                <tr key={sp.id} style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}>
                  <td>SP-{sp.id}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>{sp.title || sp.name}</td>
                  <td>{sp.artist}</td>
                  <td style={{ fontSize: '0.75rem' }}>{sp.genre}</td>
                  <td>{Number(sp.price).toLocaleString('vi-VN')}đ</td>
                  <td>
                    <span style={{ padding: '0.25rem 0.5rem', border: '2px solid #000', background: sp.status === 'ngungkinhdoanh' ? '#ef4444' : '#4ade80', color: sp.status === 'ngungkinhdoanh' ? '#fff' : '#000', fontSize: '0.75rem', fontWeight: 700 }}>
                      {sp.status === 'ngungkinhdoanh' ? 'NGỪNG KD' : 'ĐANG BÁN'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(sp)} style={{ background: '#60a5fa', padding: '0.5rem', border: '2px solid #000', cursor: 'pointer' }} title="Sửa"><Edit2 style={{ width: 16, height: 16 }} /></button>
                      <button onClick={() => handleDelete(sp.id)} style={{ background: '#dc2626', color: '#fff', padding: '0.5rem', border: '2px solid #000', cursor: 'pointer' }} title="Xóa"><Trash2 style={{ width: 16, height: 16 }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
