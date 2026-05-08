import { useState, useEffect } from 'react';
import { API } from '../config/api';
import { Warehouse, Plus, Trash2, History, Search, FileText, PackagePlus } from 'lucide-react';

type ViewMode = 'list' | 'import' | 'history';

export function AdminInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Import form state
  const [importItems, setImportItems] = useState<{ id: number; name: string; qty: number; price: number }[]>([]);
  const [importNote, setImportNote] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = () => {
    fetch(API.products.inventory).then(r => r.json()).then(d => { if (d.success) setInventory(d.data); });
  };

  const fetchHistory = () => {
    fetch(API.products.importHistory).then(r => r.json()).then(d => { if (d.success) setImportHistory(d.data); });
  };

  const handleAddItem = () => {
    const pid = parseInt(selectedProductId);
    if (!pid) { alert('Vui lòng chọn sản phẩm!'); return; }
    if (importItems.find(i => i.id === pid)) { alert('Sản phẩm đã có trong danh sách!'); return; }
    const product = inventory.find(p => p.id === pid);
    if (!product) return;
    setImportItems([...importItems, { id: pid, name: product.name, qty: 1, price: 0 }]);
    setSelectedProductId('');
  };

  const handleRemoveItem = (id: number) => { setImportItems(importItems.filter(i => i.id !== id)); };

  const handleUpdateItem = (id: number, field: 'qty' | 'price', value: number) => {
    setImportItems(importItems.map(i => i.id === id ? { ...i, [field]: Math.max(0, value) } : i));
  };

  const handleSubmitImport = async () => {
    if (importItems.length === 0) { alert('Vui lòng thêm ít nhất 1 sản phẩm!'); return; }
    if (importItems.some(i => i.qty <= 0)) { alert('Số lượng nhập phải lớn hơn 0!'); return; }
    if (importItems.some(i => i.price < 0)) { alert('Giá nhập không hợp lệ!'); return; }

    try {
      const res = await fetch(API.products.importStock, {
        method: 'POST',
        body: JSON.stringify({ admin_id: user.customer_id || user.id, items: importItems, note: importNote }),
        headers: { 'Content-Type': 'application/json' }
      });
      const d = await res.json();
      if (d.success) {
        alert(`✅ Nhập kho thành công!\nMã phiếu nhập: #PN-${d.phieu_nhap_id}\nTổng giá trị: ${totalImport.toLocaleString('vi-VN')}đ`);
        setViewMode('list'); setImportItems([]); setImportNote(''); fetchInventory();
      } else { alert('Lỗi: ' + d.message); }
    } catch { alert('Lỗi kết nối!'); }
  };

  const totalImport = importItems.reduce((s, i) => s + i.qty * i.price, 0);
  const filtered = inventory.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString().includes(searchQuery));

  const statusLabel = (status: string, stock: number) => {
    if (stock <= 0) return { text: 'HẾT HÀNG', bg: '#ef4444', color: '#fff' };
    if (stock <= 5) return { text: 'SẮP HẾT', bg: '#fbbf24', color: '#000' };
    if (status === 'ngungkinhdoanh') return { text: 'NGỪNG KD', bg: '#9ca3af', color: '#fff' };
    return { text: 'CÒN HÀNG', bg: '#4ade80', color: '#000' };
  };

  // ============= VIEW: TẠO PHIẾU NHẬP KHO =============
  if (viewMode === 'import') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase' }}>📦 Tạo Phiếu Nhập Kho</h1>
          <button onClick={() => { setViewMode('list'); setImportItems([]); setImportNote(''); }} className="btn btn-secondary btn-sm">← QUAY LẠI</button>
        </div>

        {/* Add product to import list */}
        <div className="neo-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', fontSize: '1rem' }}>Chọn sản phẩm nhập kho</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '16rem' }}>
              <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="form-select" style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}>
                <option value="">-- Chọn sản phẩm --</option>
                {inventory.filter(p => !importItems.find(i => i.id === p.id)).map(p => (
                  <option key={p.id} value={p.id}>SP-{p.id}: {p.name} (Tồn: {p.stock})</option>
                ))}
              </select>
            </div>
            <button onClick={handleAddItem} className="btn btn-primary btn-sm"><Plus style={{ width: 16, height: 16 }} /> THÊM</button>
          </div>
        </div>

        {/* Import items table */}
        <div className="neo-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', fontSize: '1rem' }}>Danh sách hàng nhập ({importItems.length} sản phẩm)</h3>
          {importItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontWeight: 700, padding: '2rem 0', textTransform: 'uppercase' }}>Chưa có sản phẩm nào. Hãy chọn sản phẩm ở trên.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="neo-table">
                <thead><tr><th>SẢN PHẨM</th><th>TỒN HIỆN TẠI</th><th>SỐ LƯỢNG NHẬP</th><th>GIÁ NHẬP (VNĐ/SP)</th><th>THÀNH TIỀN</th><th style={{ textAlign: 'center' }}>XÓA</th></tr></thead>
                <tbody>
                  {importItems.map(item => {
                    const current = inventory.find(p => p.id === item.id);
                    return (
                      <tr key={item.id} style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}>
                        <td style={{ fontWeight: 700 }}>SP-{item.id}: {item.name}</td>
                        <td>{current?.stock || 0}</td>
                        <td><input type="number" min={1} value={item.qty} onChange={e => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="form-input" style={{ width: '6rem', padding: '0.4rem', textAlign: 'center' }} /></td>
                        <td><input type="number" min={0} value={item.price} onChange={e => handleUpdateItem(item.id, 'price', parseInt(e.target.value) || 0)} className="form-input" style={{ width: '8rem', padding: '0.4rem', textAlign: 'center' }} /></td>
                        <td style={{ fontWeight: 700, color: '#15803d' }}>{(item.qty * item.price).toLocaleString('vi-VN')}đ</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => handleRemoveItem(item.id)} style={{ background: '#dc2626', color: '#fff', padding: '0.4rem', border: '2px solid #000', cursor: 'pointer' }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#fef3c7', fontWeight: 900, fontSize: '1rem' }}>
                    <td colSpan={4} style={{ textAlign: 'right', textTransform: 'uppercase' }}>TỔNG GIÁ TRỊ NHẬP:</td>
                    <td colSpan={2} style={{ color: '#b91c1c' }}>{totalImport.toLocaleString('vi-VN')}đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note & Submit */}
        <div className="neo-card">
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Ghi chú phiếu nhập</label>
            <input type="text" value={importNote} onChange={e => setImportNote(e.target.value)} className="form-input" placeholder="VD: Nhập lô hàng tháng 5/2026..." />
          </div>
          <button onClick={handleSubmitImport} disabled={importItems.length === 0} className="btn btn-primary btn-full" style={{ fontSize: '1.125rem', padding: '1rem' }}>
            <PackagePlus style={{ width: 24, height: 24 }} /> LƯU PHIẾU NHẬP KHO
          </button>
        </div>
      </div>
    );
  }

  // ============= VIEW: LỊCH SỬ NHẬP KHO =============
  if (viewMode === 'history') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase' }}>📋 Lịch Sử Nhập Kho</h1>
          <button onClick={() => setViewMode('list')} className="btn btn-secondary btn-sm">← QUAY LẠI</button>
        </div>
        <div style={{ background: '#fff', border: '2px solid #000', overflow: 'hidden', boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="neo-table">
              <thead><tr><th>MÃ PHIẾU</th><th>NGÀY NHẬP</th><th>NHÂN VIÊN</th><th>CHI TIẾT</th><th>TỔNG GIÁ TRỊ</th><th>GHI CHÚ</th></tr></thead>
              <tbody>
                {importHistory.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>CHƯA CÓ PHIẾU NHẬP NÀO</td></tr>}
                {importHistory.map(r => (
                  <tr key={r.id} style={{ fontSize: '0.875rem' }}>
                    <td style={{ fontWeight: 900 }}>PN-{r.id}</td>
                    <td>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                    <td>NV-{r.employee_id}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '0.75rem' }}>{r.items_summary || '--'}</td>
                    <td style={{ fontWeight: 700, color: '#15803d' }}>{Number(r.total).toLocaleString('vi-VN')}đ</td>
                    <td style={{ color: '#6b7280', fontSize: '0.75rem' }}>{r.note || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ============= VIEW: TỔNG QUAN KHO =============
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase' }}>Quản Lý Kho Hàng</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setViewMode('import')} className="btn btn-primary"><PackagePlus style={{ width: 20, height: 20 }} /> TẠO PHIẾU NHẬP</button>
          <button onClick={() => { setViewMode('history'); fetchHistory(); }} className="btn btn-secondary"><History style={{ width: 20, height: 20 }} /> LỊCH SỬ NHẬP</button>
          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #000', padding: '0.5rem' }}>
            <Search style={{ width: 20, height: 20, marginRight: '0.5rem', color: '#6b7280' }} />
            <input type="text" placeholder="TÌM KIẾM..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ outline: 'none', fontWeight: 700, textTransform: 'uppercase', width: '12rem', border: 'none' }} />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ background: '#60a5fa' }}><div className="stat-card-label">TỔNG SP</div><div className="stat-card-value">{inventory.length}</div></div>
        <div className="stat-card" style={{ background: '#4ade80' }}><div className="stat-card-label">CÒN HÀNG</div><div className="stat-card-value">{inventory.filter(p => p.stock > 5).length}</div></div>
        <div className="stat-card" style={{ background: '#fbbf24' }}><div className="stat-card-label">SẮP HẾT</div><div className="stat-card-value">{inventory.filter(p => p.stock > 0 && p.stock <= 5).length}</div></div>
        <div className="stat-card" style={{ background: '#ef4444' }}><div className="stat-card-label">HẾT HÀNG</div><div className="stat-card-value">{inventory.filter(p => p.stock <= 0).length}</div></div>
      </div>

      {/* Inventory table */}
      <div style={{ background: '#fff', border: '2px solid #000', overflow: 'hidden', boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead><tr><th>MÃ SP</th><th>SẢN PHẨM</th><th>PHÂN LOẠI</th><th>GIÁ BÁN</th><th>TỒN KHO</th><th>TRẠNG THÁI</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>KHÔNG TÌM THẤY</td></tr>}
              {filtered.map(sp => {
                const st = statusLabel(sp.status, sp.stock);
                return (
                  <tr key={sp.id} style={{ textTransform: 'uppercase', fontSize: '0.875rem' }}>
                    <td>SP-{sp.id}</td>
                    <td style={{ fontWeight: 700, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.name}</td>
                    <td style={{ fontSize: '0.75rem' }}>{sp.genre}</td>
                    <td>{Number(sp.price).toLocaleString('vi-VN')}đ</td>
                    <td style={{ fontWeight: 900, fontSize: '1rem' }}>{sp.stock}</td>
                    <td><span style={{ padding: '0.25rem 0.5rem', border: '2px solid #000', background: st.bg, color: st.color, fontSize: '0.75rem', fontWeight: 700 }}>{st.text}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
