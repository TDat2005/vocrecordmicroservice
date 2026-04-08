<?php
// Model: Nhân Viên (NhanVien)
// Chứa phương thức truy vấn CSDL liên quan đến bảng NhanVien và TaiKhoan

class NhanVienModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("
            SELECT nv.MaNV as id, tk.TenDangNhap as username, nv.HoTen as name, nv.ChucVu as position, tk.VaiTro as role, tk.TrangThai as status, tk.MaTK as account_id
            FROM NhanVien nv
            JOIN TaiKhoan tk ON nv.MaTK = tk.MaTK
            ORDER BY nv.MaNV DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createAuth($username, $hashedPassword, $role) {
        $stmt = $this->pdo->prepare("INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES (?, ?, ?, 1)");
        $stmt->execute([$username, $hashedPassword, $role]);
        return $this->pdo->lastInsertId();
    }

    public function createProfile($hoTen, $chucVu, $maTK) {
        $stmt = $this->pdo->prepare("INSERT INTO NhanVien (HoTen, ChucVu, MaTK) VALUES (?, ?, ?)");
        return $stmt->execute([$hoTen, $chucVu, $maTK]);
    }

    public function updateProfile($maNV, $hoTen, $chucVu) {
        $stmt = $this->pdo->prepare("UPDATE NhanVien SET HoTen = ?, ChucVu = ? WHERE MaNV = ?");
        return $stmt->execute([$hoTen, $chucVu, $maNV]);
    }

    public function updateAuth($maTK, $role) {
        $stmt = $this->pdo->prepare("UPDATE TaiKhoan SET VaiTro = ? WHERE MaTK = ?");
        return $stmt->execute([$role, $maTK]);
    }
    
    public function updatePassword($maTK, $hashedPassword) {
        $stmt = $this->pdo->prepare("UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?");
        return $stmt->execute([$hashedPassword, $maTK]);
    }

    public function toggleStatus($maTK, $status) {
        $stmt = $this->pdo->prepare("UPDATE TaiKhoan SET TrangThai = ? WHERE MaTK = ?");
        return $stmt->execute([$status, $maTK]);
    }

    // Transaction utilities
    public function beginTransaction() { $this->pdo->beginTransaction(); }
    public function commit() { $this->pdo->commit(); }
    public function rollBack() { $this->pdo->rollBack(); }
}
?>
