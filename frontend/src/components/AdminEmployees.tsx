import { useState, useEffect } from 'react';
import { API } from '../config/api';
import { Users, Lock, Unlock, FileEdit } from 'lucide-react';

export function AdminEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: 0, account_id: 0, username: '', password: '', name: '', position: '', role: 'nhanvien', status: 1 });

  const fetchEmployees = () => { fetch(API.users.getEmployees).then(res => res.json()).then(data => { if (data.success) setEmployees(data.data); }).catch(console.error); };
  useEffect(() => { fetchEmployees(); }, []);

  const handleToggleStatus = (account_id: number, currentStatus: number) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentStatus === 1 ? 'KHOÁ' : 'MỞ KHOÁ'} tài khoản này?`)) return;
    fetch(API.users.toggleEmployeeStatus, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account_id, status: currentStatus === 1 ? 0 : 1 }) })
    .then(res => res.json()).then(data => { alert(data.message); if(data.success) fetchEmployees(); });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const url = formData.id === 0 ? API.users.getEmployees : API.users.updateEmployee(formData.id);
    const method = formData.id === 0 ? 'POST' : 'PUT';
    
    fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
    .then(res => res.json()).then(data => { if (data.success) { alert(data.message); setShowModal(false); fetchEmployees(); } else alert(data.message); });
  };

  const openEditModal = (emp: any) => { setFormData({ id: emp.id, account_id: emp.account_id, username: emp.username, password: '', name: emp.name, position: emp.position || '', role: emp.role, status: emp.status }); setShowModal(true); };
  const openCreateModal = () => { setFormData({ id: 0, account_id: 0, username: '', password: '', name: '', position: '', role: 'nhanvien', status: 1 }); setShowModal(true); };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#facc15',border:'4px solid #000',padding:'1.5rem',boxShadow:'8px 8px 0 0 rgba(0,0,0,1)'}}>
        <h2 style={{fontSize:'1.875rem',fontWeight:700,textTransform:'uppercase',display:'flex',alignItems:'center',gap:'0.75rem'}}><Users style={{width:32,height:32}} />Nhân Sự & Quyền</h2>
        <button onClick={openCreateModal} className="btn btn-primary">+ Thêm Nhân Viên</button>
      </div>

      <div style={{background:'#fff',border:'4px solid #000',boxShadow:'8px 8px 0 0 rgba(0,0,0,1)',overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table className="neo-table">
            <thead><tr><th>Tài Khoản</th><th>Nhân Viên</th><th>Vai Trò</th><th>Trạng Thái</th><th style={{textAlign:'right'}}>Thao tác</th></tr></thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{textTransform:'uppercase'}}>{emp.username}</td>
                  <td><div>{emp.name}</div><div style={{fontSize:'0.875rem',fontWeight:400,color:'#4b5563'}}>{emp.position || 'Chưa cập nhật'}</div></td>
                  <td style={{textTransform:'uppercase',color:'#7c3aed'}}>{emp.role}</td>
                  <td>{emp.status == 1 ? <span style={{background:'#dcfce7',color:'#15803d',padding:'0.25rem 0.75rem',border:'2px solid #15803d',fontSize:'0.75rem'}}>HOẠT ĐỘNG</span> : <span style={{background:'#fee2e2',color:'#b91c1c',padding:'0.25rem 0.75rem',border:'2px solid #b91c1c',fontSize:'0.75rem'}}>BỊ KHOÁ</span>}</td>
                  <td style={{display:'flex',gap:'0.5rem',justifyContent:'flex-end'}}>
                    <button onClick={() => openEditModal(emp)} style={{padding:'0.5rem',background:'#facc15',border:'2px solid #000',cursor:'pointer'}} title="Sửa"><FileEdit style={{width:20,height:20}} /></button>
                    <button onClick={() => handleToggleStatus(emp.account_id, emp.status)} style={{padding:'0.5rem',border:'2px solid #000',cursor:'pointer',background: emp.status == 1 ? '#ef4444' : '#22c55e',color:'#fff'}} title={emp.status == 1 ? 'Khoá' : 'Mở khoá'}>{emp.status == 1 ? <Lock style={{width:20,height:20}} /> : <Unlock style={{width:20,height:20}} />}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{maxWidth:'32rem'}}>
            <h3 style={{fontSize:'1.5rem',fontWeight:700,textTransform:'uppercase',marginBottom:'1.5rem',borderBottom:'4px solid #000',paddingBottom:'0.5rem'}}>{formData.id === 0 ? 'Thêm Nhân Viên' : 'Sửa Thông Tin'}</h3>
            <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="grid-2"><div><label className="form-label">Username</label><input type="text" disabled={formData.id !== 0} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required className="form-input" style={{background: formData.id !== 0 ? '#e5e7eb' : '#fff'}} /></div><div><label className="form-label">Password {formData.id !== 0 && '(Bỏ trống nếu không đổi)'}</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={formData.id === 0} className="form-input" /></div></div>
              <div><label className="form-label">Họ & Tên</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="form-input" /></div>
              <div><label className="form-label">Chức Vụ</label><input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="Kế toán, Bán hàng..." className="form-input" /></div>
              <div><label className="form-label">Gán Quyền</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="form-select"><option value="nhanvien">Nhân Viên Bán Hàng</option><option value="admin">Quản Trị Viên (Admin)</option></select></div>
              <div style={{display:'flex',gap:'1rem',paddingTop:'1rem',borderTop:'2px dashed #000',marginTop:'0.5rem'}}>
                <button type="submit" className="btn btn-yellow" style={{flex:1}}>Lưu Lại</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{flex:1}}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
