import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/Staff/Staff_Orders.css";
import InvoicePrint from "../../../components/InvoicePrint";
import { Printer } from 'lucide-react';

// 1. Khai báo API_URL dùng chung
const API_URL = "https://thuctapchuyennganh.onrender.com/api";

export default function StaffOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filterOrders, setFilterOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    
    const statusOptions = [
        { value: "all", label: "Tất cả" },
        { value: "Treo", label: "Chờ xử lý" },
        { value: "Đang xử lý", label: "Đang xử lý" },
        { value: "Đang giao", label: "Đang giao" },
        { value: "Đã giao", label: "Đã giao" },
        { value: "Đã hủy", label: "Đã hủy" }
    ];

    const filteredOrders = () => {
        let filter = orders;
        if (filterStatus !== "all") {
            filter = filter.filter(orders => orders.TrangThai === filterStatus);
        }
        if (search) {
            filter = filter.filter(
                order => order.MaDH.toString().includes(search) ||
                    order.TenNguoiNhan.toLowerCase().includes(search.toLowerCase()) ||
                    order.SDTNguoiNhan.includes(search)
            );
        }
        setFilterOrders(filter);
    };

    useEffect(() => { fetchOrders(); }, []);
    useEffect(() => { filteredOrders(); }, [orders, filterStatus, search]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            // Sử dụng API_URL
            const response = await axios.get(`${API_URL}/donhang`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    }

    const viewOrderDetails = async (order) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_URL}/donhang/chitiet/${order.MaDH}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrderDetails(response.data);
            setSelectedOrder(order);
        } catch (error) {
            alert("Không thể tải chi tiết đơn hàng");
        }
    }

   
    const updateOrdersStatus = async (orderID, newStatus) => {
        
        if (selectedOrder.TrangThai === "Đã thanh toán" || selectedOrder.TrangThai === "Đã giao") {
            // Nếu muốn chuyển sang trạng thái khác NGOÀI Đã hủy -> Chặn
            if (newStatus !== "Đã hủy") {
                alert("Đơn hàng đã hoàn tất (Thanh toán/Giao hàng). Không thể đổi trạng thái khác!");
                return;
            } else {
                
                if (!window.confirm("CẢNH BÁO: Đơn hàng ĐÃ THANH TOÁN. Hủy đơn đồng nghĩa với việc phải HOÀN TIỀN cho khách. Bạn có chắc chắn?")) {
                    return;
                }
            }
        }

        if (selectedOrder.TrangThai === "Đã hủy") {
            alert("Đơn hàng đã hủy không thể khôi phục!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_URL}/donhang/${orderID}`,
                { TrangThai: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (newStatus === "Đã hủy" && selectedOrder.TrangThai === "Đã thanh toán") {
                alert("Đã hủy đơn thành công! Vui lòng thực hiện hoàn tiền.");
            } else {
                alert("Cập nhật trạng thái thành công!");
            }
            
            fetchOrders();
            if (selectedOrder && selectedOrder.MaDH === orderID) {
                setSelectedOrder({ ...selectedOrder, TrangThai: newStatus });
            }
        } catch (error) {
            alert(error.response?.data?.message || "Không thể cập nhật trạng thái");
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            "Treo": { class: "pending", text: "Chờ xử lý" },
            "Đang xử lý": { class: "processing", text: "Đang xử lý" },
            "Đang giao": { class: "shipping", text: "Đang giao" },
            "Đã giao": { class: "completed", text: "Đã giao" },
            "Đã hủy": { class: "cancelled", text: "Đã hủy" }
        };
        const badge = badges[status] || { class: "", text: status };
        return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");
    const formatMoney = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    if (loading) return <DashboardLayout title="Quản lý đơn hàng"><div className="loading">Đang tải...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="staff-orders-container">
                <div className="filters-section">
                    <div className="search-box">
                        <input type="text" placeholder="Tìm theo mã, tên, SĐT.." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <span className="search-icon">🔍</span>
                    </div>
                    <div className="status-filter">
                        <label>Lọc trạng thái:</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="stats-summary"><span>Tổng: <strong>{filterOrders.length}</strong> đơn</span></div>
                    <button onClick={() => navigate('/staff/create-order')} className="btn-create-new-staff">Tạo đơn hàng</button>
                </div>

                <div className="orders-list">
                    {filterOrders.length === 0 ? <div className="empty-state"><p>Không tìm thấy đơn hàng nào</p></div> : (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Mã ĐH</th><th>Khách hàng</th><th>SĐT</th><th>Địa chỉ</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th><th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterOrders.map(order => (
                                    <tr key={order.MaDH}>
                                        <td>#{order.MaDH}</td>
                                        <td>{order.TenNguoiNhan}</td>
                                        <td>{order.SDTNguoiNhan}</td>
                                        <td className="address-cell">{order.DiaChiGiaoHang}</td>
                                        <td className="money-cell">{formatMoney(order.TongTien)}</td>
                                        <td>{getStatusBadge(order.TrangThai)}</td>
                                        <td>{formatDate(order.NgayDat)}</td>
                                        <td><button className="btn-view" onClick={() => viewOrderDetails(order)}>Xem</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            
                            {/* HEADER */}
                            <div className="modal-header-staff">
                                <h2>Chi tiết đơn hàng #{selectedOrder.MaDH}</h2>
                                <button className="btn-close-staff-order" onClick={() => setSelectedOrder(null)}>✕</button>
                            </div>

                            {/* BODY  */}
                            <div className="modal-body">
                                <div className="info-section">
                                    <h3>Thông tin giao hàng</h3>
                                    <div className="info-grid">
                                        <div className="info-item"><label>Người nhận:</label><span>{selectedOrder.TenNguoiNhan}</span></div>
                                        <div className="info-item"><label>SĐT:</label><span>{selectedOrder.SDTNguoiNhan}</span></div>
                                        <div className="info-item full-width"><label>Địa chỉ:</label><span>{selectedOrder.DiaChiGiaoHang}</span></div>
                                        <div className="info-item"><label>Thanh toán:</label><span>{selectedOrder.PhuongThucThanhToan}</span></div>
                                        <div className="info-item"><label>Trạng thái:</label>{getStatusBadge(selectedOrder.TrangThai)}</div>
                                    </div>
                                </div>

                                <div className="items-section">
                                    <h3>Danh sách món</h3>
                                    <table className="items-table">
                                        <thead><tr><th>Món</th><th>Size</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
                                        <tbody>
                                            {orderDetails.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div className="item-info">
                                                            <img src={item.HinhAnh} alt={item.TenMon} />
                                                            <span>{item.TenMon}</span>
                                                        </div>
                                                    </td>
                                                    <td>{item.KichCo}</td>
                                                    <td>{item.SoLuong}</td>
                                                    <td>{formatMoney(item.DonGia)}</td>
                                                    <td className="total-price">{formatMoney(item.DonGia * item.SoLuong)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4"><strong>Tổng cộng:</strong></td>
                                                <td className="grand-total"><strong>{formatMoney(selectedOrder.TongTien)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="status-section">
                                    <h3>Cập nhật trạng thái</h3>
                                    <div className="status-buttons">
                                        {statusOptions
                                            .filter(s => s.value !== "all" && s.value !== selectedOrder.TrangThai)
                                            .map(status => {
                                                
                                                const isInvalid = (selectedOrder.TrangThai === "Đã thanh toán" || selectedOrder.TrangThai === "Đã giao") && status.value !== "Đã hủy";
                                                
                                                return (
                                                    <button
                                                        key={status.value}
                                                        className={`btn-status ${status.value.toLowerCase().replace(' ', '-')}`}
                                                        style={isInvalid ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                        onClick={() => updateOrdersStatus(selectedOrder.MaDH, status.value)}
                                                    >
                                                        {status.label}
                                                    </button>
                                                )
                                            })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer-staff">
                                <button 
                                    onClick={() => setShowInvoiceModal(true)}
                                    className="btn-print-action"
                                >
                                    <Printer size={18} /> In Hóa Đơn
                                </button>
                                
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {showInvoiceModal && selectedOrder && (
                <InvoicePrint 
                    order={selectedOrder}
                    items={orderDetails}
                    onClose={() => setShowInvoiceModal(false)}
                />
            )}
        </DashboardLayout>
    );
}