import { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../services/api";
import { Trash2, Edit, Printer } from 'lucide-react';
import InvoicePrint from "../../../components/InvoicePrint";

export default function BillManager() {
  const [bills, setBills] = useState([]); const [search, setSearch] = useState(""); const [selectedBill, setSelectedBill] = useState(null); const [loading, setLoading] = useState(false);
  const [printBillData, setPrintBillData] = useState(null); const [printBillItems, setPrintBillItems] = useState([]); const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => { loadBills(); }, []);
  const loadBills = async () => { try { const res = await api.get("/hoadon"); setBills(res.data); } catch (err) { alert("Không thể tải hóa đơn"); } };
  const filteredBills = bills.filter(b => b.MaHD.toString().includes(search) || b.TenKhach?.toLowerCase().includes(search.toLowerCase()) || b.TrangThai?.toLowerCase().includes(search.toLowerCase()));
  const handleDelete = async (id) => { if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác!")) { try { await api.delete(`/hoadon/${id}`); alert("Đã xóa thành công!"); loadBills(); } catch (err) { alert("Lỗi khi xóa hóa đơn"); } } };
  const handleUpdateStatus = async (id, currentStatus) => { const newStatus = prompt("Nhập trạng thái mới (Đã thanh toán / Đã hoàn tiền / Đã hủy):", currentStatus); if (newStatus && newStatus !== currentStatus) { try { await api.put(`/hoadon/${id}`, { TrangThai: newStatus }); alert("Cập nhật trạng thái thành công!"); loadBills(); } catch (err) { alert("Lỗi cập nhật"); } } };
  const closeDetail = () => setSelectedBill(null);
  const handlePrintClick = async (bill) => { try { const res = await api.get(`/donhang/chitiet/${bill.MaDH}`); setPrintBillData(bill); setPrintBillItems(res.data); setShowInvoiceModal(true); } catch (err) { alert("Lỗi: Không thể lấy chi tiết hóa đơn để in!"); } };

  return (
    <DashboardLayout title="Quản Lý Hóa Đơn">
      <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-coffee-50">
          <input type="text" placeholder="Tìm theo mã hóa đơn, tên khách hoặc trạng thái..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-96 px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full"><thead><tr className="bg-coffee-50/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Mã HD</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Mã ĐH</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Khách hàng</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Ngày</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Tổng tiền</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">HT TT</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Trạng thái</th><th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Thao tác</th>
          </tr></thead>
            <tbody className="divide-y divide-coffee-50">
              {filteredBills.map((b) => (
                <tr key={b.MaHD} className="hover:bg-coffee-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-coffee-500">#{b.MaHD}</td>
                  <td className="px-4 py-3 text-sm text-coffee-500">#{b.MaDH}</td>
                  <td className="px-4 py-3 text-sm font-medium text-coffee-800">{b.TenKhach}</td>
                  <td className="px-4 py-3 text-sm text-coffee-500">{b.NgayLap?.split("T")[0]}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-coffee-800">{Number(b.TongTien).toLocaleString()} đ</td>
                  <td className="px-4 py-3 text-sm text-coffee-500">{b.HinhThucThanhToan}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${b.TrangThai === "Đã thanh toán" ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>{b.TrangThai}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-center gap-1.5">
                    <button className="p-2 text-coffee-500 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition-colors" onClick={() => handlePrintClick(b)} title="In hóa đơn"><Printer size={15} /></button>
                    <button className="p-2 text-warning bg-warning-light rounded-lg hover:bg-warning/10 transition-colors" onClick={() => handleUpdateStatus(b.MaHD, b.TrangThai)} title="Cập nhật trạng thái"><Edit size={15} /></button>
                    <button className="p-2 text-danger bg-danger-light rounded-lg hover:bg-danger/10 transition-colors" onClick={() => handleDelete(b.MaHD)} title="Xóa hóa đơn"><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              ))}
              {filteredBills.length === 0 && <tr><td colSpan="8" className="px-4 py-12 text-center text-coffee-300">Không có hóa đơn nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showInvoiceModal && printBillData && <InvoicePrint order={printBillData} items={printBillItems} onClose={() => setShowInvoiceModal(false)} />}
    </DashboardLayout>
  );
}
