<?php
// Router: Sản Phẩm (products.php)
// Entry point - định tuyến request đến ProductController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/ProductController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new ProductController($pdo);

$action = $_GET['action'] ?? 'list';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'list':       $controller->list(); break;
    case 'detail':     $controller->detail(); break;
    case 'categories': $controller->categories(); break;
    case 'create':     $controller->create($data); break;
    case 'update':     $controller->update($data); break;
    case 'delete':     $controller->delete($data); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ']);
}
?>
