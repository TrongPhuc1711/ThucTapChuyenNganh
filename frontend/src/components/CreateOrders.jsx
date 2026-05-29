import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "./DashboardLayout";

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

    const updateQuantity = (maCTM, amount) => {
        const newCart = cart.map(item => {
            if (item.MaCTM === maCTM) {
                const newQty = item.SoLuong + amount;
                return { ...item, SoLuong: newQty > 0 ? newQty : 1 };
            }
            return item;
        });
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.Gia * item.SoLuong), 0);
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-fade-in">
                {/* PHẦN TRÁI: DANH SÁCH MÓN ĂN */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-coffee-100/50 p-5 shadow-sm">
                        <h2 className="font-heading text-lg font-bold text-coffee-800 mb-4">Thực đơn tại quán</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                            {products.map(p => (
                                <div key={p.MaMon} className="group bg-coffee-50/50 border border-coffee-100/50 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-semibold text-gold tracking-wider uppercase">{p.TenLM}</span>
                                        <h4 className="font-heading font-bold text-coffee-800 text-sm group-hover:text-gold transition-colors">{p.TenMon}</h4>
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        {p.prices.map(s => (
                                            <button 
                                                key={s.MaCTM} 
                                                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-coffee-100 hover:border-gold hover:bg-gold/5 rounded-xl text-xs font-semibold text-coffee-700 transition-all active:scale-98"
                                                onClick={() => addToCart(p, s)}
                                            >
                                                <span>Size {s.KichCo}</span>
                                                <span className="text-gold font-bold font-mono">{formatVND(s.Gia)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PHẦN PHẢI: GIỎ HÀNG */}
                <div className="xl:col-span-1 bg-white rounded-2xl border border-coffee-100/50 shadow-md flex flex-col max-h-[85vh] sticky top-6 overflow-hidden">
                    <div className="p-5 border-b border-coffee-50 bg-coffee-50/30 flex items-center justify-between">
                        <h3 className="font-heading font-bold text-coffee-800 text-base flex items-center gap-1.5">🛒 Chi tiết đơn hàng</h3>
                        <span className="px-2.5 py-0.5 bg-coffee-200 text-coffee-700 text-[10px] font-bold rounded-full">{cart.reduce((sum, item) => sum + item.SoLuong, 0)} món</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[300px]">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-12">
                                <span className="text-3xl">☕</span>
                                <p className="text-xs text-coffee-300 font-semibold uppercase tracking-wider">Đơn hàng trống</p>
                                <p className="text-[11px] text-coffee-400">Chọn kích cỡ món bên trái để thêm</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.MaCTM} className="flex items-center justify-between gap-3 p-3 bg-coffee-50/50 border border-coffee-100/50 rounded-xl">
                                    <div className="space-y-1">
                                        <b className="text-xs text-coffee-800 font-bold block">{item.TenMon}</b>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-coffee-100 text-coffee-600 text-[9px] font-bold rounded-full">
                                            Size {item.KichCo}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-white border border-coffee-100 rounded-lg px-1 py-0.5">
                                            <button onClick={() => updateQuantity(item.MaCTM, -1)} className="text-coffee-400 hover:text-coffee-700 p-0.5 transition-colors text-[9px] font-bold">◀</button>
                                            <span className="text-xs font-bold text-coffee-800 px-2 font-mono">{item.SoLuong}</span>
                                            <button onClick={() => updateQuantity(item.MaCTM, 1)} className="text-coffee-400 hover:text-coffee-700 p-0.5 transition-colors text-[9px] font-bold">▶</button>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-xs font-bold text-coffee-800 font-mono block">{formatVND((item.Gia * item.SoLuong))}</span>
                                            <button className="text-[10px] text-danger hover:underline font-semibold" onClick={() => removeFromCart(item.MaCTM)}>Xóa</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* VÙNG THANH TOÁN CỐ ĐỊNH Ở ĐÁY */}
                    <div className="p-5 border-t border-coffee-100 bg-coffee-50/30 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-coffee-500 uppercase tracking-wider text-xs">Tổng số tiền</span>
                            <span className="font-heading text-lg font-extrabold text-gold font-mono">{formatVND(calculateTotal())}</span>
                        </div>
                        <button 
                            className="w-full py-3.5 bg-gradient-to-r from-coffee-700 to-coffee-600 hover:from-coffee-600 hover:to-coffee-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-coffee-700/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed" 
                            onClick={handleCreateOrder} 
                            disabled={cart.length === 0}
                        >
                            XÁC NHẬN & IN ĐƠN
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}