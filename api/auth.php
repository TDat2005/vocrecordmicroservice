<?php
// Router: Xác Thực (auth.php)
// Entry point - định tuyến request đến AuthController

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/AuthController.php';

header('Content-Type: application/json');

$db = new Database();
$pdo = $db->getConnection();
$controller = new AuthController($pdo);

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'register': $controller->register($data); break;
    case 'login':    $controller->login($data); break;
    default:
        echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ.']);
}
?>
