<?php
require_once __DIR__ . '/config/database.php';
$db = new Database();
$pdo = $db->getConnection();

$sql = "CREATE TABLE IF NOT EXISTS SoDiaChi (
    MaDC INT AUTO_INCREMENT PRIMARY KEY,
    MaKH INT,
    NguoiNhan VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    DiaChi TEXT NOT NULL,
    MacDinh BOOLEAN DEFAULT 0,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE
)";
$pdo->exec($sql);
echo "Tạo bảng SoDiaChi thành công!";
?>
