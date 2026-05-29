import React, { useState, useEffect } from 'react';
import { User, Key, Edit, Save, Lock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfileTab({ user, api, showNotification, loadUser }) {
    // State nội bộ của Profile
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [profileForm, setProfileForm] = useState({ HoTen: '', Email: '', SDT: '', DiaChi: '' });

    // State Password & OTP
    const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
    const [otpStep, setOtpStep] = useState(1);
    const [otpForm, setOtpForm] = useState({ otpCode: '', newPass: '', confirmPass: '' });

    // Load dữ liệu user vào form khi user thay đổi
    useEffect(() => {
        if (user) {
            setProfileForm({
                HoTen: user.HoTen || '',
                Email: user.Email || '',
                SDT: user.SDT || '',
                DiaChi: user.DiaChi || ''
            });
        }
    }, [user]);

    // --- CÁC HÀM XỬ LÝ ---
    const handleUpdateProfile = async () => {
        if (!profileForm.HoTen.trim()) return showNotification("❌ Họ tên không được để trống", "error");
        try {
            await api.put(`/khachhang/${user.MaND}`, profileForm);
            const updatedUser = { ...user, ...profileForm };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            loadUser(); // Báo cho file cha load lại state user
            setIsEditingProfile(false);
            showNotification("✅ Cập nhật thông tin thành công!");
        } catch (error) {
            showNotification("❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message), "error");
        }
    };

    const handleChangePasswordStandard = async () => {
        if (passwordForm.newPass !== passwordForm.confirmPass) return showNotification("❌ Mật khẩu xác nhận không khớp!", "error");
        if (passwordForm.newPass.length < 6) return showNotification("❌ Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
        try {
            await api.put(`/auth/change-password`, { MaND: user.MaND, MatKhauCu: passwordForm.oldPass, MatKhauMoi: passwordForm.newPass });
            showNotification("✅ Đổi mật khẩu thành công!");
            setShowPasswordModal(false);
            setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
        } catch (error) {
            showNotification("❌ " + (error.response?.data?.message || "Mật khẩu cũ không đúng"), "error");
        }
    };

    const handleSendOTP = async () => {
        try {
            await api.post('/auth/forgot-password-otp', { email: user.Email });
            showNotification("✅ Mã OTP đã được gửi về Email của bạn!");
            setOtpStep(2);
        } catch (error) {
            showNotification("❌ Lỗi gửi OTP: " + (error.response?.data?.message || error.message), "error");
        }
    };

    const handleResetPasswordWithOTP = async () => {
        if (otpForm.newPass !== otpForm.confirmPass) return showNotification("❌ Mật khẩu xác nhận không khớp!", "error");
        try {
            await api.post('/auth/reset-password-otp', { email: user.Email, otp: otpForm.otpCode, newPassword: otpForm.newPass });
            showNotification("✅ Đặt lại mật khẩu thành công!");
            setShowPasswordModal(false);
            setIsForgotPasswordMode(false);
            setOtpStep(1);
            setOtpForm({ otpCode: '', newPass: '', confirmPass: '' });
        } catch (error) {
            showNotification("❌ Lỗi: " + (error.response?.data?.message || "Mã OTP không đúng"), "error");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-coffee-100 pb-4">
                <h2 className="font-heading text-2xl font-bold text-coffee-800 flex items-center gap-2">
                    <User className="text-gold" /> Thông tin tài khoản
                </h2>
            </div>

            <div className="bg-white rounded-3xl border border-coffee-100/50 p-6 md:p-8 shadow-xl shadow-coffee-900/5 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 border-b border-coffee-50 pb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-coffee-700 to-coffee-600 rounded-full flex items-center justify-center font-heading text-2xl font-bold text-white shadow-lg">
                        {user.HoTen.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-coffee-800">{user.HoTen}</h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-gold/10 text-gold-dark border border-gold/10 uppercase mt-1">
                            ⭐️ Member Gold
                        </span>
                    </div>
                </div>

                {/* Details Form */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Mail size={12} /> Email</label>
                            <input 
                                type="email"
                                value={profileForm.Email} 
                                onChange={(e) => setProfileForm({ ...profileForm, Email: e.target.value })}
                                disabled 
                                className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100/50 text-coffee-400 text-sm cursor-not-allowed font-medium" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><User size={12} /> Họ và tên</label>
                            <input 
                                type="text" 
                                value={profileForm.HoTen} 
                                onChange={(e) => setProfileForm({ ...profileForm, HoTen: e.target.value })} 
                                disabled={!isEditingProfile} 
                                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all ${
                                    isEditingProfile 
                                        ? 'bg-white border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-gold/30 text-coffee-800 font-semibold' 
                                        : 'bg-coffee-50/50 border border-transparent text-coffee-700 cursor-not-allowed font-medium'
                                }`} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Phone size={12} /> Số điện thoại</label>
                            <input 
                                type="text" 
                                value={profileForm.SDT} 
                                onChange={(e) => setProfileForm({ ...profileForm, SDT: e.target.value })} 
                                disabled={!isEditingProfile} 
                                placeholder="Chưa cập nhật SĐT"
                                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all font-mono ${
                                    isEditingProfile 
                                        ? 'bg-white border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-gold/30 text-coffee-800 font-semibold' 
                                        : 'bg-coffee-50/50 border border-transparent text-coffee-700 cursor-not-allowed font-medium'
                                }`} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Địa chỉ</label>
                            <input 
                                type="text" 
                                value={profileForm.DiaChi} 
                                onChange={(e) => setProfileForm({ ...profileForm, DiaChi: e.target.value })} 
                                disabled={!isEditingProfile} 
                                placeholder="Chưa cập nhật địa chỉ"
                                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all ${
                                    isEditingProfile 
                                        ? 'bg-white border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-gold/30 text-coffee-800 font-semibold' 
                                        : 'bg-coffee-50/50 border border-transparent text-coffee-700 cursor-not-allowed font-medium'
                                }`} 
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-coffee-50">
                    {isEditingProfile ? (
                        <>
                            <button 
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 hover:from-coffee-600 hover:to-coffee-500 text-white font-medium rounded-xl text-sm shadow-md shadow-coffee-700/10 transition-all" 
                                onClick={handleUpdateProfile}
                            >
                                <Save size={16} /> Lưu thay đổi
                            </button>
                            <button 
                                className="px-5 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" 
                                onClick={() => setIsEditingProfile(false)}
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button 
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 hover:from-coffee-600 hover:to-coffee-500 text-white font-medium rounded-xl text-sm shadow-md shadow-coffee-700/10 transition-all" 
                            onClick={() => setIsEditingProfile(true)}
                        >
                            <Edit size={16} /> Chỉnh sửa thông tin
                        </button>
                    )}
                    {!isEditingProfile && (
                        <button 
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 hover:text-coffee-800 transition-all" 
                            onClick={() => { setIsForgotPasswordMode(false); setShowPasswordModal(true); }}
                        >
                            <Key size={16} /> Đổi mật khẩu
                        </button>
                    )}
                </div>
            </div>

            {/* MODAL PASSWORD / OTP */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-coffee-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-coffee-50">
                            <h3 className="font-heading text-lg font-bold text-coffee-800">
                                {isForgotPasswordMode ? (otpStep === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu") : "Đổi mật khẩu"}
                            </h3>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-400 hover:text-coffee-700 transition-colors" onClick={() => setShowPasswordModal(false)}>✕</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {!isForgotPasswordMode && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Mật khẩu cũ</label>
                                        <input
                                            type="password"
                                            placeholder="Nhập mật khẩu hiện tại"
                                            autoComplete='new-password'
                                            value={passwordForm.oldPass}
                                            onChange={e => setPasswordForm({ ...passwordForm, oldPass: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Mật khẩu mới</label>
                                        <input 
                                            type="password"
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={passwordForm.newPass}
                                            onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Xác nhận mật khẩu mới</label>
                                        <input 
                                            type="password"
                                            placeholder="Xác nhận lại mật khẩu mới"
                                            value={passwordForm.confirmPass}
                                            onChange={e => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <button 
                                            className="text-xs font-semibold text-gold hover:text-gold-dark transition-colors underline bg-none border-none p-0 cursor-pointer"
                                            onClick={() => { setIsForgotPasswordMode(true); setOtpStep(1); }}
                                        >
                                            Quên mật khẩu?
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-3 pt-2">
                                        <button className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10" onClick={handleChangePasswordStandard}>Lưu mật khẩu</button>
                                        <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setShowPasswordModal(false)}>Hủy</button>
                                    </div>
                                </>
                            )}
                            {isForgotPasswordMode && otpStep === 1 && (
                                <div className="space-y-4 text-center py-4">
                                    <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto text-xl">✉️</div>
                                    <p className="text-sm text-coffee-600">Chúng tôi sẽ gửi mã OTP bảo mật đến email:<br /><strong className="text-coffee-800">{user.Email}</strong></p>
                                    <div className="flex gap-3 pt-4">
                                        <button className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10" onClick={handleSendOTP}>Gửi OTP ngay</button>
                                        <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setIsForgotPasswordMode(false)}>Quay lại</button>
                                    </div>
                                </div>
                            )}
                            {isForgotPasswordMode && otpStep === 2 && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Mã OTP bảo mật</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nhập mã 6 số được gửi qua email..." 
                                            value={otpForm.otpCode} 
                                            onChange={e => setOtpForm({ ...otpForm, otpCode: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all text-center tracking-widest font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={otpForm.newPass} 
                                            onChange={e => setOtpForm({ ...otpForm, newPass: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-coffee-500 uppercase tracking-wider mb-1.5">Xác nhận mật khẩu mới</label>
                                        <input 
                                            type="password" 
                                            placeholder="Xác nhận lại mật khẩu mới"
                                            value={otpForm.confirmPass} 
                                            onChange={e => setOtpForm({ ...otpForm, confirmPass: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-coffee-50 border border-coffee-100 text-coffee-800 focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button className="flex-1 py-2.5 bg-gradient-to-r from-coffee-700 to-coffee-600 text-white font-medium rounded-xl text-sm hover:from-coffee-600 hover:to-coffee-500 transition-all shadow-md shadow-coffee-700/10" onClick={handleResetPasswordWithOTP}>Xác nhận đổi</button>
                                        <button className="px-4 py-2.5 bg-white border border-coffee-200 text-coffee-600 font-medium rounded-xl text-sm hover:bg-coffee-50 transition-colors" onClick={() => setOtpStep(1)}>Quay lại</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}