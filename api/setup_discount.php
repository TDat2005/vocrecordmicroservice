<?php
require_once __DIR__ . '/config/database.php';
$db = new Database();
$pdo = $db->getConnection();

try {
    // 1. Tạo bảng MaGiamGia
    $sql1 = "CREATE TABLE IF NOT EXISTS MaGiamGia (
        MaGG INT AUTO_INCREMENT PRIMARY KEY,
        Code VARCHAR(50) UNIQUE NOT NULL,
        LoaiGiamGia ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
        GiaTri DECIMAL(15, 2) NOT NULL,
        DonHangToiThieu DECIMAL(15, 2) DEFAULT 0,
        SoLuong INT DEFAULT 0,
        DaDung INT DEFAULT 0,
        NgayHetHan TIMESTAMP NULL,
        NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql1);
    echo "Tạo bảng MaGiamGia thành công!\n";

    // 2. Thêm các cột vào DonHang nếu chưa có
    // Kiểm tra xem cột CodeGiamGia đã có chưa
    $checkSql = "SHOW COLUMNS FROM DonHang LIKE 'CodeGiamGia'";
    $stmt = $pdo->query($checkSql);
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE DonHang ADD COLUMN CodeGiamGia VARCHAR(50) NULL");
        echo "Thêm CodeGiamGia vào DonHang thành công!\n";
    }

    $checkSql2 = "SHOW COLUMNS FROM DonHang LIKE 'SoTienGiam'";
    $stmt2 = $pdo->query($checkSql2);
    if ($stmt2->rowCount() == 0) {
        $pdo->exec("ALTER TABLE DonHang ADD COLUMN SoTienGiam DECIMAL(15, 2) DEFAULT 0");
        echo "Thêm SoTienGiam vào DonHang thành công!\n";
    }

} catch (PDOException $e) {
    echo "Lỗi CSDL: " . $e->getMessage() . "\n";
}
?>
