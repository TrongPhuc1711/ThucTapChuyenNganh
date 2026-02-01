import React, { useState, useEffect } from 'react';
import { User, Key, Edit, Save } from 'lucide-react';

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
        <div className="page-wrapper container-narrow">
            <h2 className="section-title">Quản lý tài khoản</h2>
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar-placeholder">{user.HoTen.charAt(0)}</div>
                    <div><h3 className="profile-name">{user.HoTen}</h3></div>
                </div>
                <div className="profile-details-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email"
                            value={profileForm.Email} onChange={(e) => setProfileForm({ ...profileForm, Email: e.target.value })}
                            disabled={!isEditingProfile} className={!isEditingProfile ? "input-readonly" : ""} />
                    </div>
                    <div className="form-group"><label>Họ và tên</label><input type="text" value={profileForm.HoTen} onChange={(e) => setProfileForm({ ...profileForm, HoTen: e.target.value })} disabled={!isEditingProfile} className={!isEditingProfile ? "input-readonly" : ""} /></div>
                    <div className="form-group"><label>Số điện thoại</label><input type="text" value={profileForm.SDT} onChange={(e) => setProfileForm({ ...profileForm, SDT: e.target.value })} disabled={!isEditingProfile} className={!isEditingProfile ? "input-readonly" : ""} placeholder="Chưa cập nhật" /></div>
                    <div className="form-group"><label>Địa chỉ</label><input type="text" value={profileForm.DiaChi} onChange={(e) => setProfileForm({ ...profileForm, DiaChi: e.target.value })} disabled={!isEditingProfile} className={!isEditingProfile ? "input-readonly" : ""} placeholder="Chưa cập nhật" /></div>

                    <div className="profile-actions">
                        {isEditingProfile ? (
                            <><button className="btn-save-profile" onClick={handleUpdateProfile}><Save size={18} /> Lưu thay đổi</button><button className="btn-cancel-profile" onClick={() => setIsEditingProfile(false)}>Hủy</button></>
                        ) : (
                            <button className="btn-edit-profile" onClick={() => setIsEditingProfile(true)}><Edit size={18} /> Chỉnh sửa thông tin</button>
                        )}
                        {!isEditingProfile && (
                            <button className="btn-change-pass" onClick={() => { setIsForgotPasswordMode(false); setShowPasswordModal(true); }}><Key size={18} /> Đổi mật khẩu</button>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL PASSWORD / OTP */}
            {showPasswordModal && (
                <div className="modal-backdrop">
                    <div className="modal-box">
                        <h3>{isForgotPasswordMode ? (otpStep === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu") : "Đổi mật khẩu"}</h3>
                        {!isForgotPasswordMode && (
                            <>
                                <div className="form-group">
                                    <label>Mật khẩu cũ</label>
                                    <input
                                        type="password"
                                        placeholder="Nhập mật khẩu hiện tại"
                                        autoComplete='new-password'
                                        value={passwordForm.oldPass}
                                        onChange={e => setPasswordForm({ ...passwordForm, oldPass: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input type="password"
                                        value={passwordForm.newPass}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input type="password"
                                        value={passwordForm.confirmPass}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPass: e.target.value })} />
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => { setIsForgotPasswordMode(true); setOtpStep(1); }}>
                                        Quên mật khẩu?
                                    </button>
                                </div>
                                <div className="modal-actions">
                                    <button className="confirm-btn"
                                        onClick={handleChangePasswordStandard}>
                                        Lưu
                                    </button>
                                    <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Hủy</button>
                                </div>
                            </>
                        )}
                        {isForgotPasswordMode && otpStep === 1 && (
                            <><p style={{ marginBottom: '15px' }}>Chúng tôi sẽ gửi mã OTP đến email: <strong>{user.Email}</strong></p><div className="modal-actions"><button className="confirm-btn" onClick={handleSendOTP}>Gửi OTP</button><button className="cancel-btn" onClick={() => setIsForgotPasswordMode(false)}>Quay lại</button></div></>
                        )}
                        {isForgotPasswordMode && otpStep === 2 && (
                            <><div className="form-group"><label>Mã OTP</label><input type="text" placeholder="Nhập mã 6 số..." value={otpForm.otpCode} onChange={e => setOtpForm({ ...otpForm, otpCode: e.target.value })} /></div><div className="form-group"><label>Mật khẩu mới</label><input type="password" value={otpForm.newPass} onChange={e => setOtpForm({ ...otpForm, newPass: e.target.value })} /></div><div className="form-group"><label>Xác nhận mật khẩu</label><input type="password" value={otpForm.confirmPass} onChange={e => setOtpForm({ ...otpForm, confirmPass: e.target.value })} /></div><div className="modal-actions"><button className="confirm-btn" onClick={handleResetPasswordWithOTP}>Xác nhận</button><button className="cancel-btn" onClick={() => setOtpStep(1)}>Quay lại</button></div></>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}