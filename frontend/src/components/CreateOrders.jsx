import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";
import "../styles/CreateOrders.css";

export default function CreateOrder() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ HoTen: "Khách lẻ", SDT: "", DiaChi: "Tại quầy" });

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await api.get("/mon");
                const productsWithPrice = await Promise.all(res.data.map(async (p) => {
                    const detail = await api.get(`/chitietmon/mon/${p.MaMon}`);
                    return { ...p, prices: detail.data };
                }));
                setProducts(productsWithPrice);
            } catch (err) { console.error("Lỗi tải món:", err); }
        };
        loadProducts();
    }, []);

    const addToCart = (product, sizeDetail) => {
        // Tìm xem món này với kích cỡ này đã có trong giỏ chưa
        const itemInCart = cart.find(item => item.MaCTM === sizeDetail.MaCTM);
        if (itemInCart) {
            setCart(cart.map(item => item.MaCTM === sizeDetail.MaCTM ? { ...item, SoLuong: item.SoLuong + 1 } : item));
        } else {
            setCart([...cart, { ...product, ...sizeDetail, SoLuong: 1 }]);
        }
    };

    const removeFromCart = (maCTM) => {
        setCart(cart.filter(item => item.MaCTM !== maCTM));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
    };
    const calculateTotalchiadoi = () => {
        return cart.reduce((sum, item) => sum + ((item.Gia * item.SoLuong)/2), 0);
    };
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleCreateOrder = async () => {
        if (cart.length === 0) return alert("Giỏ hàng trống!");
        const path = window.location.pathname.includes("/admin") 
                 ? "/admin/checkout" 
                 : "/staff/checkout";
        navigate(path, {
            state: {
                cart: cart,
                total: calculateTotal()
            }
        });
    };

    return (
        <DashboardLayout title="Bán Hàng Tại Quầy">
            <div className="create-order-grid">
                {/* PHẦN TRÁI: DANH SÁCH MÓN ĂN */}
                <div className="product-selection-area">
                    <div className="product-grid-scroll">
                        {products.map(p => (
                            <div key={p.MaMon} className="product-card-staff">
                                <h4>{p.TenMon}</h4>
                                <div className="size-selector">
                                    {p.prices.map(s => (
                                        <button key={s.MaCTM} className="btn-size-item" onClick={() => addToCart(p, s)}>
                                            {s.KichCo}: {formatVND(s.Gia)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PHẦN PHẢI: GIỎ HÀNG */}
                <div className="cart-panel">
                    <div className="cart-header">
                        <h3>🛒 CHI TIẾT ĐƠN HÀNG</h3>
                    </div>

                    <div className="cart-items-list">
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '40px', color: '#999' }}>
                                <p>Giỏ hàng đang trống</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.MaCTM} className="cart-item-row">
                                    <div className="cart-item-info">
                                        <b>{item.TenMon}</b>
                                        <span>{item.KichCo} x {item.SoLuong}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <b style={{ color: '#4e342e' }}>{formatVND((item.Gia * item.SoLuong))}</b>
                                        <button className="btn-remove-item" onClick={() => removeFromCart(item.MaCTM)}>✕</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* VÙNG THANH TOÁN CỐ ĐỊNH Ở ĐÁY */}
                    <div className="cart-checkout-section">
                        <div className="total-row">
                            <span>Tổng cộng</span>
                            <span>{formatVND(calculateTotal())}</span>
                            
                        </div>
                        <div><span>Tổng tiền chia doi</span>
                        <span>{formatVND(calculateTotalchiadoi())}</span></div>
                        <button className="btn-confirm-order" onClick={handleCreateOrder} disabled={cart.length === 0}>
                            XÁC NHẬN & IN ĐƠN
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}