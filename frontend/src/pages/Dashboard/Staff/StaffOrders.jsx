import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../../components/DashboardLayout";
import InvoicePrint from "../../../components/InvoicePrint";
import { Printer } from 'lucide-react';

export default function StaffOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]); const [filterOrders, setFilterOrders] = useState([]);
    const [loading, setLoading] = useState(true); const [selectedOrder, setSelectedOrder] = useState(null); const [orderDetails, setOrderDetails] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all"); const [search, setSearch] = useState(""); const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const statusOptions = [{ value: "all", label: "Tất cả" },{ value: "Treo", label: "Chờ xử lý" },{ value: "Đang xử lý", label: "Đang xử lý" },{ value: "Đang giao", label: "Đang giao" },{ value: "Đã giao", label: "Đã giao" },{ value: "Đã hủy", label: "Đã hủy" }];
    const filteredOrders = () => { let filter = orders; if (filterStatus !== "all") filter = filter.filter(o => o.TrangThai === filterStatus); if (search) filter = filter.filter(o => o.MaDH.toString().includes(search) || o.TenNguoiNhan.toLowerCase().includes(search.toLowerCase()) || o.SDTNguoiNhan.includes(search)); setFilterOrders(filter); };
    useEffect(() => { fetchOrders(); }, []); useEffect(() => { filteredOrders(); }, [orders, filterStatus, search]);
    const fetchOrders = async () => { try { const response = await api.get("/donhang"); setOrders(response.data); } catch (error) { console.error("Lỗi tải đơn hàng:", error); } finally { setLoading(false); } };
    const viewOrderDetails = async (order) => { try { const response = await api.get(`/donhang/chitiet/${order.MaDH}`); setOrderDetails(response.data); setSelectedOrder(order); } catch (error) { alert("Không thể tải chi tiết đơn hàng"); } };
    const updateOrdersStatus = async (orderID, newStatus) => { if (selectedOrder.TrangThai === "Đã thanh toán" || selectedOrder.TrangThai === "Đã giao") { if (newStatus !== "Đã hủy") { alert("Đơn hàng đã hoàn tất. Không thể đổi trạng thái khác!"); return; } else { if (!window.confirm("CẢNH BÁO: Đơn hàng ĐÃ THANH TOÁN. Hủy đơn đồng nghĩa với việc phải HOÀN TIỀN cho khách. Bạn có chắc chắn?")) return; } } if (selectedOrder.TrangThai === "Đã hủy") { alert("Đơn hàng đã hủy không thể khôi phục!"); return; } try { await api.put(`/donhang/${orderID}`, { TrangThai: newStatus }); if (newStatus === "Đã hủy" && selectedOrder.TrangThai === "Đã thanh toán") alert("Đã hủy đơn thành công! Vui lòng thực hiện hoàn tiền."); else alert("Cập nhật trạng thái thành công!"); fetchOrders(); if (selectedOrder && selectedOrder.MaDH === orderID) setSelectedOrder({ ...selectedOrder, TrangThai: newStatus }); } catch (error) { alert(error.response?.data?.message || "Không thể cập nhật trạng thái"); } };
    const getStatusBadge = (status) => { const styles = { "Treo": "bg-warning-light text-warning", "Đang xử lý": "bg-info-light text-info", "Đang giao": "bg-purple-100 text-purple-700", "Đã giao": "bg-success-light text-success", "Đã hủy": "bg-danger-light text-danger" }; return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || "bg-coffee-100 text-coffee-600"}`}>{status}</span>; };
    const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");
    const formatMoney = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    if (loading) return <DashboardLayout title="Quản lý đơn hàng"><div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-coffee-200 border-t-gold rounded-full animate-spin"></div></div></DashboardLayout>;

    return (
        <DashboardLayout title="Quản lý đơn hàng">
            <div className="bg-white rounded-2xl border border-coffee-100/50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-coffee-50"><div className="flex flex-wrap items-center gap-3">
                    <input type="text" placeholder="Tìm theo mã, tên, SĐT.." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 placeholder-coffee-300 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30">{statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                    <span className="text-sm text-coffee-400">Tổng: <strong className="text-coffee-700">{filterOrders.length}</strong> đơn</span>
                    <button onClick={() => navigate('/staff/create-order')} className="px-4 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white text-sm font-medium rounded-xl hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/20">+ Tạo đơn</button>
                </div></div>
                {filterOrders.length === 0 ? <div className="p-12 text-center"><p className="text-coffee-300">Không tìm thấy đơn hàng nào</p></div> : (
                    <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Mã ĐH</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Khách hàng</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">SĐT</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Địa chỉ</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Tổng tiền</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Trạng thái</th><th className="text-left px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Ngày đặt</th><th className="text-center px-4 py-3 text-xs font-semibold text-coffee-500 uppercase">Thao tác</th>
                    </tr></thead><tbody className="divide-y divide-coffee-50">{filterOrders.map(order => (
                        <tr key={order.MaDH} className="hover:bg-coffee-50/30 transition-colors"><td className="px-4 py-3 text-sm font-semibold text-gold">#{order.MaDH}</td><td className="px-4 py-3 text-sm font-medium text-coffee-800">{order.TenNguoiNhan}</td><td className="px-4 py-3 text-sm text-coffee-500">{order.SDTNguoiNhan}</td><td className="px-4 py-3 text-sm text-coffee-400 max-w-[120px] truncate">{order.DiaChiGiaoHang}</td><td className="px-4 py-3 text-sm font-semibold text-coffee-800">{formatMoney(order.TongTien)}</td><td className="px-4 py-3">{getStatusBadge(order.TrangThai)}</td><td className="px-4 py-3 text-sm text-coffee-500">{formatDate(order.NgayDat)}</td><td className="px-4 py-3 text-center"><button className="px-3 py-1.5 text-xs font-medium text-info bg-info-light rounded-lg hover:bg-info/10 transition-colors" onClick={() => viewOrderDetails(order)}>Xem</button></td></tr>
                    ))}</tbody></table></div>
                )}
            </div>

            {/* Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-coffee-50"><h3 className="font-heading text-xl font-bold text-coffee-800">Chi tiết đơn hàng #{selectedOrder.MaDH}</h3><button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors">✕</button></div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3">{[["Người nhận", selectedOrder.TenNguoiNhan],["SĐT", selectedOrder.SDTNguoiNhan],["Địa chỉ", selectedOrder.DiaChiGiaoHang],["Thanh toán", selectedOrder.PhuongThucThanhToan]].map(([l,v],i) => <div key={i} className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">{l}</p><p className="text-sm font-medium text-coffee-800">{v || "—"}</p></div>)}<div className="bg-coffee-50/50 rounded-xl p-3"><p className="text-xs text-coffee-400 mb-1">Trạng thái</p>{getStatusBadge(selectedOrder.TrangThai)}</div></div>
                            <div><h4 className="text-sm font-semibold text-coffee-700 mb-3">Danh sách món</h4>
                                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-coffee-50/50"><th className="text-left px-3 py-2 text-xs font-semibold text-coffee-500">Món</th><th className="text-left px-3 py-2 text-xs font-semibold text-coffee-500">Size</th><th className="text-left px-3 py-2 text-xs font-semibold text-coffee-500">SL</th><th className="text-left px-3 py-2 text-xs font-semibold text-coffee-500">Đơn giá</th><th className="text-right px-3 py-2 text-xs font-semibold text-coffee-500">Thành tiền</th></tr></thead>
                                    <tbody className="divide-y divide-coffee-50">{orderDetails.map((item, index) => (<tr key={index} className="hover:bg-coffee-50/30"><td className="px-3 py-2 text-sm text-coffee-800 flex items-center gap-2"><img src={item.HinhAnh} alt="" className="w-8 h-8 rounded-lg object-cover" />{item.TenMon}</td><td className="px-3 py-2 text-sm text-coffee-500">{item.KichCo}</td><td className="px-3 py-2 text-sm text-coffee-500">{item.SoLuong}</td><td className="px-3 py-2 text-sm text-coffee-500">{formatMoney(item.DonGia)}</td><td className="px-3 py-2 text-sm font-semibold text-gold text-right">{formatMoney(item.DonGia * item.SoLuong)}</td></tr>))}</tbody>
                                    <tfoot><tr className="bg-coffee-700 text-white"><td colSpan="4" className="px-3 py-3 font-medium text-sm">Tổng cộng:</td><td className="px-3 py-3 text-right font-bold">{formatMoney(selectedOrder.TongTien)}</td></tr></tfoot>
                                </table></div>
                            </div>
                            <div><h4 className="text-sm font-semibold text-coffee-700 mb-3">Cập nhật trạng thái</h4><div className="flex flex-wrap gap-2">{statusOptions.filter(s => s.value !== "all" && s.value !== selectedOrder.TrangThai).map(status => { const isInvalid = (selectedOrder.TrangThai === "Đã thanh toán" || selectedOrder.TrangThai === "Đã giao") && status.value !== "Đã hủy"; return (<button key={status.value} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${isInvalid ? 'bg-coffee-50 text-coffee-300 cursor-not-allowed' : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'}`} onClick={() => updateOrdersStatus(selectedOrder.MaDH, status.value)}>{status.label}</button>); })}</div></div>
                        </div>
                        <div className="flex gap-3 p-6 pt-0"><button onClick={() => setShowInvoiceModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all"><Printer size={16} /> In Hóa Đơn</button></div>
                    </div>
                </div>
            )}
            {showInvoiceModal && selectedOrder && <InvoicePrint order={selectedOrder} items={orderDetails} onClose={() => setShowInvoiceModal(false)} />}
        </DashboardLayout>
    );
}