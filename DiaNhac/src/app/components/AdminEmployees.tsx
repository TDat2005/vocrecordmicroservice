import { useState, useEffect } from 'react';
import { Users, Lock, Unlock, Key, FileEdit } from 'lucide-react';
import { API_BASE } from '../config/api';

export function AdminEmployees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    account_id: 0,
    username: '',
    password: '',
    name: '',
    position: '',
    role: 'nhanvien',
    status: 1
  });

  const fetchEmployees = () => {
    fetch(`${API_BASE}/employees.php?action=list`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleStatus = (account_id: number, currentStatus: number) => {
    if (!window.confirm(`Bạn có chắc muốn ${currentStatus === 1 ? 'KHOÁ' : 'MỞ KHOÁ'} tài khoản này?`)) return;
    
    fetch(`${API_BASE}/employees.php?action=toggle_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id, status: currentStatus === 1 ? 0 : 1 })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.success) fetchEmployees();
    });
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      const action = formData.id === 0 ? 'create' : 'update';
      fetch(`${API_BASE}/employees.php?action=${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              alert(data.message);
              setShowModal(false);
              fetchEmployees();
          } else {
              alert(data.message);
          }
      });
  };

  const openEditModal = (emp: any) => {
      setFormData({
          id: emp.id,
          account_id: emp.account_id,
          username: emp.username,
          password: '', // Không render mk cũ
          name: emp.name,
          position: emp.position || '',
          role: emp.role,
          status: emp.status
      });
      setShowModal(true);
  };

  const openCreateModal = () => {
      setFormData({
        id: 0,
        account_id: 0,
        username: '',
        password: '',
        name: '',
        position: '',
        role: 'nhanvien',
        status: 1
      });
      setShowModal(true);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
         <h2 className="text-3xl font-bold uppercase flex items-center gap-3">
            <Users className="w-8 h-8" />
            Nhân Sự & Quyền
         </h2>
         <button onClick={openCreateModal} className="bg-black text-white px-6 py-3 font-bold uppercase border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors">
            + Thêm Nhân Viên
         </button>
       </div>

       <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black text-white uppercase text-sm border-b-4 border-black">
                  <th className="p-4">Tài Khoản</th>
                  <th className="p-4">Nhân Viên</th>
                  <th className="p-4">Vai Trò</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-yellow-50 transition-colors font-bold">
                        <td className="p-4 uppercase">{emp.username}</td>
                        <td className="p-4">
                            <div>{emp.name}</div>
                            <div className="text-sm font-normal text-gray-600">{emp.position || 'Chưa cập nhật'}</div>
                        </td>
                        <td className="p-4 uppercase text-purple-700">{emp.role}</td>
                        <td className="p-4">
                            {emp.status == 1 
                                ? <span className="bg-green-100 text-green-700 px-3 py-1 border-2 border-green-700 text-xs">HOẠT ĐỘNG</span>
                                : <span className="bg-red-100 text-red-700 px-3 py-1 border-2 border-red-700 text-xs">BỊ KHOÁ</span>
                            }
                        </td>
                        <td className="p-4 flex gap-2 justify-end">
                            <button onClick={() => openEditModal(emp)} className="p-2 bg-yellow-400 border-2 border-black hover:bg-black hover:text-white transition-colors" title="Sửa thông tin">
                                <FileEdit className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleToggleStatus(emp.account_id, emp.status)} 
                                className={`p-2 border-2 border-black transition-colors ${emp.status == 1 ? 'bg-red-500 text-white hover:bg-black' : 'bg-green-500 text-white hover:bg-black'}`}
                                title={emp.status == 1 ? 'Khoá tài khoản' : 'Mở khoá'}
                            >
                                {emp.status == 1 ? <Lock className="w-5 h-5"/> : <Unlock className="w-5 h-5" />}
                            </button>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
         </div>
       </div>

       {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
             <div className="bg-white border-4 border-black p-8 w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
                <h3 className="text-2xl font-bold uppercase mb-6 border-b-4 border-black pb-2">
                    {formData.id === 0 ? 'Thêm Nhân Viên' : 'Sửa Thông Tin'}
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold uppercase mb-2">Username</label>
                            <input 
                                type="text"
                                disabled={formData.id !== 0}
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold uppercase mb-2">
                                Password {formData.id !== 0 && '(Bỏ trống nếu không đổi)'}
                            </label>
                            <input 
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required={formData.id === 0}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-bold uppercase mb-2">Họ & Tên</label>
                         <input 
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              required
                              className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                         />
                    </div>
                    <div>
                         <label className="block text-sm font-bold uppercase mb-2">Chức Vụ</label>
                         <input 
                              type="text"
                              value={formData.position}
                              onChange={(e) => setFormData({...formData, position: e.target.value})}
                              placeholder="Kế toán, Bán hàng..."
                              className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                         />
                    </div>
                    <div>
                         <label className="block text-sm font-bold uppercase mb-2">Gán Quyền</label>
                         <select
                              value={formData.role}
                              onChange={(e) => setFormData({...formData, role: e.target.value})}
                              className="w-full p-3 border-2 border-black font-bold uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400"
                         >
                             <option value="nhanvien">Nhân Viên Bán Hàng</option>
                             <option value="admin">Quản Trị Viên (Admin)</option>
                         </select>
                    </div>

                    <div className="flex gap-4 pt-4 border-t-2 border-black border-dashed mt-6">
                         <button type="submit" className="flex-1 bg-yellow-400 text-black border-2 border-black p-3 font-bold uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">Lưu Lại</button>
                         <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white text-black border-2 border-black p-3 font-bold uppercase hover:bg-gray-100 transition-colors">Huỷ</button>
                    </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
}
