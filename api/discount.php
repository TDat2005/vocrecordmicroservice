<?php
// Router: Mã Giảm Giá
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/DiscountController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = new Database();
$pdo = $db->getConnection();
$controller = new DiscountController($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true) ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action == 'get_all') {
        $controller->getAll();
    } else {
        echo json_encode(['success' => false, 'message' => 'Lỗi action GET']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action == 'check') {
        $controller->checkCode($data);
    } elseif ($action == 'create') {
        $controller->create($data);
    } else {
        echo json_encode(['success' => false, 'message' => 'Lỗi action POST']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if ($action == 'update') {
        $controller->update($data);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if ($action == 'delete') {
        // DELETE request hoac truyen qua body
        $idStr = $_GET['id'] ?? null;
        if($idStr) {
            $controller->delete(['id' => $idStr]);
        } else {
            $controller->delete($data);
        }
    }
}
?>
