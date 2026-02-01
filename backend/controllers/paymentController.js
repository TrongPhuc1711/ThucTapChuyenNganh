import moment from 'moment';
import querystring from 'qs';
import crypto from 'crypto';
import pool from '../config/db.js';  

// CẤU HÌNH
const config = {
    vnp_TmnCode: "HAKQ3E6D",
    vnp_HashSecret: "RBR9QNKZFM797W2THL4QHPVE1NNIVD37",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: "http://localhost:5173/payment-result" 
};

// 1. TẠO URL THANH TOÁN
export const createPaymentUrl = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let { amount, orderId, bankCode } = req.body;
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = config.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; 
    vnp_Params['vnp_ReturnUrl'] = config.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if(bankCode === 'NCB'){
        vnp_Params['vnp_BankCode'] = 'NCB';
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    let vnpUrl = config.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    res.json({ url: vnpUrl });
};

// 2. XỬ LÝ KẾT QUẢ VÀ TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
export const vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    // Kiểm tra chữ ký bảo mật
    if(secureHash === signed){
        // Kiểm tra mã lỗi (00 là thành công)
        if(vnp_Params['vnp_ResponseCode'] === '00') {
            try {
                // Lấy mã đơn hàng từ tham số trả về
                const orderId = vnp_Params['vnp_TxnRef'];

                // Tự động cập nhật Database thành 'Đã thanh toán' ngay lập tức
                await pool.execute(
                    "UPDATE donhang SET TrangThai = ?, PhuongThucThanhToan = ? WHERE MaDH = ?", 
                    ['Đã thanh toán', 'Ví điện tử', orderId]
                );

                // Trả về thành công cho Frontend
                res.json({ status: 'success', code: vnp_Params['vnp_ResponseCode'] });
            } catch (error) {
                console.error("Lỗi cập nhật DB:", error);
                res.json({ status: 'error', message: 'Lỗi cập nhật trạng thái đơn hàng' });
            }
        } else {
            // Thanh toán thất bại/Hủy
            res.json({ status: 'fail', code: vnp_Params['vnp_ResponseCode'] });
        }
    } else {
        res.json({ status: 'error', message: 'Sai chữ ký (Checksum failed)' });
    }
};

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
		    str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}