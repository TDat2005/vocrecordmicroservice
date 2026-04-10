<?php
// Model: OTP Codes (OtpCodes)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng OtpCodes

class OtpModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Tạo OTP mới (hết hạn sau 5 phút)
     * Xóa OTP cũ cùng loại trước khi tạo mới
     */
    public function create($email, $code, $type = 'dangky') {
        // Xóa OTP cũ chưa dùng cùng loại
        $stmt = $this->pdo->prepare("DELETE FROM OtpCodes WHERE Email = ? AND LoaiOTP = ? AND DaSuDung = FALSE");
        $stmt->execute([$email, $type]);

        // Tạo OTP mới, hết hạn sau 5 phút
        $hetHan = date('Y-m-d H:i:s', strtotime('+5 minutes'));
        $stmt = $this->pdo->prepare("INSERT INTO OtpCodes (Email, MaCode, LoaiOTP, HetHan) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$email, $code, $type, $hetHan]);
    }

    /**
     * Xác thực OTP: kiểm tra đúng mã, chưa hết hạn, chưa sử dụng
     */
    public function verify($email, $code, $type = 'dangky') {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM OtpCodes 
             WHERE Email = ? AND MaCode = ? AND LoaiOTP = ? 
             AND DaSuDung = FALSE AND HetHan > NOW() 
             ORDER BY NgayTao DESC LIMIT 1"
        );
        $stmt->execute([$email, $code, $type]);
        return $stmt->fetch();
    }

    /**
     * Đánh dấu OTP đã sử dụng
     */
    public function markUsed($email, $code) {
        $stmt = $this->pdo->prepare("UPDATE OtpCodes SET DaSuDung = TRUE WHERE Email = ? AND MaCode = ?");
        return $stmt->execute([$email, $code]);
    }

    /**
     * Dọn dẹp OTP hết hạn
     */
    public function cleanExpired() {
        return $this->pdo->exec("DELETE FROM OtpCodes WHERE HetHan < NOW()");
    }
}
?>
