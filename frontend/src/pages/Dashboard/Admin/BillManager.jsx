import { useEffect, useState } from "react";
import { 
  Trash2, 
  Edit3, 
  Printer, 
  Search, 
  Receipt,
  CheckCircle,
  X
} from 'lucide-react';
import DashboardLayout from "../../../components/DashboardLayout";
import api from "../../../services/api";
import InvoicePrint from "../../../components/InvoicePrint";
import StatusBadge from "../../../components/ui/StatusBadge";
import Pagination from "../../../components/ui/Pagination";

export default function BillManager() {
  const [bills, setBills] = useState([]); 
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [printBillData, setPrintBillData] = useState(null); 
  const [printBillItems, setPrintBillItems] = useState([]); 
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Phân trang 10 mục / trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { 
    loadBills(); 
  }, []);

  const loadBills = async () => { 
    setLoading(true);
    try { 
      const res = await api.get("/hoadon"); 
      setBills(res.data || []); 
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(b => 
    b.MaHD.toString().includes(search) || 
    b.MaDH.toString().includes(search) ||
    (b.TenKhach && b.TenKhach.toLowerCase().includes(search.toLowerCase())) || 
    (b.TrangThai && b.TrangThai.toLowerCase().includes(search.toLowerCase()))
  );

  const totalItems = filteredBills.length;
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async (id) => { 
    if (window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác!")) { 
      try { 
        await api.delete(`/hoadon/${id}`); 
        loadBills(); 
      } catch (err) { 
        alert("Lỗi khi xóa hóa đơn"); 
      } 
    } 
  };

  const openStatusModal = (bill) => {
    setEditingBill(bill);
    setNewStatus(bill.TrangThai);
    setShowStatusModal(true);
  };

  const handleUpdateStatusConfirm = async () => { 
    if (!editingBill || !newStatus) return;
    try { 
      await api.put(`/hoadon/${editingBill.MaHD}`, { TrangThai: newStatus }); 
      setShowStatusModal(false);
      loadBills(); 
    } catch (err) { 
      alert("Lỗi cập nhật trạng thái hóa đơn"); 
    } 
  };

  const handlePrintClick = async (bill) => { 
    try { 
      const res = await api.get(`/donhang/chitiet/${bill.MaDH}`); 
      setPrintBillData(bill); 
      setPrintBillItems(res.data || []); 
      setShowInvoiceModal(true); 
    } catch (err) { 
      alert("Lỗi: Không thể lấy chi tiết hóa đơn để in!"); 
    } 
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
  const formatMoney = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' đ';

  return (
    <DashboardLayout title="Quản Lý Hóa Đơn & Sổ Thu">
      <div className="bg-white rounded-3xl border border-[#EFEBE9] shadow-sm overflow-hidden space-y-4 font-sans animate-fade-in">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Toàn Bộ Hóa Đơn ({filteredBills.length})
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              Hồ sơ thanh toán tài khóa của cửa hàng
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1887F]" />
            <input 
              type="text" 
              placeholder="Tìm mã HĐ, mã ĐH, tên khách..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }} 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFEBE9] text-xs font-medium text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#C5963A]/30"
            />
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-[#EFEBE9] border-t-[#C5963A] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#8D6E63]">Đang tải danh sách hóa đơn...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-[#A1887F] mx-auto mb-3 opacity-40" />
            <p className="font-serif font-bold text-base text-[#2C1810]">Không có hóa đơn nào</p>
            <p className="text-xs text-[#8D6E63] mt-1">Các hóa đơn thanh toán sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EFEBE9]">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mã HĐ</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Mã ĐH</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Khách Hàng</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Ngày Lập</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Tổng Tiền</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Hình Thức</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider font-sans text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2] text-sm font-sans">
                {currentBills.map((b) => (
                  <tr key={b.MaHD} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="px-5 py-4 font-bold text-xs text-[#A1887F]">
                      #{b.MaHD}
                    </td>
                    <td className="px-5 py-4 font-bold text-xs text-[#C5963A]">
                      #{b.MaDH}
                    </td>
                    <td className="px-5 py-4 font-bold text-xs text-[#2C1810]">
                      {b.TenKhach || "Khách tại quầy"}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      {formatDate(b.NgayLap)}
                    </td>
                    <td className="px-5 py-4 font-bold text-sm text-[#2C1810]">
                      {formatMoney(b.TongTien)}
                    </td>
                    <td className="px-5 py-4 text-xs text-[#6D4C41]">
                      <span className="px-2.5 py-1 bg-[#FAF7F2] rounded-lg border border-[#EFEBE9] font-medium">
                        {b.HinhThucThanhToan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.TrangThai} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handlePrintClick(b)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          title="In hóa đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openStatusModal(b)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                          title="Sửa trạng thái"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(b.MaHD)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Xóa hóa đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân Trang */}
        {!loading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Modal Cập Nhật Trạng Thái */}
      {showStatusModal && editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in space-y-5 font-sans" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold text-[#2C1810]">
              Cập Nhật Trạng Thái HĐ #{editingBill.MaHD}
            </h3>
            
            <div className="space-y-2 text-left">
              {["Đã thanh toán", "Đã hoàn tiền", "Đã hủy"].map((st) => (
                <label 
                  key={st} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    newStatus === st 
                      ? 'border-[#C5963A] bg-[#C5963A]/10 text-[#2C1810] font-bold' 
                      : 'border-[#EFEBE9] hover:bg-[#FAF7F2] text-[#6D4C41]'
                  }`}
                >
                  <span className="text-xs">{st}</span>
                  <input 
                    type="radio" 
                    name="billStatus" 
                    value={st} 
                    checked={newStatus === st} 
                    onChange={(e) => setNewStatus(e.target.value)} 
                    className="w-4 h-4 text-[#C5963A] focus:ring-[#C5963A]"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleUpdateStatusConfirm}
                className="flex-1 py-2.5 bg-[#2C1810] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2.5 bg-[#FAF7F2] text-[#6D4C41] text-xs font-bold rounded-xl hover:bg-[#EFEBE9] transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal In Hóa Đơn */}
      {showInvoiceModal && printBillData && (
        <InvoicePrint 
          order={printBillData} 
          items={printBillItems} 
          onClose={() => setShowInvoiceModal(false)} 
        />
      )}
    </DashboardLayout>
  );
}
