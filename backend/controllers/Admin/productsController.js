import pool from '../../config/db.js';

//LẤY TẤT CẢ món (kèm tên loại món)
export const getAllMon = async (req, res) => {
    try {
        const query = `
            SELECT m.*, l.TenLM 
            FROM Mon m
            LEFT JOIN LoaiMon l ON m.MaLM = l.MaLM
            ORDER BY m.MaMon DESC`;
        const [mons] = await pool.query(query);
        res.json(mons);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy danh sách món" });
    }
};

//LẤY 1 món theo mã (kèm tên loại món)

export const getMonById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT m.*, l.TenLM 
            FROM Mon m
            LEFT JOIN LoaiMon l ON m.MaLM = l.MaLM
            WHERE m.MaMon = ?`;
        const [mons] = await pool.query(query, [id]);
        
        if (mons.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy món" });
        }
        
        res.json(mons[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lấy thông tin món" });
    }
};

/**
 THÊM món mới
 **/
export const createMon = async (req, res) => {
    const connection =await pool.getConnection();
    try {
        const { TenMon, MoTa, MaLM, ChiTietMon } = req.body;
        
        if (!TenMon || !MaLM) {
            return res.status(400).json({ message: "Tên món và Loại món không được để trống" });
        }
        let chiTietArr= [];
        //bắt đầu transaction
        await connection.beginTransaction();
        //lấy từ req.file chứ không phải req.body
        const HinhAnh = req.file && req.file.filename ? `/uploads/${req.file.filename}` : null;
        const insert = "INSERT INTO Mon (TenMon, MoTa, HinhAnh, MaLM) VALUES (?, ?, ?, ?)";
        const [result] = await connection.query(insert, [TenMon, MoTa || null, HinhAnh, MaLM]);
        
        const MaMon =result.insertId;
        if(ChiTietMon){
            if(typeof ChiTietMon === 'string'){
                chiTietArr=JSON.parse(ChiTietMon);
            }else{
                chiTietArr=ChiTietMon;
            }
        }

        if(chiTietArr && chiTietArr.length > 0){
            const insertChiTiet = "INSERT INTO ChiTietMon (MaMon, KichCo, Gia, TrangThai) VALUES (?, ?, ?, ?)";

            for(const ct of chiTietArr){
                if(ct.Gia && ct.Gia >0){
                    await connection.query(insertChiTiet, [
                        MaMon,
                        ct.KichCo,
                        ct.Gia,
                        ct.TrangThai || 'Còn bán'
                    ]);
                }
            }
        }
        //commit transaction
        await connection.commit();
        res.status(201).json({ 
            message: "✅ Thêm món thành công",
            MaMon: MaMon
        });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi khi thêm món"+ err.message });
    }finally{
        connection.release();
    }
};

// Cập nhật món
export const updateMon = async (req, res) => {
    const connection= await pool.getConnection();
    try {
        const { id } = req.params;
        const { TenMon, MoTa, MaLM, ChiTietMon } = req.body;
        
        if (!TenMon || !MaLM) {
            return res.status(400).json({ message: "Tên món, Loại món không được để trống" });
        }
        //bắt đầu transaction
        await connection.beginTransaction();
        let setClauses=["TenMon= ?", "MoTa= ?","MaLM= ?"];
        let value=[TenMon, MoTa || null, MaLM];
        //kiem tra file
        if(req.file){
            //co file moi thi cap nhat them vao setclauses(datkhoan)/value
            const HinhAnh= `/uploads/${req.file.filename}`;
            setClauses.push("HinhAnh = ?");
            value.push(HinhAnh);
        }
        const setString =setClauses.join(', ');
        const updateMon = `UPDATE Mon SET ${setString} WHERE MaMon = ?`;
        //them mamon vao cuoi mang value cho menh de where
        value.push(id);
        const [result] = await connection.query(updateMon, value);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy món" });
        }
        //cập nhật chi tiết món
        if(ChiTietMon){
            //xóa chi tiết món cũ
            await connection.query("DELETE FROM ChiTietMon WHERE MaMon= ?",[id]);
            //Parse và insert chi tiết món mới
            let chiTietArr=[];
            if(typeof ChiTietMon === 'string'){
                chiTietArr= JSON.parse(ChiTietMon);
            }else{
                chiTietArr=ChiTietMon;
            }
            //Insert lại chi tiết món
            if(chiTietArr && chiTietArr.length > 0){
                const insertChiTiet="INSERT INTO ChiTietMon (MaMon, KichCo, Gia, TrangThai) VALUES (?, ?, ?, ?)";
                
                for (const ct of chiTietArr){
                    if(ct.Gia && ct.Gia >0){
                        await connection.query(insertChiTiet,[
                            id,
                            ct.KichCo,
                            ct.Gia,
                            ct.TrangThai || 'Còn bán'
                        ])
                    }
                }
            }
        }
        await connection.commit();

        res.json({ message: "✅ Cập nhật món thành công" });
        
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi khi cập nhật món" + err.message });
    } finally {
        connection.release();
    }
};

//XÓA món
//(Kiểm tra an toàn: Không cho xóa nếu món đã có trong đơn hàng)
export const deleteMon = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const [orders] = await connection.query(`
            SELECT COUNT(*) as count 
            FROM ChiTietDonHang ctdh join ChiTietMon ctm ON ctdh.MaCTM = ctm.MaCTM 
            WHERE MaMon = ?`, [id]);
        
        if (orders[0].count > 0) {
            return res.status(400).json({ 
                message: "Không thể xóa món này vì đã có trong các đơn hàng đã đặt" 
            });
        }
        await connection.beginTransaction();
        // Xóa chi tiết món trước (do có foreign key)
        await connection.query("DELETE FROM ChiTietMon WHERE MaMon = ?", [id]);
        
        // Xóa đánh giá (nếu có)
        await connection.query("DELETE FROM DanhGia WHERE MaMon = ?", [id]);
        //xóa món
        const [result] = await connection.query("DELETE FROM Mon WHERE MaMon = ?", [id]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy món" });
        }


        await connection.commit();
        res.json({ message: "✅ Xóa món thành công" });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi khi xóa món: " + err.message });
    } finally {
        connection.release();
    }
};