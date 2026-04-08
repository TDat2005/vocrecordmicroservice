<?php
// Model: Sản Phẩm (SanPham)
// Chứa các phương thức truy vấn CSDL liên quan đến bảng SanPham

class SanPhamModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll($category = null, $search = null) {
        $query = "SELECT sp.MaSP as id, sp.TenSP as title, sp.NgheSi as artist, dm.TenDM as genre, sp.GiaBan as price, sp.SoLuongTon as stock, sp.MoTa as description, sp.HinhAnh as image, sp.NamPhatHanh as year, sp.TinhTrang as status FROM SanPham sp LEFT JOIN DanhMuc dm ON sp.MaDM = dm.MaDM WHERE 1=1";
        $params = [];

        if ($category) {
            $query .= " AND dm.TenDM LIKE ?";
            $params[] = "%$category%";
        }
        if ($search) {
            $query .= " AND sp.TenSP LIKE ?";
            $params[] = "%$search%";
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT sp.MaSP as id, sp.TenSP as title, sp.NgheSi as artist, dm.TenDM as genre, sp.GiaBan as price, sp.SoLuongTon as stock, sp.MoTa as description, sp.HinhAnh as image, sp.NamPhatHanh as year, sp.TinhTrang as status FROM SanPham sp LEFT JOIN DanhMuc dm ON sp.MaDM = dm.MaDM WHERE MaSP = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($title, $artist, $genre, $price, $stock, $desc, $image, $year, $status, $maDM = 1) {
        $stmt = $this->pdo->prepare("INSERT INTO SanPham (TenSP, NgheSi, GiaBan, SoLuongTon, MoTa, HinhAnh, MaDM, TheLoai, NamPhatHanh, TinhTrang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $artist, $price, $stock, $desc, $image, $maDM, $genre, $year, $status]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $title, $artist, $genre, $price, $stock, $desc, $image, $year, $status, $maDM = 1) {
        $stmt = $this->pdo->prepare("UPDATE SanPham SET TenSP=?, NgheSi=?, GiaBan=?, SoLuongTon=?, MoTa=?, HinhAnh=?, MaDM=?, TheLoai=?, NamPhatHanh=?, TinhTrang=? WHERE MaSP=?");
        return $stmt->execute([$title, $artist, $price, $stock, $desc, $image, $maDM, $genre, $year, $status, $id]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM SanPham WHERE MaSP = ?");
        return $stmt->execute([$id]);
    }

    public function getDanhMucByName($name) {
        $stmt = $this->pdo->prepare("SELECT MaDM FROM DanhMuc WHERE TenDM = ?");
        $stmt->execute([$name]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCategories() {
        $stmt = $this->pdo->query("SELECT * FROM DanhMuc");
        return $stmt->fetchAll();
    }

    public function updateStock($id, $quantity) {
        $stmt = $this->pdo->prepare("UPDATE SanPham SET SoLuongTon = SoLuongTon + ? WHERE MaSP = ?");
        return $stmt->execute([$quantity, $id]);
    }

    public function decreaseStock($id, $quantity) {
        $stmt = $this->pdo->prepare("UPDATE SanPham SET SoLuongTon = SoLuongTon - ? WHERE MaSP = ? AND SoLuongTon >= ?");
        return $stmt->execute([$quantity, $id, $quantity]);
    }
}
?>
