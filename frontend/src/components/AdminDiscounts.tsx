import { useState, useEffect } from 'react';
import { API } from '../config/api';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';

export function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: 0, code: '', type: 'percent', value: '', min_order: '', quantity: '', expires_at: '' });

  useEffect(() => { fetchDiscounts(); }, []);
  const fetchDiscounts = () => { fetch(API.products.discounts).then(res => res.json()).then(data => { if (data.success) setDiscounts(data.data); }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? API.products.updateDiscount(formData.id) : API.products.createDiscount;
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
    .then(res => res.json()).then(data => { if (data.success) { alert(data.message); setShowModal(false); fetchDiscounts(); } else alert(data.message); });
  };

  const handleDelete = (id: number) => { if (window.confirm("Bạn có chắc muốn xoá mã giảm giá này?")) { fetch(API.products.deleteDiscount(id), { method: 'DELETE' }).then(res => res.json()).then(data => { alert(data.message); if (data.success) fetchDiscounts(); }); } };
  const handleEdit = (d: any) => { setFormData({ id: d.id, code: d.code, type: d.type, value: d.value, min_order: d.min_order, quantity: d.quantity, expires_at: d.expires_at ? d.expires_at.split('T')[0] : '' }); setShowModal(true); };
  const handleAdd = () => { setFormData({ id: 0, code: '', type: 'percent', value: '', min_order: '', quantity: '', expires_at: '' }); setShowModal(true); };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',borderBottom:'2px solid #000',paddingBottom:'1rem'}}>
        <h1 style={{fontSize:'1.875rem',fontWeight:900,textTransform:'uppercase'}}>Mã Giảm Giá</h1>
        <button onClick={handleAdd} className="btn btn-primary"><Plus style={{width:20,height:20}} /> THÊM MÃ MỚI</button>
      </div>

      <div style={{background:'#fff',border:'2px solid #000',overflow:'hidden',boxShadow:'8px 8px 0 0 rgba(0,0,0,1)'}}>
        <div style={{overflowX:'auto'}}>
          <table className="neo-table">
            <thead><tr><th>Code</th><th>Loại</th><th>Giá Trị</th><th>ĐH Tối Thiểu</th><th>SL / Đã Dùng</th><th>Hạn Dùng</th><th style={{textAlign:'center'}}>Hành Động</th></tr></thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id} style={{textTransform:'uppercase',fontSize:'0.875rem'}}>
                  <td style={{color:'#db2777',fontWeight:900,display:'flex',alignItems:'center',gap:'0.5rem'}}><Tag style={{width:16,height:16}} />{d.code}</td>
                  <td>{d.type === 'percent' ? '%' : 'VNĐ'}</td>
                  <td>{d.value}</td>
                  <td>{d.min_order}</td>
                  <td>{d.quantity} / <span style={{color:'#ef4444'}}>{d.used_count || 0}</span></td>
                  <td>{d.expires_at ? d.expires_at.split('T')[0] : 'Không hạn'}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
                      <button onClick={() => handleEdit(d)} style={{padding:'0.5rem',border:'2px solid #000',cursor:'pointer',background:'#fff'}} title="Sửa"><Edit2 style={{width:16,height:16}} /></button>
                      <button onClick={() => handleDelete(d.id)} style={{padding:'0.5rem',border:'2px solid #000',cursor:'pointer',color:'#ef4444',background:'#fff'}} title="Xóa"><Trash2 style={{width:16,height:16}} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-box">
            <h2 style={{fontSize:'1.5rem',fontWeight:900,textTransform:'uppercase',marginBottom:'1rem'}}>{formData.id ? 'Sửa Mã' : 'Thêm Mã Mới'}</h2>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem',textTransform:'uppercase',fontWeight:700,fontSize:'0.875rem'}}>
              <div><label style={{display:'block',marginBottom:'0.25rem'}}>Mã Code (CODE)</label><input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="form-input" placeholder="VD: TET2025" /></div>
              <div className="grid-2"><div><label style={{display:'block',marginBottom:'0.25rem'}}>Loại</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="form-select"><option value="percent">% (Phần trăm)</option><option value="fixed">Tiền Mặt (VNĐ)</option></select></div><div><label style={{display:'block',marginBottom:'0.25rem'}}>Giá trị</label><input required type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="form-input" placeholder="VD: 10" /></div></div>
              <div><label style={{display:'block',marginBottom:'0.25rem'}}>Đơn tối thiểu (VNĐ)</label><input required type="number" value={formData.min_order} onChange={e => setFormData({...formData, min_order: e.target.value})} className="form-input" placeholder="VD: 500000" /></div>
              <div><label style={{display:'block',marginBottom:'0.25rem'}}>Số lượng giới hạn</label><input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="form-input" placeholder="VD: 100" /></div>
              <div><label style={{display:'block',marginBottom:'0.25rem'}}>Ngày hết hạn</label><input type="date" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} className="form-input" /></div>
              <div style={{display:'flex',gap:'1rem',paddingTop:'1rem',borderTop:'2px dashed #d1d5db'}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>LƯU TRỮ</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{flex:1}}>HỦY BỎ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
