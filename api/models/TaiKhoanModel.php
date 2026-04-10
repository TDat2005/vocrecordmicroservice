<?php
// Model: Tài Khoản (TaiKhoan)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng TaiKhoan

class TaiKhoanModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function findByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM TaiKhoan WHERE TenDangNhap = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public function create($username, $hashedPassword, $role = 'khachhang') {
        $stmt = $this->pdo->prepare("INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro) VALUES (?, ?, ?)");
        $stmt->execute([$username, $hashedPassword, $role]);
        return $this->pdo->lastInsertId();
    }

    public function updatePassword($maTK, $hashedPassword) {
        $stmt = $this->pdo->prepare("UPDATE TaiKhoan SET MatKhau = ? WHERE MaTK = ?");
        return $stmt->execute([$hashedPassword, $maTK]);
    }

    public function beginTransaction() { $this->pdo->beginTransaction(); }
    public function commit() { $this->pdo->commit(); }
    public function rollBack() { $this->pdo->rollBack(); }
}
?>
