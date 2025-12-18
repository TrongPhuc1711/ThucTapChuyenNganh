import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/Dashboard/Staff/Staff_Orders.css";

export default function StaffOrders() {
    const [orders, setOrders] = useState([]);
    const [filterOrders, setFilterOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [search, setSearch] = useState("");
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
    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filteredOrders();
    }, [orders, filterStatus, search]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:4000/api/donhang", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
            alert("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    }

    const viewOrderDetails = async (order) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:4000/api/donhang/chitiet/${order.MaDH}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrderDetails(response.data);
            setSelectedOrder(order);
        } catch (error) {
            console.error("Lỗi tải chi tiết:", error);
            alert("Không thể tải chi tiết đơn hàng");
        }
    }

    const updateOrdersStatus = async (orderID, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:4000/api/donhang/${orderID}`,
                { TrangThai: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Cập nhật trạng thái thành công!");
            fetchOrders();

            // Cập nhật selectedOrder nếu đang xem
            if (selectedOrder && selectedOrder.MaDH === orderID) {
                setSelectedOrder({ ...selectedOrder, TrangThai: newStatus });
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
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
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };
    const formatMoney = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    };

    if (loading) {
        return (
            <DashboardLayout title="Quản lý đơn hàng">
                <div className="loading">Đang tải...</div>
            </DashboardLayout>
        );
    }
    return (
        <DashboardLayout>
            <div className="staff-orders-container">
                {/* Bộ lọc và tìm kiếm */}
                <div className="filters-section">
                    <div className="search-box">
                        <input type="text" placeholder="Tìm theo mã, tên, SĐT.."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="search-icon">🔍</span>
                </div>
                <div className="status-filter">
                    <label>Lọc trạng thái:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="stats-summary">
                    <span>Tổng: <strong>{filteredOrders.length}</strong> đơn</span>
                </div>

                {/* Danh sách đơn hàng */}
                <div className="orders-list">
                    {filterOrders.length === 0 ? (
                        <div className="empty-state">
                            <p>Không tìm thấy đơn hàng nào</p>
                        </div>
                    ) : (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Mã ĐH</th>
                                    <th>Khách hàng</th>
                                    <th>SĐT</th>
                                    <th>Địa chỉ</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày đặt</th>
                                    <th>Thao tác</th>
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
                                        <td>
                                            <button
                                                className="btn-view"
                                                onClick={() => viewOrderDetails(order)}
                                            >
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Modal chi tiết đơn hàng */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header-staff">
                                <h2>Chi tiết đơn hàng #{selectedOrder.MaDH}</h2>
                                <button className="btn-close" onClick={() => setSelectedOrder(null)}>✕</button>
                            </div>

                            <div className="modal-body">
                                {/* Thông tin khách hàng */}
                                <div className="info-section">
                                    <h3>📋 Thông tin giao hàng</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Người nhận:</label>
                                            <span>{selectedOrder.TenNguoiNhan}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Số điện thoại:</label>
                                            <span>{selectedOrder.SDTNguoiNhan}</span>
                                        </div>
                                        <div className="info-item full-width">
                                            <label>Địa chỉ:</label>
                                            <span>{selectedOrder.DiaChiGiaoHang}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Thanh toán:</label>
                                            <span>{selectedOrder.PhuongThucThanhToan}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Trạng thái:</label>
                                            {getStatusBadge(selectedOrder.TrangThai)}
                                        </div>
                                    </div>
                                </div>
                                {/* Chi tiết món */}
                                <div className="items-section">
                                    <h3>☕ Danh sách món</h3>
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Món</th>
                                                <th>Size</th>
                                                <th>SL</th>
                                                <th>Đơn giá</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
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
                                                    <td className="total-price">
                                                        {formatMoney(item.DonGia * item.SoLuong)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="4"><strong>Tổng cộng:</strong></td>
                                                <td className="grand-total">
                                                    <strong>{formatMoney(selectedOrder.TongTien)}</strong>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Cập nhật trạng thái */}
                                <div className="status-section">
                                    <h3>🔄 Cập nhật trạng thái</h3>
                                    <div className="status-buttons">
                                        {statusOptions
                                            .filter(s => s.value !== "all" && s.value !== selectedOrder.TrangThai)
                                            .map(status => (
                                                <button
                                                    key={status.value}
                                                    className={`btn-status ${status.value.toLowerCase().replace(' ', '-')}`}
                                                    onClick={() => updateOrdersStatus(selectedOrder.MaDH, status.value)}
                                                >
                                                    {status.label}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout >
    );
}