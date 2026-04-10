import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { API_BASE } from '../config/api';

export function AdminDiscounts() {
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        MaGG: '',
        Code: '',
        LoaiGiamGia: 'percent',
        GiaTri: '',
        DonHangToiThieu: '',
        SoLuong: '',
        NgayHetHan: ''
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = () => {
        fetch(`${API_BASE}/discount.php?action=get_all`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setDiscounts(data.data);
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const action = formData.MaGG ? 'update' : 'create';
        const method = formData.MaGG ? 'PUT' : 'POST';

        fetch(`${API_BASE}/discount.php?action=${action}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                setShowModal(false);
                fetchDiscounts();
            } else {
                alert(data.message);
            }
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc muốn xoá mã giảm giá này?")) {
            fetch(`${API_BASE}/discount.php?action=delete&id=${id}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.success) fetchDiscounts();
            });
        }
    };

    const handleEdit = (d: any) => {
        setFormData({
            MaGG: d.MaGG,
            Code: d.Code,
            LoaiGiamGia: d.LoaiGiamGia,
            GiaTri: d.GiaTri,
            DonHangToiThieu: d.DonHangToiThieu,
            SoLuong: d.SoLuong,
            NgayHetHan: d.NgayHetHan ? d.NgayHetHan.split(' ')[0] : ''
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({
            MaGG: '',
            Code: '',
            LoaiGiamGia: 'percent',
            GiaTri: '',
            DonHangToiThieu: '',
            SoLuong: '',
            NgayHetHan: ''
        });
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-black uppercase text-black">Mã Giảm Giá</h1>
                <button
                    onClick={handleAdd}
                    className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-yellow-400 hover:text-black hover:shadow-none transition-all uppercase flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> THÊM MÃ MỚI
                </button>
            </div>

            <div className="bg-white border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-black uppercase text-sm">
                                <th className="p-4 font-black">Code</th>
                                <th className="p-4 font-black">Loại</th>
                                <th className="p-4 font-black">Giá Trị</th>
                                <th className="p-4 font-black">ĐH Tối Thiểu</th>
                                <th className="p-4 font-black">SL / Đã Dùng</th>
                                <th className="p-4 font-black">Hạn Dùng</th>
                                <th className="p-4 font-black text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map(d => (
                                <tr key={d.MaGG} className="border-b-2 border-dashed border-gray-200 uppercase text-sm font-bold">
                                    <td className="p-4 text-pink-600 font-black flex items-center gap-2">
                                        <Tag className="w-4 h-4" /> {d.Code}
                                    </td>
                                    <td className="p-4">{d.LoaiGiamGia === 'percent' ? '%' : 'VNĐ'}</td>
                                    <td className="p-4">{d.GiaTri}</td>
                                    <td className="p-4">{d.DonHangToiThieu}</td>
                                    <td className="p-4">{d.SoLuong} / <span className="text-red-500">{d.DaDung}</span></td>
                                    <td className="p-4">{d.NgayHetHan ? d.NgayHetHan.split(' ')[0] : 'Không hạn'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleEdit(d)} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors" title="Sửa">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(d.MaGG)} className="p-2 border-2 text-red-500 border-black hover:bg-red-500 hover:text-white transition-colors" title="Xóa">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white border-2 border-black p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-2xl font-black uppercase mb-4">{formData.MaGG ? 'Sửa Mã' : 'Thêm Mã Mới'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4 uppercase font-bold text-sm">
                            <div>
                                <label className="block mb-1">Mã Code (CODE)</label>
                                <input required type="text" value={formData.Code} onChange={e => setFormData({...formData, Code: e.target.value.toUpperCase()})} className="w-full border-2 border-black p-2" placeholder="VD: TET2025" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Loại</label>
                                    <select value={formData.LoaiGiamGia} onChange={e => setFormData({...formData, LoaiGiamGia: e.target.value})} className="w-full border-2 border-black p-2">
                                        <option value="percent">% (Phần trăm)</option>
                                        <option value="fixed">Tiền Mặt (VNĐ)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1">Giá trị</label>
                                    <input required type="number" value={formData.GiaTri} onChange={e => setFormData({...formData, GiaTri: e.target.value})} className="w-full border-2 border-black p-2" placeholder="VD: 10" />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1">Đơn tối thiểu (VNĐ)</label>
                                <input required type="number" value={formData.DonHangToiThieu} onChange={e => setFormData({...formData, DonHangToiThieu: e.target.value})} className="w-full border-2 border-black p-2" placeholder="VD: 500000" />
                            </div>
                            <div>
                                <label className="block mb-1">Số lượng giới hạn</label>
                                <input required type="number" value={formData.SoLuong} onChange={e => setFormData({...formData, SoLuong: e.target.value})} className="w-full border-2 border-black p-2" placeholder="VD: 100" />
                            </div>
                            <div>
                                <label className="block mb-1">Ngày hết hạn</label>
                                <input type="date" value={formData.NgayHetHan} onChange={e => setFormData({...formData, NgayHetHan: e.target.value})} className="w-full border-2 border-black p-2 bg-white text-black" />
                            </div>
                            <div className="flex gap-4 pt-4 border-t-2 border-dashed border-gray-300">
                                <button type="submit" className="flex-1 bg-black text-white hover:bg-yellow-400 hover:text-black py-2 font-black border-2 border-black transition-colors">LƯU TRỮ</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-black hover:bg-gray-300 py-2 font-black border-2 border-black transition-colors">HỦY BỎ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
