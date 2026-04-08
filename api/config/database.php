<?php
// Config: Kết nối CSDL (Database Connection)
// Cấu trúc MVC - Tầng Config

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

class Database {
    private $host = 'localhost';
    private $db   = 'clonevocrecord';
    private $user = 'root';
    private $pass = '';
    private $charset = 'utf8mb4';
    private $pdo;

    public function getConnection() {
        if ($this->pdo === null) {
            $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                $this->pdo = new PDO($dsn, $this->user, $this->pass, $options);
            } catch (\PDOException $e) {
                header('HTTP/1.1 500 Internal Server Error');
                echo json_encode(['success' => false, 'error' => 'Lỗi kết nối CSDL: ' . $e->getMessage()]);
                exit;
            }
        }
        return $this->pdo;
    }
}
?>
