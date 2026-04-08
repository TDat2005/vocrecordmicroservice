<?php
// Model: Khách Hàng (KhachHang)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng KhachHang

class KhachHangModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getProfile($customerId) {
        $stmt = $this->pdo->prepare("SELECT * FROM KhachHang WHERE MaKH = ?");
        $stmt->execute([$customerId]);
        return $stmt->fetch();
    }

    public function getByAccountId($maTK) {
        $stmt = $this->pdo->prepare("SELECT * FROM KhachHang WHERE MaTK = ?");
        $stmt->execute([$maTK]);
        return $stmt->fetch();
    }

    public function create($hoTen, $email, $maTK) {
        $stmt = $this->pdo->prepare("INSERT INTO KhachHang (HoTen, Email, MaTK) VALUES (?, ?, ?)");
        return $stmt->execute([$hoTen, $email, $maTK]);
    }

    public function updateProfile($customerId, $fullName, $phone, $address) {
        $stmt = $this->pdo->prepare("UPDATE KhachHang SET HoTen = ?, SoDienThoai = ?, DiaChi = ? WHERE MaKH = ?");
        return $stmt->execute([$fullName, $phone, $address, $customerId]);
    }

    public function getAll() {
        $stmt = $this->pdo->query("
            SELECT k.MaKH as id, k.HoTen as name, k.Email as email, k.SoDienThoai as phone, 
                   COUNT(d.MaDH) as totalOrders, SUM(d.TongTien) as totalSpent
            FROM KhachHang k
            LEFT JOIN DonHang d ON k.MaKH = d.MaKH
            GROUP BY k.MaKH
            ORDER BY k.MaKH DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAddresses($customerId) {
        $stmt = $this->pdo->prepare("SELECT * FROM SoDiaChi WHERE MaKH = ? ORDER BY MacDinh DESC, NgayTao DESC");
        $stmt->execute([$customerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addAddress($customerId, $nguoiNhan, $sdt, $diaChi) {
        // Kiểm tra xem đã tồn tại y hệt chưa
        $stmt = $this->pdo->prepare("SELECT MaDC FROM SoDiaChi WHERE MaKH = ? AND NguoiNhan = ? AND SoDienThoai = ? AND DiaChi = ?");
        $stmt->execute([$customerId, $nguoiNhan, $sdt, $diaChi]);
        if ($stmt->fetch()) {
            return false; // Đã tồn tại
        }

        $stmt = $this->pdo->prepare("INSERT INTO SoDiaChi (MaKH, NguoiNhan, SoDienThoai, DiaChi) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$customerId, $nguoiNhan, $sdt, $diaChi]);
    }
}
?>
